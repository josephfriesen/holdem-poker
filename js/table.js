var table = new Table();
var lobby = {};
function Table() {
  this.handsPlayed = 0;
  this.handWinner = undefined;
  this.startingBank = 1500;
  this.players = [];
  this.calledOrChecked = [];
  this.communityCards = [];
  this.dealtCards = [];
  
  this.rounds = [
    "preStart",
    "preFlop",
    "flop",
    "turn",
    "river",
    "showdown"
  ];
  this.bigBlind = 80;
  this.dealer;
  this.atBat;
  this.minimumBet = this.bigBlind;
  this.round = "";
  this.pot = 0;
  this.autoDealing = false;
  this.vsCPU = false;
  this.cpu = undefined;
  this.cpuMessages = {
    "preFlop": [
      "Computer seems upset with its cards.",
      "Computer seems neutral about its cards.",
      "Computer seems okay with its cards.",
      "Computer looks excited about its cards.",
      "Computer is struggling to play it cool.",
      "Computer can barely contain its joy."
    ],
    "flop": [
      "Computer seems disappointed with its cards.",
      "Computer seems neutral about its cards.",
      "Computer seems okay with its cards.",
      "Computer looks pleased with its cards.",
      "Computer seems quite confident in its cards.",
      "Computer appears very happy about its cards.",
      "Computer is struggling to play it cool.",
      "Computer can barely contain its joy."
    ],
    "turn": [
      "Computer seems disappointed with its cards.",
      "Computer seems neutral about its cards.",
      "Computer seems okay with its cards.",
      "Computer looks pleased with its cards.",
      "Computer seems quite confident in its cards.",
      "Computer appears very happy about its cards.",
      "Computer is struggling to play it cool.",
      "Computer can barely contain its joy."
    ],
    "river": [
      "Computer seems disappointed with its cards.",
      "Computer seems neutral about its cards.",
      "Computer seems okay with its cards.",
      "Computer looks pleased with its cards.",
      "Computer seems quite confident in its cards.",
      "Computer appears very happy about its cards.",
      "Computer is struggling to play it cool.",
      "Computer can barely contain its joy."
    ]
  }
  this.suits = [
    'hearts',
    'spades',
    'diamonds',
    'clubs'
  ];
  this.ranks = [
    'two','three','four','five','six','seven','eight','nine','ten','jack','queen','king','ace'
  ];
  this.handInfo = {
    royalFlush: {
      fullName: "a Royal Flush",
      cardsInvolved: 5
    },
    straightFlush: {
      fullName: "a Straight Flush",
      cardsInvolved: 5
    },
    fourOfAKind: {
      fullName: "Four of a Kind",
      cardsInvolved: 4
    },
    fullHouse: {
      fullName: "a Full House",
      cardsInvolved: 5
    },
    flush: {
      fullName: "a Flush",
      cardsInvolved: 5
    },
    straight: {
      fullName: "a Straight",
      cardsInvolved: 5
    },
    threeOfAKind: {
      fullName: "Three of a Kind",
      cardsInvolved: 3
    },
    twoPair: {
      fullName: "Two Pair",
      cardsInvolved: 4
    },
    pair: {
      fullName: "a Pair",
      cardsInvolved: 2
    },
    highCard: {
      fullName: "High Card",
      cardsInvolved: 1
    }
  }
  this.handEvaluators = {
    royalFlush: {
      evaluate: function(hand){
        var aceCheck = false;
        for (var i = 0; i <= 4; i++) {
          if (hand.cards[i].rank === "ace") {
            aceCheck = true;
          }
        }
        var isHand = (table.handEvaluators.flush.evaluate(hand) && table.handEvaluators.straight.evaluate(hand) && aceCheck)
        if (isHand) {
          this.arrange(hand);
        }
        return isHand;
      },
      arrange: function(hand){
          hand.sortByValue();
      },
      breakTie: function(hand1, hand2) {
        return "tie";
      }
    },
    straightFlush: {
      evaluate: function(hand) {
        var isHand = (table.handEvaluators.flush.evaluate(hand) && table.handEvaluators.straight.evaluate(hand));
        if (isHand) {
          this.arrange(hand);
        }
        return isHand;
      },
      arrange: function(hand){
        hand.sortByValue();
      },
      breakTie: function(hand1, hand2){
        if (table.compareCards(hand1, hand2, 0) === "card1") {
          return "hand1";
        } else if (table.compareCards(hand1, hand2, 0) === "card2") {
          return "hand2";
        } else if (table.compareCards(hand1, hand2, 0) === "tie") {
          return "tie";
        }
      }
    },
    fourOfAKind: {
      evaluate: function(hand) {
        var isHand = (hand.instances[0] === 4);
        if (isHand) {
          this.arrange(hand);
        }
        return isHand;
      },
      arrange: function(hand){
        var setArr = hand.cards.slice();
        hand.sortByValue(setArr);
        if (setArr[0].rank !== setArr[1].rank) {
          setArr.push(setArr.shift());
        }
        hand.cards = setArr;
      },
      breakTie: function(hand1, hand2){
        if (table.compareCards(hand1, hand2, 0) === "card1") {
          return "hand1";
        } else if (table.compareCards(hand1, hand2, 0) === "card2") {
          return "hand2";
        } else if (table.compareCards(hand1, hand2, 0) === "tie") {
          if (table.compareCards(hand1, hand2, 4) === "card1") {
            return "hand1";
          } else if (table.compareCards(hand1, hand2, 4) === "card2") {
            return "hand2";
          } else if (table.compareCards(hand1, hand2, 4) === "tie") {
            return "tie";
          }
        }
      }
    },
    fullHouse: {
      evaluate: function(hand){
        var isHand = (hand.instances[0] === 3 && hand.instances[3] === 2)
        if (isHand) {
          this.arrange(hand);
        }
        return isHand;
      },
      arrange: function(hand){
        var setArr = hand.cards.slice();
        hand.sortByValue(setArr);
        if (setArr[1].rank !== setArr[2].rank) {
          var dud1 = setArr.shift();
          var dud2 = setArr.shift();
          setArr.push(dud1);
          setArr.push(dud2);
        }
        hand.cards = setArr;
      },
      breakTie: function(hand1,hand2){
        if (table.compareCards(hand1, hand2, 0) === "card1") {
          return "hand1";
        } else if (table.compareCards(hand1, hand2, 0) === "card2") {
          return "hand2";
        } else if (table.compareCards(hand1, hand2, 0) === "tie") {
          if (table.compareCards(hand1, hand2, 4) === "card1") {
            return "hand1";
          } else if (table.compareCards(hand1, hand2, 4) === "card2") {
            return "hand2";
          } else if (table.compareCards(hand1, hand2, 4) === "tie") {
            return "tie";
          }
        }
      }
    },
    flush: {
      evaluate: function(hand){
        var isHand = (hand.cards[0].suit === hand.cards[1].suit && hand.cards[1].suit === hand.cards[2].suit && hand.cards[2].suit === hand.cards[3].suit && hand.cards[3].suit === hand.cards[4].suit);
        if (isHand) {
          this.arrange(hand);
        }
        return isHand;
      },
      arrange: function(hand){
        hand.sortByValue();
      },
      breakTie: function(hand1, hand2){
        if (table.compareCards(hand1, hand2, 0) === "card1") {
          return "hand1";
        } else if (table.compareCards(hand1, hand2, 0) === "card2") {
          return "hand2";
        } else if (table.compareCards(hand1, hand2, 0) === "tie") {
          if (table.compareCards(hand1, hand2, 1) === "card1") {
            return "hand1";
          } else if (table.compareCards(hand1, hand2, 1) === "card2") {
            return "hand2";
          } else if (table.compareCards(hand1, hand2, 1) === "tie") {
            if (table.compareCards(hand1, hand2, 2) === "card1") {
              return "hand1";
            } else if (table.compareCards(hand1, hand2, 2) === "card2") {
              return "hand2";
            } else if (table.compareCards(hand1, hand2, 2) === "tie") {
              if (table.compareCards(hand1, hand2, 3) === "card1") {
                return "hand1";
              } else if (table.compareCards(hand1, hand2, 3) === "card2") {
                return "hand2";
              } else if (table.compareCards(hand1, hand2, 3) === "tie") {
                if (table.compareCards(hand1, hand2, 4) === "card1") {
                  return "hand1";
                } else if (table.compareCards(hand1, hand2, 4) === "card2") {
                  return "hand2";
                } else if (table.compareCards(hand1, hand2, 4) === "tie") {
                  return "tie"
                }
              }
            }
          }
        }
      }
    },
    straight: {
      evaluate: function(hand){
        var isHand = false;
        var uniqueArr = [1,1,1,1,1];
        for (var n = 0; n <= 4; n++) {
          if (hand.instances[n] !== uniqueArr[n]) {
            return isHand;
          }
        }
        hand.sortByValue();
        var straightsList = [[ "ace", "five", "four", "three", "two" ],
        [ "six", "five", "four", "three", "two" ],
        [ "seven", "six", "five", "four", "three" ],
        [ "eight", "seven", "six", "five", "four" ],
        [ "nine", "eight", "seven", "six", "five" ],
        [ "ten", "nine", "eight", "seven", "six" ],
        [ "jack", "ten", "nine", "eight", "seven" ],
        [ "queen", "jack", "ten", "nine", "eight" ],
        [ "king", "queen", "jack", "ten", "nine" ],
        [ "ace", "king", "queen", "jack", "ten" ]
        ];
        straightsList.forEach(function(straight) {
          if (hand.cards[0].rank === straight[0] && hand.cards[1].rank === straight[1] && hand.cards[2].rank === straight[2] && hand.cards[3].rank === straight[3] && hand.cards[4].rank === straight[4]) {
            isHand = true;
          };
        })
        if (isHand) {
          this.arrange(hand);
        }
        return isHand;
      },
      arrange: function(hand){
        hand.sortByValue();
      },
      breakTie: function(hand1, hand2){
        if (table.compareCards(hand1, hand2, 0) === "card1") {
          return "hand1";
        } else if (table.compareCards(hand1, hand2, 0) === "card2") {
          return "hand2";
        } else if (table.compareCards(hand1, hand2, 0) === "tie") {
          return "tie";
        }
      }
    },

    threeOfAKind: {
      evaluate: function(hand){
        var isHand = (hand.instances[0] === 3)
        if (isHand) {
          this.arrange(hand);
        }
        return isHand;
      },
      arrange: function(hand){
        var setArr = hand.cards.slice();
        setArr = hand.sortByValue(setArr);
        var dudArr = [];
        var dud1;
        var dud2;
        if (setArr[4].rank === setArr[3].rank) {
          dud1 = setArr.shift();
          dud2 = setArr.shift();
          setArr.push(dud1);
          setArr.push(dud2);
        } else if (setArr[3].rank === setArr[2].rank) {
          dud1 = setArr.shift();
          dud2 = setArr.pop();
          setArr.push(dud1);
          setArr.push(dud2);
        }
        hand.cards = setArr;
      },
      breakTie: function(hand1, hand2){
        if (table.compareCards(hand1, hand2, 0) === "card1") {
          return "hand1";
        } else if (table.compareCards(hand1, hand2, 0) === "card2") {
          return "hand2";
        } else if (table.compareCards(hand1, hand2, 0) === "tie") {
          if (table.compareCards(hand1, hand2, 3) === "card1") {
            return "hand1";
          } else if (table.compareCards(hand1, hand2, 3) === "card2") {
            return "hand2";
          } else if (table.compareCards(hand1, hand2, 3) === "tie") {
            if (table.compareCards(hand1, hand2, 4) === "card1") {
              return "hand1";
            } else if (table.compareCards(hand1, hand2, 4) === "card2") {
              return "hand2";
            } else if (table.compareCards(hand1, hand2, 4) === "tie") {
              return "tie";
            }
          }
        }
      }
    },
    twoPair: {
      evaluate: function(hand){
        var isHand = (hand.instances[0] === 2 && hand.instances[2] === 2);
        if (isHand) {
          this.arrange(hand);
        }
        return isHand;
      },
      arrange: function(hand){
        hand.sortByValue();
        if (hand.cards[0].rank !== hand.cards[1].rank) {

          hand.cards.push(hand.cards.shift());
        } else if (hand.cards[2].rank !== hand.cards[3].rank) {
          hand.cards.push(hand.cards.splice(2,1)[0]);
        }
      },
      breakTie: function(hand1, hand2){
        if (table.compareCards(hand1, hand2, 0) === "card1") {
          return "hand1";
        } else if (table.compareCards(hand1, hand2, 0) === "card2") {
          return "hand2";
        } else if (table.compareCards(hand1, hand2, 0) === "tie") {
          if (table.compareCards(hand1, hand2, 3) === "card1") {
            return "hand1";
          } else if (table.compareCards(hand1, hand2, 3) === "card2") {
            return "hand2";
          } else if (table.compareCards(hand1, hand2, 3) === "tie") {
            if (table.compareCards(hand1, hand2, 4) === "card1") {
              return "hand1";
            } else if (table.compareCards(hand1, hand2, 4) === "card2") {
              return "hand2";
            } else if (table.compareCards(hand1, hand2, 4) === "tie") {
              return "tie";
            }
          }
        }
      }
    },
    pair: {
      evaluate: function(hand){
        var isHand = (hand.instances[0] === 2 && hand.instances[2] === 1);
        var setArr = [];
        if (isHand) {
          this.arrange(hand);
        }
        return isHand;
      },
      arrange: function(hand) {
        hand.sortByValue();
        for (var i=0; i<=3; i++) {
          if (hand.cards[i].rank === hand.cards[i+1].rank) {
            setArr = hand.cards.splice(i,2);
            hand.sortByValue(hand.cards);
            hand.cards = setArr.concat(hand.cards);
            continue;
          }
        }
      },
      breakTie: function(hand1, hand2){
        if (table.compareCards(hand1, hand2, 0) === "card1") {
          return "hand1";
        } else if (table.compareCards(hand1, hand2, 0) === "card2") {
          return "hand2";
        } else if (table.compareCards(hand1, hand2, 0) === "tie") {
          if (table.compareCards(hand1, hand2, 2) === "card1") {
            return "hand1";
          } else if (table.compareCards(hand1, hand2, 2) === "card2") {
            return "hand2";
          } else if (table.compareCards(hand1, hand2, 2) === "tie") {
            if (table.compareCards(hand1, hand2, 3) === "card1") {
              return "hand1";
            } else if (table.compareCards(hand1, hand2, 3) === "card2") {
              return "hand2";
            } else if (table.compareCards(hand1, hand2, 3) === "tie") {
              if (table.compareCards(hand1, hand2, 4) === "card1") {
                return "hand1";
              } else if (table.compareCards(hand1, hand2, 4) === "card2") {
                return "hand2";
              } else if (table.compareCards(hand1, hand2, 4) === "tie") {
                return "tie";
              }
            }
          }
        }
      }
    },
    highCard: {
      evaluate: function(hand) {
        return (hand.instances[0] === 1);
      },
      arrange: function(hand){
        hand.sortByValue();
      },
      breakTie: function(hand1, hand2){
        if (table.compareCards(hand1, hand2, 0) === "card1") {
          return "hand1";
        } else if (table.compareCards(hand1, hand2, 0) === "card2") {
          return "hand2";
        } else if (table.compareCards(hand1, hand2, 0) === "tie") {
          if (table.compareCards(hand1, hand2, 1) === "card1") {
            return "hand1";
          } else if (table.compareCards(hand1, hand2, 1) === "card2") {
            return "hand2";
          } else if (table.compareCards(hand1, hand2, 1) === "tie") {
            if (table.compareCards(hand1, hand2, 2) === "card1") {
              return "hand1";
            } else if (table.compareCards(hand1, hand2, 2) === "card2") {
              return "hand2";
            } else if (table.compareCards(hand1, hand2, 2) === "tie") {
              if (table.compareCards(hand1, hand2, 3) === "card1") {
                return "hand1";
              } else if (table.compareCards(hand1, hand2, 3) === "card2") {
                return "hand2";
              } else if (table.compareCards(hand1, hand2, 3) === "tie") {
                if (table.compareCards(hand1, hand2, 4) === "card1") {
                  return "hand1";
                } else if (table.compareCards(hand1, hand2, 4) === "card2") {
                  return "hand2";
                } else if (table.compareCards(hand1, hand2, 4) === "tie") {
                  return "tie"
                }
              }
            }
          }
        }
      }
    }
  }
  this.handKeys = Object.keys(this.handEvaluators);
  this.deck = [];
  this.board = [];
  this.roundIndex = 0;
};
Table.prototype.playerCoords = function(playerIndex) {
  var coords = {x:0,y:0}
  coords.x = (this.players[playerIndex].div.offset().left+(this.players[playerIndex].div.width()/2));
  coords.y = (this.players[playerIndex].div.offset().top+(this.players[playerIndex].div.height()/2));
  return coords
}
Table.prototype.placeOrb = function(playerIndex) {
  var playerCoords = this.playerCoords(playerIndex)
  this.turnOrb.css({
    'left': playerCoords.x +'px',
    'top': playerCoords.y +'px',
  });
}
Table.prototype.moveOrb = function(playerIndex) {
  var playerCoords = this.playerCoords(playerIndex);
  var orbX =  (this.turnOrb.css('left'));
  if (playerCoords.x !== orbX) {
    
    if (playerIndex === 0) {
      this.turnOrb.css({
        'animation-name': 'bob-down'
      })
    } else {
      this.turnOrb.css({
        'animation-name': 'bob-up'
      })
    }
    this.turnOrb.fadeIn(1)
    this.turnOrb.css({
      'animation-play-state': 'running'
    })
    var self = this;
    var playerCoords = this.playerCoords(playerIndex)
    this.turnOrb.animate({
      'left': playerCoords.x + 'px',
      'top': playerCoords.y + 'px'
    },600,function(){
      self.turnOrb.css({
        'animation-play-state': 'paused'
      })
    });
    setTimeout(function(){
      self.turnOrb.fadeOut(200)
    },300)
  }
}
Table.prototype.refresh = function() {
  this.handWinner = undefined;
  this.calledOrChecked = [];
  this.communityCards = [];
  this.dealtCards = [];
  this.deck = [];
  this.board = [];
  this.roundIndex = 0;
  this.dealing = false;
  this.autoDealing = false;
  this.minimumBet = this.bigBlind;
  $('.holeCard').empty();
  $('.commCard').empty();
}
Table.prototype.initiateGame = function(playerNameArray){
  this.turnOrb = $('#turn-orb');
  this.slots = [
    $('.commCard:first-child'),
    $('.commCard:nth-child(2)'),
    $('.commCard:nth-child(3)'),
    $('.commCard:nth-child(4)'),
    $('.commCard:nth-child(5)')
  ];
  playerNameArray.forEach(function(name,i){
    new Player(this, playerNameArray[i] !== "Computer", name, this.startingBank);
    if (i===0) {
      $('#player-1-name').text(name);
    } else {
      $('#player-2-name').text(name);
    }
  },this);
  this.vsCPU = !this.players[1].human;
  if (this.vsCPU) {
    this.cpu = this.players[1];
  }
  if (this.cpu) {
    $('.space-flip').css({
      'opacity': '0'
    });
  } else {
    $('.game-button').fadeIn();
  }
  
  this.setDealer(this.players[(this.handsPlayed % 2)]);
  this.atBat = this.players[((this.handsPlayed+1) % 2)];
  this.dealer.blind = this.dealer.currentBet = this.bigBlind;
  this.atBat.blind = this.atBat.currentBet = this.bigBlind/2;
  this.atBat = this.dealer;
  $('#funds').val(this.bigBlind);
  $('#top-message').fadeIn();
  this.createDeck();
  this.shuffle();
  this.advanceRound();
  this.placeOrb(this.players.indexOf(this.atBat),true)
}
Table.prototype.showStatusLabel = function(player) {
  var playerNum = this.players.indexOf(player)+1;
  $('.status-label').css({
    'opacity': '0'
  });
  $('#dealer-'+playerNum).animate({
    'opacity': '1'
  },300);
}
Table.prototype.setDealer = function(newDealer) {
  this.dealer = newDealer;
  var playerNum = this.players.indexOf(this.dealer)+1;
  $('.status-label').css({
    'opacity': '0'
  });
  $('#dealer-'+playerNum).animate({
    'opacity': '1'
  },300);
}
Table.prototype.startNewHand = function() {
  if (this.pot) {
    clearInterval(this.drainSequence)
    this.handWinner.bank += this.pot;
    this.pot = 0;
  }
  this.changeButtonSelection();
  this.players.forEach(function(player,i) {
    player.swapLabel();
    player.holeCards = [];
    player.hand = undefined;
    player.confidence = 0;
  });
  this.handsPlayed++;
  this.setDealer(this.players[(this.handsPlayed % 2)]);
  this.atBat = this.players[((this.handsPlayed+1) % 2)];
  this.dealer.blind = this.dealer.currentBet = this.bigBlind;
  this.atBat.blind = this.atBat.currentBet = (this.bigBlind/2);
  this.atBat.div.addClass('at-bat');
  this.dealer.statusLabel.addClass('status-label');  
  this.dealer.div.removeClass('at-bat');
  this.dealer.statusLabel.removeClass('winner-label');
  this.atBat = this.dealer;
  // $('.holeCard').removeClass('protruding');
  $('#funds').val(this.bigBlind);
  $('.playing-card').fadeOut(200);
  $('#top-message').animate({
    'opacity': '0',
  },200,function(){
    $('#top-message').css({
    'cursor':'default',
    'animation-play-state':'initial',
    'transform': 'scale(0.75)'
    });
    $('#top-message').addClass('space-flip')
    $('#top-message').removeClass('space-next')
  });
  $('.win-lose-message').fadeOut();
  $('.game-button').prop("disabled", false);
  $('#call-check').text("Call " + this.minimumBet);
  $('#bet-raise').text("Raise " + this.bigBlind);
  this.refresh();
  this.createDeck();
  this.shuffle();
  var self = this;
  setTimeout(function(){
    self.advanceRound();
  },800);
  
}
Table.prototype.changeButtonSelection = function(handOver,gameOver) {
  var self = this;
  if (gameOver) {
    $('.game-button').hide();
    $('#new-hand').fadeIn();
    $('#new-hand').text("New Game");
    $('#new-hand').off().click(function(){
      window.location.reload();
    });
  } else if (handOver) {
    $('.game-button').hide();
    $('#new-hand').fadeIn();
    $('#new-hand').off().click(function(){
      self.startNewHand()
    });
  } else {
    $('.post-game-button').hide();    
    $('.game-button').fadeIn();    
  }
}
Table.prototype.createDeck = function(){
  this.suits.forEach(function(suit,i){
    this.ranks.forEach(function(rank,j){
      this.deck.push(new Card(suit,rank));
    },this)
  },this)
}
Table.prototype.compareCards = function(hand1, hand2, index) {
  if (this.ranks.indexOf(hand1.cards[index].rank) > this.ranks.indexOf(hand2.cards[index].rank)) {
    return "card1";
  } else if (this.ranks.indexOf(hand1.cards[index].rank) < this.ranks.indexOf(hand2.cards[index].rank)) {
    return "card2";
  } else if (this.ranks.indexOf(hand1.cards[index].rank) === this.ranks.indexOf(hand2.cards[index].rank)) {
    return "tie";
  }
}
Table.prototype.shuffle = function() {
  var newDeck = [];
  this.deck.forEach(function(card) {
    newDeck.push(card);
  })
  var len = newDeck.length;
  var output = [];
  var limit;
  var rand;
  for (var j = 0; j < len; j++) {
    limit = len - j;
    rand = Math.floor(Math.random() * (limit));
    output.push(newDeck[rand]);
    newDeck.splice(rand,1);
  }
  this.deck = output;
  return output;
}
Table.prototype.advanceTurn = function() {  
  if (this.roundIndex > 1) {
    if (!this.minimumBet && this.calledOrChecked.length === 0) {
      // first bet = player after dealer (always non-dealer in 2P game)
      if (this.players.indexOf(this.dealer)+1 < this.players.length) {
        var playerIndex = this.players.indexOf(this.dealer)+1
      } else {
        var playerIndex = 0;
      }
      
    } else {
      if (this.players.indexOf(this.atBat)+1 < this.players.length) {
        var playerIndex = this.players.indexOf(this.atBat)+1
      } else {
        var playerIndex = 0;
      }
    }
  } else if (this.roundIndex === 1) {
    if (!this.minimumBet && this.calledOrChecked.length === 0) {
      for (var i=0; i<this.players.length; i++) {
        var player = this.players[i];
        if (player.blind == this.bigBlind) {
          if (i < this.players.length-1) {
            playerIndex = i+1
          } else {
            playerIndex = 0
          }
          continue
        }
      }
    } else {
      if (this.players.indexOf(this.atBat)+1 < this.players.length) {
        var playerIndex = this.players.indexOf(this.atBat)+1
      } else {
        var playerIndex = 0;
      }
    }
  }
  var previousBatter = this.atBat;
  this.atBat = this.players[playerIndex];
  if (this.roundIndex > 1 && this.atBat !== previousBatter) {
    console.log("moving orb")
    this.moveOrb(this.players.indexOf(this.atBat));
  }
  // see if player has money
  if (!this.atBat.bank) {
    if (!this.autoDealing) {
      this.autoDealing = true;
      this.advanceRound(true);
    }
    return;
  }
  $('.player').removeClass('at-bat');
  this.atBat.div.addClass('at-bat');
  $('.game-button').prop('disabled', false)
  $('#funds').val(this.bigBlind); // default bet/raise amount
  // decide which buttons to disable or change
  if (this.minimumBet) {
    // a bet exists
    var betAmount = this.minimumBet;
    var raiseAmount = parseInt($('#funds').val());
    var totalStake = (this.atBat.bank+this.atBat.currentBet)
    $('#call-check').text("Call " + betAmount);
    $('#bet-raise').text("Raise " + raiseAmount);
    if (totalStake < (betAmount+raiseAmount)) {
      // not enough to raise
      console.log("not enough to raise")
      $('#bet-raise').prop("disabled", true);
    }
    if (totalStake < betAmount) {
      // not enough to call
      console.log("not enough to call")
      $('#call-check').prop("disabled", true);
      $('#bet-raise').prop("disabled", true);
    }
  }
  if (this.atBat === this.cpu) {
    var makeCPUMove = true
    if (makeCPUMove) {
      $('.game-button').fadeIn();
      if (this.roundIndex === 2) {
        var delay = 3000
      } else {
        var delay = this.atBat.moveDelay
      }
      this.atBat.makeMove(delay);
    } else {
      // $('.game-button').animate({
      //   'opacity': '1'
      // },300);
    }
  } else {
    $('.game-button').fadeIn();
  }
}
Table.prototype.deal = function(amount) {
  var self = this;
  this.dealing = true;
  if (amount === 2) { // hole
    for (var p=0; p<this.players.length; p++) {
      var player = this.players[p];
      for (var i=0; i<amount; i++) {
        var newCard = self.deck.shift()
        player.holeCards.push(newCard);
        if (this.vsCPU) {
          var isCPU = (player === this.cpu);
          var cpuTurn = (this.atBat === this.cpu)
          // newCard.place(player.slots[i],true,isCPU,isCPU);
          newCard.place(player.slots[i],true,false,false);
        } else {
          newCard.place(player.slots[i],true,true,true);
        }
        
      }
    }
  } else { // community
    $('.game-button').prop("disabled", true);
    if (amount === 3) {
      var newCard = self.deck.shift();
      this.communityCards.push(newCard);
      newCard.place(this.slots[0],true,true);
      setTimeout(function(){
        var newCard2 = self.deck.shift();
        self.communityCards.push(newCard2);
        newCard2.place(self.slots[1],true,true);
        setTimeout(function(){
          var newCard3 = self.deck.shift();
          self.communityCards.push(newCard3);
          newCard3.place(self.slots[2],true,true);
          if (!self.autoDealing) {
            setTimeout(function(){
              if (self.atBat === self.cpu) {
                $('.game-button').hide()
                $('#thinking-message').fadeIn()
              } else {
                $('.game-button').prop("disabled", false);
              }
              
              self.dealing = false;
             
            },480)
          }
        },500);
      },500);
    } else {
      var startAt = this.communityCards.length;
      var newCard = this.deck.shift();
      this.communityCards.push(newCard);
      newCard.place(this.slots[startAt],true,true);
      if (!self.autoDealing) {
        setTimeout(function(){
          if (self.atBat === self.cpu) {
            $('.game-button').hide()
          } else {
            $('.game-button').prop("disabled", false);
          }
          self.dealing = false;
        },500)
      }
    }    
  }
  if (this.autoDealing) {
    var roundsLeft = this.rounds.length-this.roundIndex
    var totalDelay = 0
    for (var i=1; i<roundsLeft; i++) {
      var currentIndex = (this.roundIndex+i);      
      if (currentIndex === 3) {
        totalDelay += 1600; // how long to wait to deal turn card (waits for 3 flop cards)
      } else if (currentIndex === 5) {
        totalDelay += 1000; // how long to wait to show hand results after river
      } else {
        totalDelay += 600; // how long to wait to deal river (waits for turn card)
      }
      setTimeout(function(){
        table.advanceRound();
      },totalDelay);
    }
  } 
}
Table.prototype.advanceRound = function(handOver) {
  this.calledOrChecked = [];
  this.roundIndex++;
  if (this.roundIndex > 1) {
    this.players[0].currentBet = 0;
    this.players[1].currentBet = 0;
    this.minimumBet = 0;
    $('#funds').val(this.bigBlind); 
  }
  var roundName = this.rounds[this.roundIndex];
  
  if (roundName === "preFlop") {
    this.players[0].addToPot(this.players[0].blind,true); // compulsory bets
    this.players[1].addToPot(this.players[1].blind,true);
    this.deal(2); // hole cards
    // starts call/raise because of blinds
    $('#call-check').text("Call " + table.minimumBet);
    $('#bet-raise').text("Raise " + table.bigBlind);
    this.updateFigures();
  } else if (roundName === "flop") {
    this.deal(3,handOver);
    $('#call-check').text("Check");
    $('#bet-raise').text("Bet " + table.bigBlind);
  } else if (roundName === "turn") {
    this.deal(1,handOver);
    $('#call-check').text("Check");
    $('#bet-raise').text("Bet " + table.bigBlind);
  } else if (roundName === "river") {
    this.deal(1,handOver);
    $('#call-check').text("Check");
    $('#bet-raise').text("Bet " + table.bigBlind);
  } else if (roundName === "showdown") {
    this.atBat.div.removeClass("at-bat");
    $('.game-button').prop('disabled','true');

    var self = this;
    setTimeout(function(){ // pause for suspense
      self.beginShowdown()
    },500);
  }
  if (roundName !== "showdown") {
    this.advanceTurn();
  }
}
Table.prototype.handIndex = function(handKey) {
  var keyArr = Object.keys(this.hands);
  return keyArr.indexOf(handKey);
}
Table.prototype.getHands = function(multiCardArray) {
  var handArray = [];
  var badCard1;
  var badCard2;
  var fiveCardArr = [];
  var newHand;
  var len = multiCardArray.length - 1;
  for (var i = 0; i < len; i++) {
    badCard1 = multiCardArray[i];
    for (var j = i+1; j <= len; j++) {
      badCard2 = multiCardArray[j];
      fiveCardArr = multiCardArray.filter(function(card) {
        return card != badCard1;
      });
      fiveCardArr = fiveCardArr.filter(function(card) {
        return card != badCard2;
      });
      newHand = new Hand(fiveCardArr);
      handArray.push(newHand);
      fiveCardArr = [];
    }
  }
  return handArray;
}
Table.prototype.evaluateHand = function(hand) {
  for (handKey in this.handEvaluators) {
    if (this.handEvaluators[handKey].evaluate(hand)) {
      return handKey;
    }
  }
};
Table.prototype.findBestHand = function(handArray) {
  var bestHand = 9;
  handArray.forEach(function(hand) {
    if (table.handKeys.indexOf(hand.handValue) < bestHand) {
      bestHand = table.handKeys.indexOf(hand.handValue);
    }
  })
  bestArr = [];
  handArray.forEach(function(hand) {
    if (table.handKeys.indexOf(hand.handValue) === bestHand) {
      bestArr.push(hand);
    }
  })
  var handType = bestArr[0].handValue;
  var len = bestArr.length;
  if (len === 1) {
    return bestArr[0];
  } else {
    for (var i = 0; i < len - 1; i++) {
      if (this.handEvaluators[handType].breakTie(bestArr[0], bestArr[1]) === "hand1") {
        bestArr.splice(1,1);
      } else {
        bestArr.shift();
      }
      // here, what I want to do is call the specific breakTie function associated with the handValue key stored in variable handType, with hands bestArr[i] and bestArr[i+1] as arguments, then remove the losing hand from bestArr before moving on to the next step in the loop.
    }
  }
  return bestArr[0];
}
Table.prototype.findWinner = function (player1, player2) {
  if (table.handKeys.indexOf(player1.hand.handValue) < table.handKeys.indexOf(player2.hand.handValue)) {
    return player1;
  } else if (table.handKeys.indexOf(player1.hand.handValue) > table.handKeys.indexOf(player2.hand.handValue)) {
    return player2;
  } else {
    var handType = player1.hand.handValue;
    if (this.handEvaluators[handType].breakTie(player1.hand, player2.hand) === "hand1") {
      return player1;
    } else if (this.handEvaluators[handType].breakTie(player1.hand, player2.hand) === "hand2") {
      return player2;
    } else {
      return "tie";
    }
  }
};
Table.prototype.numberOfSuit = function(arr,suit) {
  var suits = 0;
  arr.forEach(function(card){
    if (card.suit === suit) {
      suits++
    }
  })
  return suits;
}
Table.prototype.numberOfRank = function(arr,rank) {
  var ranks = 0;
  arr.forEach(function(card){
    if (card.rank === rank) {
      ranks++
    }
  })
  return rank;
}

