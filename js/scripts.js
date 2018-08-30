
var table = new Table();
var startingBank = 1500;
var cardRatio = 0.6
var cardWidth = 225*cardRatio
var cardHeight = 315*cardRatio

function Table() {
  this.players = [];
  this.communityCards = [];
  this.rounds = [
    "preStart",
    "preFlop",
    "flop",
    "turn",
    "river"
  ];
  this.blinds = {
    small: {
      amount: 40,
      player: undefined
    },
    big: {
      amount: 80,
      player: undefined
    }
  };
  this.headsUp = false;
  this.atBat;
  this.betOccurred = false;
  this.round = "";
  this.pot = 0;
  this.suits = [
    'hearts',
    'spades',
    'diamonds',
    'clubs'
  ];
  // this.ranks = [
  //   '2','3','4','5','6','7','8','9','10','jack','queen','king','ace'
  // ];
  this.ranks = [
    'ace','two','three','four','five','six','seven','eight','nine','ten','jack','queen','king'
  ];
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
          this.arrange(hand)
        }
        return isHand;
      },
      arrange: function(hand){
        hand.sortByValue()
      },
      breakTie: function(hand1, hand2){
        if (table.compareCards(hand1, hand2, 0) === "card1") {
          return hand1;
        } else if (table.compareCards(hand1, hand2, 0) === "card2") {
          return hand2;
        } else if (table.compareCards(hand1, hand2, 0) === "tie") {
          return "tie";
        }
      }
    },

    fourOfAKind: {
      evaluate: function(hand) {
        var isHand = (hand.instances[0] === 4);
        if (isHand) {
          this.arrange(hand)
        }
        return (isHand);
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
          return hand1;
        } else if (table.compareCards(hand1, hand2, 0) === "card2") {
          return hand2;
        } else if (table.compareCards(hand1, hand2, 0) === "tie") {
          if (table.compareCards(hand1, hand2, 4) === "card1") {
            return hand1;
          } else if (table.compareCards(hand1, hand2, 4) === "card2") {
            return hand2;
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
          this.arrange(hand)
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
          return hand1;
        } else if (table.compareCards(hand1, hand2, 0) === "card2") {
          return hand2;
        } else if (table.compareCards(hand1, hand2, 0) === "tie") {
          if (table.compareCards(hand1, hand2, 4) === "card1") {
            return hand1;
          } else if (table.compareCards(hand1, hand2, 4) === "card2") {
            return hand2;
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
          this.arrange
        }
        return isHand;
      },
      arrange: function(hand){
        hand.sortByValue()
      },
      breakTie: function(hand1, hand2){
        if (table.compareCards(hand1, hand2, 0) === "card1") {
          return hand1;
        } else if (table.compareCards(hand1, hand2, 0) === "card2") {
          return hand2;
        } else if (table.compareCards(hand1, hand2, 0) === "tie") {
          if (table.compareCards(hand1, hand2, 1) === "card1") {
            return hand1;
          } else if (table.compareCards(hand1, hand2, 1) === "card2") {
            return hand2;
          } else if (table.compareCards(hand1, hand2, 1) === "tie") {
            if (table.compareCards(hand1, hand2, 2) === "card1") {
              return hand1;
            } else if (table.compareCards(hand1, hand2, 2) === "card2") {
              return hand2;
            } else if (table.compareCards(hand1, hand2, 2) === "tie") {
              if (table.compareCards(hand1, hand2, 3) === "card1") {
                return hand1;
              } else if (table.compareCards(hand1, hand2, 3) === "card2") {
                return hand2;
              } else if (table.compareCards(hand1, hand2, 3) === "tie") {
                if (table.compareCards(hand1, hand2, 4) === "card1") {
                  return hand1;
                } else if (table.compareCards(hand1, hand2, 4) === "card2") {
                  return hand2;
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
          this.arrange(hand)
        }
        return isHand;
      },
      arrange: function(hand){
        hand.sortByValue()
      },
      breakTie: function(hand1, hand2){
        if (table.compareCards(hand1, hand2, 0) === "card1") {
          return hand1;
        } else if (table.compareCards(hand1, hand2, 0) === "card2") {
          return hand2;
        } else if (table.compareCards(hand1, hand2, 0) === "tie") {
          return "tie";
        }
      }
    },

    threeOfAKind: {
      evaluate: function(hand){
        var isHand = (hand.instances[0] === 3)
        if (isHand) {
          this.arrange(hand)
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
          return hand1;
        } else if (table.compareCards(hand1, hand2, 0) === "card2") {
          return hand2;
        } else if (table.compareCards(hand1, hand2, 0) === "tie") {
          if (table.compareCards(hand1, hand2, 3) === "card1") {
            return hand1;
          } else if (table.compareCards(hand1, hand2, 3) === "card2") {
            return hand2;
          } else if (table.compareCards(hand1, hand2, 3) === "tie") {
            if (table.compareCards(hand1, hand2, 4) === "card1") {
              return hand1;
            } else if (table.compareCards(hand1, hand2, 4) === "card2") {
              return hand2;
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
          this.arrange(hand)
        }
        return isHand;
      },
      arrange: function(hand){
        hand.sortByValue();
        if (hand.cards[0].rank !== hand.cards[1].rank) {

          hand.cards.push(hand.cards.shift());
        } else if (hand.cards[2].rank !== hand.cards[3].rank) {
          hand.cards.push(hand.cards.splice(2,1));
        }
      },
      breakTie: function(hand1, hand2){
        if (table.compareCards(hand1, hand2, 0) === "card1") {
          return hand1;
        } else if (table.compareCards(hand1, hand2, 0) === "card2") {
          return hand2;
        } else if (table.compareCards(hand1, hand2, 0) === "tie") {
          if (table.compareCards(hand1, hand2, 3) === "card1") {
            return hand1;
          } else if (table.compareCards(hand1, hand2, 3) === "card2") {
            return hand2;
          } else if (table.compareCards(hand1, hand2, 3) === "tie") {
            if (table.compareCards(hand1, hand2, 4) === "card1") {
              return hand1;
            } else if (table.compareCards(hand1, hand2, 4) === "card2") {
              return hand2;
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
          this.arrange(hand)
        }
        return isHand;
      },
      arrange: function(hand) {
        hand.sortByValue()
        for (var i=0; i<=3; i++) {
          if (hand.cards[i].rank === hand.cards[i+1].rank) {
            setArr = hand.cards.splice(i,2);
            hand.sortByValue(hand.cards)
            hand.cards = setArr.concat(hand.cards)
            continue;
          }
        }
      },
      breakTie: function(hand1, hand2){
        if (table.compareCards(hand1, hand2, 0) === "card1") {
          return hand1;
        } else if (table.compareCards(hand1, hand2, 0) === "card2") {
          return hand2;
        } else if (table.compareCards(hand1, hand2, 0) === "tie") {
          if (table.compareCards(hand1, hand2, 2) === "card1") {
            return hand1;
          } else if (table.compareCards(hand1, hand2, 2) === "card2") {
            return hand2;
          } else if (table.compareCards(hand1, hand2, 2) === "tie") {
            if (table.compareCards(hand1, hand2, 3) === "card1") {
              return hand1;
            } else if (table.compareCards(hand1, hand2, 3) === "card2") {
              return hand2;
            } else if (table.compareCards(hand1, hand2, 3) === "tie") {
              if (table.compareCards(hand1, hand2, 4) === "card1") {
                return hand1;
              } else if (table.compareCards(hand1, hand2, 4) === "card2") {
                return hand2;
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
          return hand1;
        } else if (table.compareCards(hand1, hand2, 0) === "card2") {
          return hand2;
        } else if (table.compareCards(hand1, hand2, 0) === "tie") {
          if (table.compareCards(hand1, hand2, 1) === "card1") {
            return hand1;
          } else if (table.compareCards(hand1, hand2, 1) === "card2") {
            return hand2;
          } else if (table.compareCards(hand1, hand2, 1) === "tie") {
            if (table.compareCards(hand1, hand2, 2) === "card1") {
              return hand1;
            } else if (table.compareCards(hand1, hand2, 2) === "card2") {
              return hand2;
            } else if (table.compareCards(hand1, hand2, 2) === "tie") {
              if (table.compareCards(hand1, hand2, 3) === "card1") {
                return hand1;
              } else if (table.compareCards(hand1, hand2, 3) === "card2") {
                return hand2;
              } else if (table.compareCards(hand1, hand2, 3) === "tie") {
                if (table.compareCards(hand1, hand2, 4) === "card1") {
                  return hand1;
                } else if (table.compareCards(hand1, hand2, 4) === "card2") {
                  return hand2;
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

  this.handKeys = Object.keys(this.handEvaluators)
  this.deck = [];
  this.board = [];
  this.roundIndex = 0;

}
Table.prototype.createDeck = function(){
  this.suits.forEach(function(suit,i){
    this.ranks.forEach(function(rank,j){
      this.deck.push(new Card(suit,rank) )
    },this);
  },this)
}
table.createDeck();
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
  return output;
}
Table.prototype.changeTurn = function(playerIndex) {
  this.atBat = this.players[playerIndex];
  // $('.player').removeClass('at-bat');
  this.atBat.div.addClass('at-bat')
  console.log("|||||||||| It's " + this.atBat.name + "'s turn!")
}
Table.prototype.deal = function(amount) {
  var self = this
  if (amount === 2) {
    for (var p=0; p<this.players.length; p++) {
      var player = this.players[p];
      for (var i=0; i<amount; i++) {
        var newCard = self.deck.shift()
        player.holeCards.push(newCard);
      }
    };
  } else {
    for (var i=0; i<amount; i++) {
      var newCard = self.deck.shift()
      this.communityCards.push(newCard);
      $('#community-area').append(newCard.div)
    }
  }
}
Table.prototype.advanceRound = function() {
  this.betThisRound = false;
  table.roundIndex++
  var roundName = table.rounds[table.roundIndex];
  if (!table.rounds[table.roundIndex]) {
    // begin end sequence
  } else if (roundName === "preFlop") {
    if (this.players.length === 2) {
      this.headsUp = true;
      this.dealer = this.atBat = this.players[0];
      this.players[0].blind = this.blinds.small;
      this.players[1].blind = this.blinds.big;
      this.blinds.small['player'] = this.players[0]
      this.blinds.big['player'] = this.players[1]
      // this.deal(3)
      this.deal(2);
      this.players[0].changeBankAmountBy(-this.blinds.small.amount);
      this.pot += this.blinds.small.amount
      this.players[1].changeBankAmountBy(-this.blinds.big.amount);
      this.pot += this.blinds.big.amount
      $('#playerOneBank').text(this.players[0].bank);
      $('#playerTwoBank').text(this.players[1].bank);
      $('#call-check').text("Call");
      $('#bet-raise').text("Raise");
      $('#call-check').off();
      $('#call-check').click(function(){
        var player = table.atBat
        if (player.blind && player.blind === table.blinds.small) {
          var amount = table.blinds.small.amount
          player.changeBankAmountBy(-amount);
          table.pot += amount
          if (table.players.indexOf(player) === 0) {
            $('#playerOneBank').text(player.bank);
          } else {
            $('#playerTwoBank').text(player.bank);
          }
        }
      });
    }
  }
}
Table.prototype.handIndex = function(handKey) {
  var keyArr = Object.keys(this.hands);
  console.log(handKey);
  console.log(keyArr);
  console.log(keyArr.indexOf(handKey));
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
}
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
  var len = bestArr.len;
  if (len === 1) {
    return bestArr[0];
  } else {
    for (var i = 0; i < len - 1; i++) {
      // here, what I want to do is call the specific breakTie function associated with the handValue key stored in variable handType, with hands bestArr[i] and bestArr[i+1] as arguments, then remove the losing hand from bestArr before moving on to the next step in the loop.
    }
  }
}
Table.prototype.findWinner = function () {
  // compare player final hands, return winning player
}

function Card(suit, rank) {
  this.suit = suit;
  this.rank = rank;
  this.cardHTML = `<div class="playing-card" id="`+this.rank+`-of-`+this.suit+`"></div>`;
  this.getValue = function(){
    return table.ranks.slice().reverse().indexOf(this.rank)
  }
  this.place = function (targetElement,replace) {
    replace ? $(targetElement).html(this.cardHTML) : $(targetElement).append(this.cardHTML);
    this.div = $('#'+this.rank+`-of-`+this.suit);
    var pos = {};
    pos.left = table.ranks.indexOf(this.rank) * cardWidth;
    pos.top = table.suits.indexOf(this.suit) * cardHeight;
    this.div.css({
      'background-image': 'url(img/cardsheet.png)',
      'background-size': (cardWidth*13)+'px '+(cardHeight*4)+'px',
      'background-position': '-' + pos.left + 'px -' + pos.top + 'px',
      'background-repeat': 'no-repeat',
      'width': cardWidth + 'px',
      'height': cardHeight + 'px',
    });
  }
  this.flip = function(instant) {
    this.div.css({
      'background-image': 'url(img/cardback.png)',
      'background-size': (cardWidth)+'px '+(cardHeight)+'px',
      'background-position': '0',
    });
  }

  this.value = this.getValue();
}
function Hand(arr) {
  this.cards = arr;
  this.instances = getInstances(this.cards)
  this.handValue = table.evaluateHand(this);
}
Hand.prototype.sortByValue = function(cardArr=this.cards) {
  cardArr.sort(function(card1, card2){
     return card1.value - card2.value;
  })
  return cardArr;
}
function getInstances(cardArray) {
  var instances = 1;
  var instancesArr = [1, 1, 1, 1, 1];
  for (var i = 0; i <= 4; i++) {
    for (var j = 1; j <= 4; j++) {
      if (cardArray[0].rank === cardArray[j].rank) {
        instancesArr[i] = instancesArr[i] + 1;
      }
    }
    cardArray.push(cardArray.splice(0, 1)[0]);
  }
  instancesArr = instancesArr.sort(function (a, b) {
    return b - a;
  });
  return instancesArr;
}
function Player(human, name, bank) {
  this.human = human;
  this.name = name;
  this.bank = bank;
  this.bet = 0;
  this.holeCards = [];
  this.finalFive = [];
  this.hand = undefined;
  this.blind = undefined;
  this.currentBet = {
    type: "",
    amount: 0
  }
  table.players[table.players.length] = this
  this.div = $('#player' + table.players.length);
}
Player.prototype.amountLeft = function (action, amount) {
  var amountLeft = 0
  if ((action === "check") || (action === "call")) {
    amountLeft = this.bank
  } else if ((action === "bet") || (action === "raise")) {
    amountLeft = this.bank - amount;
  } else if (action === "allIn") {
    amountLeft = 0
  }
  return amountLeft;
}
Player.prototype.changeBankAmountBy = function (amount) {
  this.bank += amount
}
$(document).ready(function() {
  document.body.style.setProperty('--card-width',cardWidth+'px');
  document.body.style.setProperty('--card-height',cardHeight+'px');
  $("#enterName").submit(function (event) {
    event.preventDefault();
    console.log("-------------------- GAME INITIATED -------------------")
    $("#enterName").hide();
    $("#container").show();
    var name1 = ( $("#name1").val() || "Player 1" )
    var name2 = ( $("#name2").val() || "Player 2" )
    table = new Table();
    new Player(true, name1, startingBank);
    new Player(true, name2, startingBank);
    $('#playerOneName').text(name1)
    $('#playerTwoName').text(name2)
    table.advanceRound();
    table.changeTurn(0);
  });
});

// Function just for testing purposes, will shuffle the deck, create a five card hand object.
function fiveCardHand() {
  var newDeck = table.shuffle();
  var cards = [];
  for (i = 0; i <= 4; i++) {
    cards.push(newDeck.pop());
  }
  var hand = new Hand(cards);
  return hand;
}
// Pre-built common hands for testing purposes.

card1 = new Card("diamonds", "five");
card2 = new Card("diamonds", "six");
card3 = new Card("diamonds", "seven");
card4 = new Card("diamonds", "eight");
card5 = new Card("diamonds", "nine");
reallyGoodCards = [card3, card1, card2, card5, card4];
straightFlush = new Hand(reallyGoodCards);

card1 = new Card("diamonds", "ace");
card2 = new Card("diamonds", "king");
card3 = new Card("diamonds", "queen");
card4 = new Card("diamonds", "jack");
card5 = new Card("diamonds", "ten");
reallyGoodCards = [card1, card2, card3, card4, card5];
royalFlush = new Hand(reallyGoodCards);

card1 = new Card("diamonds", "two");
card2 = new Card("diamonds", "seven");
card3 = new Card("diamonds", "nine");
card4 = new Card("diamonds", "four");
card5 = new Card("diamonds", "queen");
reallyGoodCards = [card1, card2, card3, card4, card5];
flush = new Hand(reallyGoodCards);

card1 = new Card("clubs", "five");
card2 = new Card("diamonds", "six");
card3 = new Card("spades", "seven");
card4 = new Card("diamonds", "eight");
card5 = new Card("hearts", "nine");
reallyGoodCards = [card1, card2, card3, card4, card5];
straight = new Hand(reallyGoodCards);

card1 = new Card("diamonds", "three");
card2 = new Card("clubs", "three");
card3 = new Card("spades", "three");
card4 = new Card("diamonds", "eight");
card5 = new Card("spades", "eight");
reallyGoodCards = [card4, card3, card1, card2, card5];
fullHouse = new Hand(reallyGoodCards);

card1 = new Card("diamonds", "five");
card2 = new Card("clubs", "five");
card3 = new Card("hearts", "five");
card4 = new Card("spades", "five");
card5 = new Card("diamonds", "king");
reallyGoodCards = [card1, card2, card5, card3, card4];
fourOfAKind = new Hand(reallyGoodCards);

card1 = new Card("diamonds", "six");
card2 = new Card("clubs", "six");
card3 = new Card("hearts", "six");
card4 = new Card("spades", "six");
card5 = new Card("diamonds", "king");
reallyGoodCards = [card1, card2, card5, card3, card4];
fourOfAKind2 = new Hand(reallyGoodCards);

card1 = new Card("diamonds", "seven");
card2 = new Card("clubs", "seven");
card3 = new Card("spades", "seven");
card4 = new Card("diamonds", "two");
card5 = new Card("diamonds", "jack");
reallyGoodCards = [card1, card5, card2, card3, card4];
threeOfAKind = new Hand(reallyGoodCards);

card1 = new Card("diamonds", "five");
card2 = new Card("diamonds", "six");
card3 = new Card("diamonds", "seven");
card4 = new Card("diamonds", "eight");
card5 = new Card("diamonds", "nine");
reallyGoodCards = [card1, card2, card3, card4, card5];
straightFlush = new Hand(reallyGoodCards);

card1 = new Card("diamonds", "five");
card2 = new Card("clubs", "five");
card3 = new Card("diamonds", "seven");
card4 = new Card("spades", "seven");
card5 = new Card("hearts", "two");
reallyGoodCards = [card1, card5, card2, card4, card3];
twoPair = new Hand(reallyGoodCards);

card1 = new Card("diamonds", "ace");
card2 = new Card("clubs", "jack");
card3 = new Card("diamonds", "king");
card4 = new Card("hearts", "ace");
card5 = new Card("hearts", "three");
reallyGoodCards = [card1, card2, card3, card4, card5];
pair = new Hand(reallyGoodCards);
//
//
//
card6 = new Card("spades", "jack");
card7 = new Card("diamonds", "four");
sevenCardArr = [card1, card2, card3, card4, card5, card6, card7]
