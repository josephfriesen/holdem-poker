
var table = new Table()

function Table() {
  this.suits = [
    'clubs',
    'diamonds',
    'hearts',
    'spades'
  ]
  this.ranks = [
    '2','3','4','5','6','7','8','9','10','jack','queen','king','ace'
  ]
  this.handEvaluators = {
    // Done -- is this syntax for calling other functions in the handEvaluators object correct? royalFlush and straightFlush both require flush(hand) and straight(hand) to evaluate to true.
    royalFlush: function(hand){
      var aceCheck = false;
      for (var i = 0; i <= 4; i++) {
        if (hand.cards[i].rank === "ace") {
          aceCheck = true;
        }
      }
      if (this.flush(hand) && this.straight(hand) && aceCheck) {
        return true;
      } else {
        return false;
      }
    },
    // Done
    straightFlush: function(hand){
      if (this.flush(hand) && this.straight(hand)) {
        return true;
      } else {
        return false;
      }
    },
    // Done
    fourOfAKind: function(hand) {
      if (hand.instances[0] === 4) {
        return true;
      } else {
        return false;
      }
    },
    // Done
    fullHouse: function(hand){
      if (hand.instances[0] === 3 && hand.instances[3] === 2) {
        return true;
      } else {
        return false;
      }
    },
    // Done
    flush: function(hand){
      if (hand.cards[0].suit === hand.cards[1].suit && hand.cards[1].suit === hand.cards[2].suit && hand.cards[2].suit === hand.cards[3].suit && hand.cards[3].suit === hand.cards[4].suit) {
        return true;
      } else {
        return false;
      }
    },
    straight: function(hand){

    },
    // Done
    threeOfAKind: function(hand){
      if (hand.instances[0] === 3) {
        return true;
      } else {
        return false;
      }
    },
    // Done
    twoPair: function(hand){
      if (hand.instances[0] === 2 && hand.instances[2] === 2) {
        return true;
      } else {
        return false;
      }
    },
    // Done
    pair: function(hand){
      if (hand.instances[0] === 2 && hand.instances[2] === 1) {
        return true;
      } else {
        return false;
      }
    },
    // Done
    highCard: function(hand) {
      if (hand.instances[0] === 1) {
        return true;
      } else {
        return false;
      }
    }
  }
  this.handKeys = Object.keys(this.handEvaluators)

  this.deck = [];
  this.board = [];
  this.round = 0;
  this.players = [];
  this.suits.forEach(function(suit,i){
    console.log(suit)
    this.ranks.forEach(function(rank,j){
      console.log(rank)
      this.deck.push( new Card(suit,rank) )
    },this);
  },this)
  console.log(this)
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
Table.prototype.deal = function() {

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
      return table.handKeys.indexOf(handKey) // returns index
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
      if (hand.handValue < bestHandIndex) { // check if current hand is higher than best
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
  this.instances = this.getInstances()
  this.handValue = 0;
}
Hand.prototype.checkFor = function(handToCheck) {
  return table.handEvaluators[handToCheck]()
}
Hand.prototype.getInstances = function() {
  var cardArray = this.hand.cards
  var output = false;
  var instances = 1;
  var instancesArr = [];
  for (var i = 0; i <= 4; i++) {
    for (var j = 1; i <= 4; j++) {
      if (cardArray[0].rank === cardArray[i]) {
        instances = instances + 1;
      }
    }
    instancesArr.push(instances);
    cardArray.push(cardArray.splice(0,1)[0]);
    instances = 1;
  }
  instanceArr = instanceArr.sort(function(a,b){
    return b - a;
  })
  return instancesArr;
}
function Player(human) {
  this.human = human;
  this.name = "";
  this.bank = 1500;
  this.holeCards = [];
  this.finalFive = [];
  this.hand = undefined;
}