Table.prototype.beginShowdown = function() {
  var arr1 = this.players[0].holeCards.concat(this.communityCards);
  var handArr1 = this.getHands(arr1);
  this.players[0].hand = this.findBestHand(handArr1);
  var arr2 = this.players[1].holeCards.concat(this.communityCards);
  var handArr2 = this.getHands(arr2);
  this.players[1].hand = this.findBestHand(handArr2);
  this.handWinner = this.findWinner(this.players[0], this.players[1]);
  
  if (this.handWinner === "tie") {
    var half = Math.round(this.pot/2);
    this.players[0].addToPot(-half);
    this.players[1].addToPot(-this.pot);
    if (this.players[0].hand.handValue === "highCard") {
      var appendage = " " + this.players[0].hand.cards[0].rank;
    } else {
      var appendage = "";
    }
    $('#winner-message').text("It's a tie!");
    $('#loser-message').text("Both players have " + this.handInfo[this.players[0].hand.handValue].fullName + appendage);
    $('.win-lose-message').fadeIn();
    // this.atBat.div.removeClass("at-bat");
    this.atBat.statusLabel.removeClass("status-label");
    this.atBat.statusLabel.removeClass("winner-label");
    this.revealHands();
    this.showHandResults(true);
    this.updateFigures();
  } else {
    this.handWinner.handsWon++;
    if (this.players.indexOf(this.handWinner) === 0) {
      var loser  = this.players[1];
    } else {
      var loser = this.players[0];
    }
    this.drainPot(this.handWinner);
    this.updateFigures();
    this.showStatusLabel(this.handWinner);
    this.handWinner.statusLabel.addClass("winner-label");
    if (this.handWinner.hand.value === "highCard") {
      var appendage1 = " " + this.handWinner.hand.cards[0].rank;
      var appendage2 = " " + loser.hand.cards[0].rank;
    } else {
      var appendage1 = "";
      var appendage2 = "";
    }
    $('#winner-message').text(this.handWinner.name + " wins with " + this.handInfo[this.handWinner.hand.handValue].fullName + appendage1);
    $('#loser-message').text(loser.name + " had " + this.handInfo[loser.hand.handValue].fullName + appendage2);
    $('.win-lose-message').fadeIn();
    this.revealHands();
    this.showHandResults();
  }
};
Table.prototype.revealHands = function(){
  this.players[0].div.removeClass('at-bat');
  this.players[1].div.removeClass('at-bat');
  this.players[0].holeCards[0].animateFlip("front");
  this.players[0].holeCards[1].animateFlip("front");
  this.players[1].holeCards[0].animateFlip("front");
  this.players[1].holeCards[1].animateFlip("front");
  // $('.holeCard').addClass('protruding');
}
Table.prototype.showHandResults = function(notHand){
  if (this.handWinner.hand) {
    var winningHand = this.handWinner.hand;
    var involvedCards = this.handInfo[winningHand.handValue].cardsInvolved;
    for (var i=0; i<this.dealtCards.length; i++) {
      var card = this.dealtCards[i];
      if (winningHand.cards.indexOf(card) > -1 && winningHand.cards.indexOf(card) < involvedCards) {
        card.div.addClass('protruding');
      } else {
        card.div.css({
          'opacity': '0.4',
        })
      }
      
    }
  }
  $('#top-message').removeClass('space-flip');
  $('#top-message').removeClass('space-next');
  var gameOver = false;
  this.players.forEach(function(player,i){
    if (!player.bank) {
      gameOver = true;
    }
  })
  if (gameOver) {
    $('#top-message').removeClass('space-next');
    $('#top-message').removeClass('space-flip');
    $('#top-message').html("<span>WINNER: " + this.handWinner.name + " with " + this.handWinner.handsWon + "/" + (this.handsPlayed+1) + " hands won</span>");
    var topCursor = "initial"
  } else {
    $('#top-message').addClass('space-next');
    var topCursor = "pointer"
  }
  this.changeButtonSelection(true,gameOver);
  $('.game-button').prop("disabled", false);
  $('#top-message').animate({
    'opacity': '1'
  },500,function(){
    $('#top-message').css({
      'cursor': topCursor,
      'animation-play-state':'running',
      'transform': 'scale(1)'
    });
    
  });
}
Table.prototype.drainPot = function(winner) {
  var self = this;
  this.drainSequence = setInterval(function(){
    winner.addToPot(-1)
    self.updateFigures()
    if (!self.pot) {
      clearInterval(self.drainSequence);
    }
  },5)
}
Table.prototype.updateFigures = function() {
  $('#pot-amount').text(this.pot);
  $('#player-1-bank').text(this.players[0].bank);
  $('#player-2-bank').text(this.players[1].bank);
  $('#player-1-bet').text(this.players[0].currentBet);
  $('#player-2-bet').text(this.players[1].currentBet);
  if (this.cpu) {
    $('#player-2-name').html("Computer : "+this.cpu.confidence);
  }
};
