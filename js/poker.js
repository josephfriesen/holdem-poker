  var poker = {
    rounds: [
    "preStart",
    "preFlop",
    "flop",
    "turn",
    "river",
    "showdown"
  ],
  cpuMessages: {
    "preFlop": [
      " seems upset with its cards.",
      " seems neutral about its cards.",
      " seems okay with its cards.",
      " looks excited about its cards.",
      " is struggling to play it cool.",
      " can barely contain its joy."
    ],
    "flop": [
      " seems disappointed with its cards.",
      " seems neutral about its cards.",
      " seems okay with its cards.",
      " looks pleased with its cards.",
      " seems quite confident in its cards.",
      " appears very happy about its cards.",
      " is struggling to play it cool.",
      " can barely contain its joy."
    ],
    "turn": [
      " seems disappointed with its cards.",
      " seems neutral about its cards.",
      " seems okay with its cards.",
      " looks pleased with its cards.",
      " seems quite confident in its cards.",
      " appears very happy about its cards.",
      " is struggling to play it cool.",
      " can barely contain its joy."
    ],
    "river": [
      " seems disappointed with its cards.",
      " seems neutral about its cards.",
      " seems okay with its cards.",
      " looks pleased with its cards.",
      " seems quite confident in its cards.",
      " appears very happy about its cards.",
      " is struggling to play it cool.",
      " can barely contain its joy."
    ]
  },
  suits: [
    'hearts',
    'spades',
    'diamonds',
    'clubs'
  ],
  ranks: [
    'two','three','four','five','six','seven','eight','nine','ten','jack','queen','king','ace'
  ],
  handInfo: {
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
  },
  handActions: {
    royalFlush: {
      evaluate: function(hand){
        var aceCheck = false;
        for (var i = 0; i <= 4; i++) {
          if (hand.cards[i].rank === "ace") {
            aceCheck = true;
          }
        }
        var isHand = (poker.handActions.flush.evaluate(hand) && poker.handActions.straight.evaluate(hand) && aceCheck)
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
        var isHand = (poker.handActions.flush.evaluate(hand) && poker.handActions.straight.evaluate(hand));
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
  },
}
poker.handKeys = Object.keys(poker.handActions)