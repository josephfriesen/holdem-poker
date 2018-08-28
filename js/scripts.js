
var table = new Table();
var startingBank = 1500


function Table() {
  this.players = [];
  this.communityCards = [];
  this.rounds = [
    "preStart",
    "preFlop",
    "flop",
    "turn",
    "river"
  ]
  this.blinds = {
    small: {
      amount: 40,
      player: undefined
    },
    big: {
      amount: 80,
      player: undefined
    }
  }
  this.headsUp = false;

  this.player1er;
  this.atBat;
  this.betThisRound = false;
  this.round = ""
  this.pot = 0
  this.suits = [
    'clubs',
    'diamonds',
    'hearts',
    'spades'
  ];
  this.ranks = [
    '2','3','4','5','6','7','8','9','10','jack','queen','king','ace'
  ];
  this.handEvaluators = {
    // Done -- is this syntax for calling other functions in the handEvaluators object correct? royalFlush and straightFlush both require flush(hand) and straight(hand) to evaluate to true.
    royalFlush: function(hand){
      var aceCheck = false;
      for (var i = 0; i <= 4; i++) {
        if (hand.cards[i].rank === "ace") {
          aceCheck = true;
        }
      }
      return (this.flush(hand) && this.straight(hand) && aceCheck)
    },
    straightFlush: function(hand){
      return (this.handEvaluators.flush(hand) && this.handEvaluators.straight(hand));
    },
    fourOfAKind: function(hand) {
      return (hand.instances[0] === 4);
    },
    fullHouse: function(hand){
      return (hand.instances[0] === 3 && hand.instances[3] === 2);
    },
    flush: function(hand){
      return (hand.cards[0].suit === hand.cards[1].suit && hand.cards[1].suit === hand.cards[2].suit && hand.cards[2].suit === hand.cards[3].suit && hand.cards[3].suit === hand.cards[4].suit);
    },
    straight: function(hand){

    },
    threeOfAKind: function(hand){
      return (hand.instances[0] === 3);
    },
    twoPair: function(hand){
      return (hand.instances[0] === 2 && hand.instances[2] === 2);
    },
    pair: function(hand){
      return (hand.instances[0] === 2 && hand.instances[2] === 1);
    },
    highCard: function(hand) {
      return (hand.instances[0] === 1);
    }
  }
  this.handKeys = Object.keys(this.handEvaluators)
  this.deck = [];
  this.board = [];
  this.roundIndex = 0;
  this.suits.forEach(function(suit,i){
    this.ranks.forEach(function(rank,j){
      this.deck.push( new Card(suit,rank) )
    },this);
  },this)
}
Table.prototype.shuffle = function() {
  var len = this.deck.length;
  var output = [];
  var limit;
  var rand;
  for (var j = 0; j < len; j++) {
    limit = len - j;
    rand = Math.floor(Math.random() * (limit));
    output.push(this.deck[rand]);
    this.deck.splice(rand,1);
  }
  this.deck = output;
}
Table.prototype.changeTurn = function(playerIndex) {
  this.atBat = this.players[playerIndex];
  // $('.player').removeClass('at-bat');
  this.atBat.div.addClass('at-bat')
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
  console.log("old round " + table.roundIndex)
  table.roundIndex++
  console.log("new round is " + table.roundIndex);
  var roundName = table.rounds[table.roundIndex];
  if (!table.rounds[table.roundIndex]) {
    // begin end sequence
  } else {
    if (roundName === "preFlop") {
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
        console.log("minus " + this.blinds.small.amount);
        console.log("1 basnkl " + this.players[0].bank);

        $('#playerOneBank').text(this.players[0].bank);
        $('#playerTwoBank').text(this.players[1].bank);
        // call/check
        // bet/raise
        // all-in
        // Fold
        $('#call-check').text("Call");
        $('#bet-raise').text("Raise");
        // $('#call-check').off()
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
        })

      } else {
        // multiplayer rules
      }
    } else if (roundName === "flop") {
      //
    } else if (roundName === "turn") {

    } else if (roundName === "river") {

    }
  }
}
Table.prototype.handIndex = function(handKey) {
  var keyArr = Object.keys(this.hands);
  return keyArr.indexOf(handKey);
}
Table.prototype.getHands = function(multiCardArray) {
  var handArray = [];
  // for each 5-card combination of multiCardArray...
  // (get them how??)
  // ...instantiate a Hand
  // var newHand = new Hand([5-card combo])
  // newHand.handValue = table.evaluateHand(newHand)
  // handArray.push(newHand)
  return handArray; // returns an array of Hand objects
}
Table.prototype.evaluateHand = function(hand) {
  var bestHand = "highCard"
  for (handKey in this.evaluators) { // iterate through eval functions
    if (this.evaluators[handKey](hand)) { // check current fiveCardArray
      return table.handKeys.indexOf(handKey) // return index
    }
  }
}
Table.prototype.findBestHand = function(handArray) {
  // handArrays are produced by Table.getHands()
  // takes array of 21 possible hands and returns best one
  handArray.forEach(function(handObject,i){
    var bestHandIndex = this.handEvaluators.length-1
    var bestHand;
    for (handKey in this.handEvaluators) { // iterate through eval functions
      if (handObject.handValue < bestHandIndex) { // check if current hand is higher than best
        bestHandIndex = hand.evaluateHand().handIndex
        bestHand = handObject
      }
    }
  })
  return bestHand; // returns a hand key i.e. "twoPair"
}
Table.prototype.findWinner = function() {
  // compare player final hands, return winning player
}
function Card(suit,rank) {
  this.suit = suit;
  this.rank = rank;
}
function Hand(arr) {
  this.cards = arr;
  this.getInstances = function() {
    var cardArray = this.cards.splice(0)
    var output = false;
    var instances = 1;
    var instancesArr = [];
    for (var i = 0; i <= 4; i++) {
      for (var j = 1; j <= 4; j++) {
        instances = 1;
        if (cardArray[0].rank === cardArray[i]) {
          instances = instances + 1;
        }
      }
      instancesArr.push(instances);
      cardArray.push(cardArray.splice(0,1)[0]);
    }
    return instancesArr
  }
  this.instances = this.getInstances()
  this.handValue = 0;
}
Hand.prototype.checkFor = function(handToCheck) {
  return table.handEvaluators[handToCheck]()
}
function Player(human,name,bank) {
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
  this.div = $('#player'+table.players.length);
}
Player.prototype.amountLeft = function(action,amount) {
  var amountLeft = 0
  if ((action === "check") || (action === "call") ) {
    amountLeft = this.bank
  } else if ((action === "bet") || (action === "raise")) {
    amountLeft = this.bank - amount;
  } else if (action === "allIn") {
    amountLeft = 0
  }
  return amountLeft
}
Player.prototype.changeBankAmountBy = function(amount) {
  this.bank += amount
}

// var actions = ["check", "call", "bet", "raise", "allIn", "fold"]
// var amount = "";
// var oneName = "player1";
// var oneBank = 1500
// console.log(oneName);
// console.log(oneBank);
// var one = new Player(oneName, oneBank)

$(document).ready(function() {
  var oneName = $("#enterName").submit(function(event) {
    event.preventDefault();
    $("#enterName").hide();
    $("#container").show();
    var name1 = $("#name1").val()
    var name2 = $("#name2").val()
    if (!name1) {
      name1 = "Player 1"
    }
    if (!name2) {
      name2 = "Player 2"
    }
    table = new Table();
    var player1 = new Player(true,name1,startingBank);
    var player2 = new Player(true,name2,startingBank);
    $('#playerOneName').text(name1)
    $('#playerTwoName').text(name2)
    table.changeTurn(0);
    table.advanceRound();
  });
  var testHand = new Hand([table.deck[0],table.deck[1],table.deck[2],table.deck[3],table.deck[4]])
});
