var table = new Table();
var startingBank = 1500;
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
  this.pot = 100;
  this.suits = [
    'hearts',
    'spades',
    'diamonds',
    'clubs'
  ];
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
        if (isHand) {
          hand.sortByValue()
        }
      },
      breakTie: function(hand1,hand2) {

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
      breakTie: function(hand1,hand2){

      }
    },
    fourOfAKind: {
      evaluate: function(hand) {
        var isHand = (hand.instances[0] === 4);
        if (isHand) {
          this.arrange(hand)
        }
        return isHand;
      },
      arrange: function(hand){
        hand.sortByValue();
        var setArr = hand.cards.slice();
        var dudArr = [];
        hand.cards.forEach(function(card,i) {
          if (hand.instances[i] === 1) {
            dudArr.push(setArr.splice(i,1)[0]);
          }
        });
        dudArr.forEach(function(cardObj,i) {
          setArr.push(cardObj);
        });
        hand.cards = setArr
      },
      breakTie: function(hand1,hand2){

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
        hand.sortByValue();
        if (hand.cards[0].rank !== hand.cards[2].rank) { // if first !== third
          // put the last three first
          var pair = hand.cards.splice(0,2);
          hand.cards.push(pair[0],pair[1])
        }
      },
      breakTie: function(hand1,hand2){

      }
    },
    flush: {
      evaluate: function(hand){
        var isHand = (hand.cards[0].suit === hand.cards[1].suit && hand.cards[1].suit === hand.cards[2].suit && hand.cards[2].suit === hand.cards[3].suit && hand.cards[3].suit === hand.cards[4].suit);
        if (isHand) {
          this.arrange(hand)
        }
        return isHand;
      },
      arrange: function(hand){
        hand.sortByValue()
      },
      breakTie: function(hand1,hand2){

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
        var straightsList = [["two", "three", "four", "five", "ace"],
        ["two", "three", "four", "five", "six"],
        ["three", "four", "five", "six", "seven"],
        ["four", "five","six", "seven", "eight"],
        ["five", "six", "seven", "eight", "nine"],
        ["ten", "six", "seven", "eight", "nine"],
        ["ten", "seven", "eight", "nine", "jack"],
        ["ten", "eight", "nine", "jack", "queen"],
        ["ten", "nine", "jack", "king", "queen"],
        ["ten", "ace", "jack", "king", "queen"]
        ];
        straightsList.forEach(function(straight) {
          if (hand.cards[0] === straight[0] && hand.cards[1] === straight[1] && hand.cards[2] === straight[2] && hand.cards[3] === straight[3] && hand.cards[4] === straight[4]) {
            isHand = true;
          };
        })
        if (isHand) {
          this.arrange(hand)
        }
        return isHand;
      },
      arrange: function(hand){
        hand.sortByValue();
      },
      breakTie: function(hand1,hand2){

      }
    },
    threeOfAKind: {
      evaluate: function(hand){
        var isHand = (hand.instances[0] === 3);
        var setArr = hand.cards.slice();
        var dudArr = [];
        if (isHand) {
          this.arrange(hand);
        }
        return isHand;
      },
      arrange: function(hand){
        hand.sortByValue(dudArr);
        hand.cards.forEach(function(card,i) {
          if (hand.instances[i] !== 3) {
            dudArr.push(card)
            setArr.splice(setArr.indexOf(card),1)
          }
        });
        dudArr.forEach(function(cardObj,i) {
          setArr.push(cardObj);
        });
        hand.cards = setArr;
      },
      breakTie: function(hand1,hand2){

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
          hand.cards.push(hand.cards.splice(2,1));
        }
      },
      breakTie: function(hand1,hand2){

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
      breakTie: function(hand1,hand2){

      }
    },
    highCard: {
      evaluate: function(hand) {
        hand.sortByValue()
        return (hand.instances[0] === 1);
      },
      arrange: function(hand){

      },
      breakTie: function(hand1,hand2) {

      }
    }
  }
  this.handKeys = Object.keys(this.handEvaluators);
  this.deck = [];
  this.board = [];
  this.roundIndex = 0;
};
Table.prototype.initiateGame = function(playerNameArray){
  this.slots = [
    $('.commCard:first-child'),
    $('.commCard:nth-child(2)'),
    $('.commCard:nth-child(3)'),
    $('.commCard:nth-child(4)'),
    $('.commCard:nth-child(5)'),
  ];
  playerNameArray.forEach(function(name,i){
    new Player(true, name, startingBank);
    if (i===0) {
      $('#playerOneName').text(name);
    } else {
      $('#playerTwoName').text(name);
    }
  })
  this.dealer = this.players[0];
  this.players[0].blind = this.blinds.small.amount;
  this.players[1].blind = this.blinds.big.amount;
  this.blinds.small['player'] = this.players[0];
  this.blinds.big['player'] = this.players[1];
  this.createDeck();
  this.shuffle();
  this.advanceRound();
  this.advanceTurn();
}
Table.prototype.createDeck = function(){
  var self = this;
  this.suits.forEach(function(suit){
    self.ranks.forEach(function(rank){
      self.deck.push(new Card(suit,rank));
    });
  });
};
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
    var playerIndex = 0
  }
  this.atBat = this.players[playerIndex];
  $('.hole').removeClass('at-bat');
  this.atBat.hole.addClass('at-bat');
  $('#funds').val("")
}
Table.prototype.deal = function(amount) {
  var self = this;
  if (amount === 2) {
    for (var p=0; p<this.players.length; p++) {
      var player = this.players[p];
      for (var i=0; i<amount; i++) {
        var newCard = self.deck.shift()
        player.holeCards.push(newCard);
        newCard.place(player.slots[i],true)
      }
    };
  } else { // 3 or 1
    var startAt = this.communityCards.length;
    for (var i=0; i<amount; i++) {
      var newCard = self.deck.shift();
      this.communityCards.push(newCard);
      newCard.place(this.slots[startAt+i],true);
    }
  }
}
Table.prototype.advanceRound = function() {
  this.betThisRound = false;
  table.roundIndex++;
  var roundName = table.rounds[table.roundIndex];
  if (!table.rounds[table.roundIndex]) {
    console.log("end of game?")
    return;
    // begin end sequence
  } else if (roundName === "preFlop") {
    if (this.players.length === 2) {
      this.headsUp = true;
      this.players[0].addToPot(this.players[0].blind);
      this.players[1].addToPot(this.players[0].blind);
      table.updateFigures();
      this.deal(2);
      $('#call-check').text("Call");
      $('#bet-raise').text("Raise");
      
    }
  } else if (roundName === "flop") {
    this.deal(3);

  } else if (roundName === "turn") {
    this.deal(1);

  } else if (roundName === "river") {
    this.deal(1);

  }
  console.log("ROUND " + table.rounds[table.roundIndex] + " -----------")
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
  for (handKey in this.handEvaluators) { // iterate through eval functions
    if (this.handEvaluators[handKey].evaluate(hand)) { // check current hand object
      return handKey;
    }
  }
};
Table.prototype.findBestHand = function(handArray) {
  // handArrays are produced by Table.getHands()
  // takes array of 21 possible hands and returns best one
  var reversedHands = this.handKeys.slice().reverse();
  handArray.sort(function(hand1,hand2){
    return reversedHands.indexOf(hand2.handValue) - reversedHands.indexOf(hand1.handValue);
  })
  return handArray[0]; // returns a handObject
};
Table.prototype.findWinner = function () {
  // compare player final hands, return winning player
};
Table.prototype.updateFigures = function() {
  $('#pot').text("Pot: " + this.pot);
  $('#playerOneBank').text(this.players[0].bank);
  $('#playerTwoBank').text(this.players[1].bank);
  
};
function Card(suit, rank) {
  this.suit = suit;
  this.rank = rank;
  this.cardHTML = `<div class="playing-card" id="`+this.rank+`-of-`+this.suit+`"></div>`;
  this.dimensions = {
    width: 225,
    height: 315
  }
  this.getValue = function(){
    return table.ranks.slice().reverse().indexOf(this.rank);
  }
  this.place = function (targetElement,resize,replace) {
    targetElement.html(this.cardHTML)
    this.div = $('#'+this.rank+`-of-`+this.suit);
    if (resize) {
      this.dimensions.width = targetElement.width();
      this.dimensions.height = targetElement.height();
    }
    var pos = {};
    pos.left = table.ranks.indexOf(this.rank) * this.dimensions.width;
    pos.top = table.suits.indexOf(this.suit) * this.dimensions.height;
    this.div.css({
      'background-image': 'url(img/cardsheet.png)',
      'background-size': (this.dimensions.width*13)+'px '+(this.dimensions.height*4)+'px',
      'background-position': '-' + pos.left + 'px -' + pos.top + 'px',
      'background-repeat': 'no-repeat',
      'width': this.dimensions.width + 'px',
      'height': this.dimensions.height + 'px',
    });
  }
  this.toggleFlip = function() {
    if (this.div.css("background-image").includes("cardsheet")) {
      this.div.css({
        'background-image': 'url(img/cardback.png)',
        'background-size': (this.dimensions.width)+'px '+(this.dimensions.height)+'px',
        'background-position': '0',
      });
    } else {
      var pos = {};
      pos.left = table.ranks.indexOf(this.rank) * this.dimensions.width;
      pos.top = table.suits.indexOf(this.suit) * this.dimensions.height;
      this.div.css({
        'background-image': 'url(img/cardsheet.png)',
        'background-size': (this.dimensions.width*13)+'px '+(this.dimensions.height*4)+'px',
        'background-position': '-' + pos.left + 'px -' + pos.top + 'px'
      });
    }
  }
  this.value = this.getValue();
}
function Hand(arr) {
  this.cards = arr;
  this.instances = getInstances(this.cards);
  this.handValue = table.evaluateHand(this);
}
Hand.prototype.sortByValue = function(cardArr=this.cards) {
  cardArr.sort(function(card1, card2){
    return card1.value - card2.value;
  })
  return cardArr;
}
function getInstances(cardArray) {
  var instancesArr = [1, 1, 1, 1, 1];
  for (var i = 0; i <= 4; i++) {
    for (var j = 1; j <= 4; j++) {
      if (cardArray[0].rank === cardArray[j].rank) {
        instancesArr[i] = instancesArr[i] + 1;
      }
    }
    cardArray.push(cardArray.splice(0,1)[0]);
  }
  instancesArr = instancesArr.sort(function(a, b) {
    return b - a;
  });
  return instancesArr;
}
function Player(human, name, bank) {
  this.human = human;
  this.name = name;
  this.bank = bank;
  this.holeCards = [];
  this.finalFive = [];
  this.hand = undefined;
  this.blind = 0;
  this.currentBet = {
    type: "",
    amount: 0
  };
  this.addToPot = function(amount) {
    this.changeBankAmountBy(-amount);
    table.pot += amount;
  }
  if (!table.players.length) {
    this.slots = [
      $('#holeOne>.holeCard:first-child'),
      $('#holeOne>.holeCard:nth-child(2)'),
      this.hole = $('#holeOne')
    ];
  } else {
    this.slots = [
      $('#holeTwo>.holeCard:first-child'),
      $('#holeTwo>.holeCard:nth-child(2)'),
      this.hole = $('#holeTwo')
    ];
  }
  table.players.push(this);
  this.div = $('#player' + table.players.length);
  
  
}
Player.prototype.amountLeft = function (action, amount) {
  var amountLeft = 0;
  if ((action === "check") || (action === "call")) {
    amountLeft = this.bank;
  } else if ((action === "bet") || (action === "raise")) {
    amountLeft = this.bank - amount;
  } else if (action === "allIn") {
    amountLeft = 0;
  }
  return amountLeft;
}
Player.prototype.changeBankAmountBy = function (amount) {
  this.bank += amount;
}
$(document).ready(function() {
  $("#enterName").submit(function(event) {
    event.preventDefault();
    $("#enterName").hide();
    $("#container").show();
    var names = [($("#name1").val() || "Player 1" ),( $("#name2").val() || "Player 2" )];
    table.initiateGame(names);
  });
  $('#call-check').click(function(){
    // call
    var player = table.atBat;
    if (player.blind && player.blind === table.blinds.small.amount) {
      player.addToPot(player.blind);
      table.updateFigures();
      table.advanceTurn();
    }
  });
  $('#bet-raise').click(function(){
    // raise
    var player = table.atBat;
    var raiseAmount = parseInt($('#funds').val());
    if (raiseAmount) {
      player.addToPot(raiseAmount);
      table.updateFigures();
      table.advanceTurn();
    }
  });
  $('#allIn').click(function(){
    var player = table.atBat;
    var raiseAmount = player.bank
    player.addToPot(raiseAmount);
    table.updateFigures();
    table.advanceTurn();
  });
  $('#fold').click(function(){
    var player = table.atBat;
    player.holeCards[0].div.animate({
      'opacity': '0'
    },600);
    player.holeCards[1].div.animate({
      'opacity': '0'
    },600);
    if (table.players.indexOf(player) === 0) {
      $('#playerOneName').animate({
        'color': 'gray'
      },800);
    } else {
      $('#playerTwoName').animate({
        'color': 'gray'
      },800);
    }
    table.players.splice(table.players.indexOf(player),1);
    table.advanceTurn()
  });
});

