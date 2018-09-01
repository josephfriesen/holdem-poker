var table = new Table();
var lobby = {};
function Table() {
  this.handsPlayed = 0;
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
  this.suits = [
    'hearts',
    'spades',
    'diamonds',
    'clubs'
  ];
  this.ranks = [
    'ace','two','three','four','five','six','seven','eight','nine','ten','jack','queen','king'
  ];
  this.fullHandNames = {
    royalFlush: "a Royal Flush",
    straightFlush: "a Straight Flush",
    fourOfAKind: "Four of a Kind",
    fullHouse: "a Full House",
    flush: "a Flush",
    straight: "a Straight",
    threeOfAKind: "Three of a Kind",
    twoPair: "Two Pair",
    pair: "a Pair",
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
      breakTie: function(){
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
Table.prototype.refresh = function() {
  this.calledOrChecked = [];
  this.communityCards = [];
  this.dealtCards = [];
  this.deck = [];
  this.board = [];
  this.roundIndex = 0;
  this.minimumBet = this.bigBlind
}
Table.prototype.initiateGame = function(playerNameArray){
  this.slots = [
    $('.commCard:first-child'),
    $('.commCard:nth-child(2)'),
    $('.commCard:nth-child(3)'),
    $('.commCard:nth-child(4)'),
    $('.commCard:nth-child(5)')
  ];
  playerNameArray.forEach(function(name,i){
    new Player(true, name, this.startingBank);
    if (i===0) {
      $('#playerOneName').text(name);
    } else {
      $('#playerTwoName').text(name);
    }
  },this);
  this.setDealer(this.players[(this.handsPlayed % 2)]);
  this.atBat = this.players[((this.handsPlayed+1) % 2)];
  this.dealer.blind = this.dealer.currentBet = this.bigBlind;
  this.atBat.blind = this.atBat.currentBet = this.bigBlind/2;
  this.dealer.hole.removeClass('at-bat');
  this.atBat.hole.addClass('at-bat');
  $('#funds').val(this.bigBlind);
  this.createDeck();
  this.shuffle();
  this.advanceRound();
}
Table.prototype.setDealer = function(newDealer) {
  this.dealer = newDealer;
  var playerNum = this.players.indexOf(this.dealer)+1;
  $('.dealer-label').css({
    'opacity': '0'
  })
  $('#dealer-'+playerNum).animate({
    'opacity': '1'
  },300);
}
Table.prototype.startNewHand = function() {
  this.players.forEach(function(player,i) {
    player.holeCards = [];
    player.hand = undefined;
  });
  this.handsPlayed++;
  this.setDealer(this.players[(this.handsPlayed % 2)]);
  this.atBat = this.players[((this.handsPlayed+1) % 2)];
  this.dealer.blind = this.dealer.currentBet = this.bigBlind;
  this.atBat.blind = this.atBat.currentBet = (this.bigBlind/2);
  this.dealer.statusLabel.removeClass('winning-label')
  this.dealer.hole.removeClass('at-bat');
  this.atBat.hole.addClass('at-bat');
  $('.holeCard').removeClass('protruding')
  $('#funds').val(this.bigBlind);
  $('.playing-card').remove();
  $('#space-for-next').fadeOut();
  $('#winner-message').fadeOut();
  $('button').prop("disabled", false);
  $('#call-check').text("Call " + this.minimumBet);
  $('#bet-raise').text("Raise " + this.bigBlind);
  this.deck = [];
  this.refresh();
  this.createDeck();
  this.shuffle();
  this.advanceRound(); // calls table.updateFigures
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
  if (this.players.indexOf(this.atBat)+1 < this.players.length) {
    var playerIndex = this.players.indexOf(this.atBat)+1;
  } else {
    var playerIndex = 0;
  }
  this.atBat = this.players[playerIndex];
  $('.hole').removeClass('at-bat');
  this.atBat.hole.addClass('at-bat');
  $('#funds').val(this.bigBlind);
  if (this.minimumBet) {
    $('#bet-raise').text("Raise " + this.bigBlind);
  }
}
Table.prototype.deal = function(amount) {
  var self = this;
  if (amount === 2) { // hole
    for (var p=0; p<this.players.length; p++) {
      var player = this.players[p];
      for (var i=0; i<amount; i++) {
        var newCard = self.deck.shift()
        player.holeCards.push(newCard);
        newCard.place(player.slots[i],true,true,true);
      }
    };
  } else { // community
    $('button').prop("disabled", true);
    if (amount === 3) {
      var newCard = self.deck.shift();
      this.communityCards.push(newCard);
      newCard.place(this.slots[0],true,true);
      setTimeout(function(){
        var newCard = self.deck.shift();
        self.communityCards.push(newCard);
        newCard.place(self.slots[1],true,true);
      },480);
      setTimeout(function(){
        var newCard = self.deck.shift();
        self.communityCards.push(newCard);
        newCard.place(self.slots[2],true,true);
      },960);
      setTimeout(function(){
        $('button').prop("disabled", false);
      },1440)
    } else {
      var startAt = this.communityCards.length;
      console.log(this.deck)
      var newCard = this.deck.shift();
      this.communityCards.push(newCard);
      newCard.place(this.slots[startAt],true,true);
      setTimeout(function(){
        $('button').prop("disabled", false);
      },480)
    }    
  }
}
Table.prototype.advanceRound = function() {
  this.roundIndex++;
  var roundName = this.rounds[this.roundIndex];
  if (!this.rounds[this.roundIndex]) {
    // console.log("no more rounds to advance to")
    // table.beginShowdown should not allow this to be reached
    return;
  } else if (roundName === "preFlop") {
    // console.log("play 1 " + this.players[0].blind)
    // console.log("play 2 " + this.players[1].blind)
    this.players[0].addToPot(this.players[0].blind); // compulsory bets
    this.players[1].addToPot(this.players[1].blind);
    this.deal(2); // hole cards
    $('#call-check').text("Call " + table.minimumBet);
    $('#bet-raise').text("Raise " + table.bigBlind);
    this.updateFigures();
  } else if (roundName === "flop") {
    this.deal(3);
    // console.log("DEAL")
    // console.log(this.dealer)
    // console.log("ATBAT")
    // console.log(this.atBat)
    $('#call-check').text("Check");
    $('#bet-raise').text("Bet " + table.bigBlind);
  } else if (roundName === "turn") {
    this.deal(1);
    $('#call-check').text("Check");
    $('#bet-raise').text("Bet " + table.bigBlind);
  } else if (roundName === "river") {
    this.deal(1);
    $('#call-check').text("Check");
    $('#bet-raise').text("Bet " + table.bigBlind);
  } else if (roundName === "showdown") {
    this.beginShowdown()
  }
  if (this.roundIndex > 1) {
    this.players[0].currentBet = 0;
    this.players[1].currentBet = 0;
    this.minimumBet = 0;
    $('#funds').val(this.bigBlind)
    // table.updateFigures();
  }
  table.calledOrChecked = [];
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
}
Table.prototype.beginShowdown = function() {
  var arr1 = this.players[0].holeCards.concat(this.communityCards);
  var handArr1 = this.getHands(arr1);
  this.players[0].hand = this.findBestHand(handArr1);
  var arr2 = this.players[1].holeCards.concat(this.communityCards);
  var handArr2 = this.getHands(arr2);
  this.players[1].hand = this.findBestHand(handArr2);
  var winner = this.findWinner(this.players[0], this.players[1]);
  if (winner === "tie") {
    console.log("IT'S A TIE >>>>>>>>>>>>>>>>>>>>>>>>>>")
    // tie stuff
  } else {
    if (this.players.indexOf(winner) === 0) {
      var loser  = this.players[1]
    } else {
      var loser = this.players[0]
    }
    var winnings = this.pot;
    winner.addToPot(-this.pot);
    this.setDealer(winner);
    winner.statusLabel.addClass("winning-label")
    $('#winner-message').text(winner.name + " wins with " + table.fullHandNames[winner.hand.handValue]);
    $('#winner-message').fadeIn();
    $('button').prop("disabled", true);
    this.players[0].hole.removeClass('at-bat');
    this.players[1].hole.removeClass('at-bat');
    this.players[0].holeCards[0].animateFlip("front");
    this.players[0].holeCards[1].animateFlip("front");
    this.players[1].holeCards[0].animateFlip("front");
    this.players[1].holeCards[1].animateFlip("front");
    var self = this
    setTimeout(function(){
      self.dealtCards.forEach(function(card,i){
        card.div.addClass('dimmed')
      });
      winner.hand.cards.forEach(function(card,i) {
        card.div.removeClass('dimmed')
      });
    },180)
    $('.holeCard').addClass('protruding');
    $('#space-for-next').fadeIn();
    var self = this;
    console.log("loser hand: " + loser.hand.handValue);
  }
}
Table.prototype.updateFigures = function() {
  $('#pot').text("Pot: " + this.pot);
  $('#playerOneBank').text(this.players[0].bank);
  $('#playerTwoBank').text(this.players[1].bank);
  $('#playerOneBet').text(this.players[0].currentBet);
  $('#playerTwoBet').text(this.players[1].currentBet);
};