// Function just for testing purposes, will shuffle the deck, create a five card hand object.
// function fiveCardHand() {
//   var newDeck = table.shuffle();
//   var cards = [];
//   for (i = 0; i <= 4; i++) {
//     cards.push(newDeck.pop());
//   }
//   var hand = new Hand(cards);
//   return hand;
// }
// Pre-built common hands for testing purposes.
//
// card1 = new Card("diamonds", "five");
// card2 = new Card("diamonds", "six");
// card3 = new Card("diamonds", "seven");
// card4 = new Card("diamonds", "eight");
// card5 = new Card("diamonds", "nine");
// reallyGoodCards = [card3, card1, card2, card5, card4];
// straightFlush = new Hand(reallyGoodCards);

// card1 = new Card("diamonds", "ace");
// card2 = new Card("diamonds", "king");
// card3 = new Card("diamonds", "queen");
// card4 = new Card("diamonds", "jack");
// card5 = new Card("diamonds", "ten");
// reallyGoodCards = [card1, card2, card3, card4, card5];
// royalFlush = new Hand(reallyGoodCards);

// card1 = new Card("diamonds", "two");
// card2 = new Card("diamonds", "seven");
// card3 = new Card("diamonds", "nine");
// card4 = new Card("diamonds", "four");
// card5 = new Card("diamonds", "queen");
// reallyGoodCards = [card1, card2, card3, card4, card5];
// flush = new Hand(reallyGoodCards);

// card1 = new Card("clubs", "five");
// card2 = new Card("diamonds", "six");
// card3 = new Card("spades", "seven");
// card4 = new Card("diamonds", "eight");
// card5 = new Card("hearts", "nine");
// reallyGoodCards = [card1, card2, card3, card4, card5];
// straight = new Hand(reallyGoodCards);

// card1 = new Card("diamonds", "three");
// card2 = new Card("clubs", "three");
// card3 = new Card("spades", "three");
// card4 = new Card("diamonds", "eight");
// card5 = new Card("spades", "eight");
// reallyGoodCards = [card4, card3, card1, card2, card5];
// fullHouse = new Hand(reallyGoodCards);

// card1 = new Card("diamonds", "five");
// card2 = new Card("clubs", "five");
// card3 = new Card("hearts", "five");
// card4 = new Card("spades", "five");
// card5 = new Card("diamonds", "queen");
// reallyGoodCards = [card1, card2, card5, card3, card4];
// fourOfAKind = new Hand(reallyGoodCards);

// card1 = new Card("diamonds", "seven");
// card2 = new Card("clubs", "seven");
// card3 = new Card("spades", "seven");
// card4 = new Card("diamonds", "two");
// card5 = new Card("diamonds", "jack");
// reallyGoodCards = [card1, card5, card2, card3, card4];
// threeOfAKind = new Hand(reallyGoodCards);

// card1 = new Card("diamonds", "five");
// card2 = new Card("diamonds", "six");
// card3 = new Card("diamonds", "seven");
// card4 = new Card("diamonds", "eight");
// card5 = new Card("diamonds", "nine");
// reallyGoodCards = [card1, card2, card3, card4, card5];
// straightFlush = new Hand(reallyGoodCards);

// card1 = new Card("diamonds", "five");
// card2 = new Card("clubs", "five");
// card3 = new Card("diamonds", "seven");
// card4 = new Card("spades", "seven");
// card5 = new Card("hearts", "two");
// reallyGoodCards = [card1, card5, card2, card4, card3];
// twoPair = new Hand(reallyGoodCards);

// card1 = new Card("diamonds", "ace");
// card2 = new Card("clubs", "jack");
// card3 = new Card("diamonds", "king");
// card4 = new Card("hearts", "ace");
// card5 = new Card("hearts", "three");
// reallyGoodCards = [card1, card2, card3, card4, card5];
// pair = new Hand(reallyGoodCards);
// //
// //
// //
// card6 = new Card("spades", "jack");
// card7 = new Card("diamonds", "4");
// sevenCardArr = [card1, card2, card3, card4, card5, card6, card7]
