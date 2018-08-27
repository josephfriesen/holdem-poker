
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
  this.hands = {
    royalFlush: function(){

    },
    straightFlush: function(){

    },

    // Four of a Kind check function. Given a hand, returns True if that hand is a four of a kind, false if not.
    fourOfAKind: function(instanceArr) {
      // instancesArr.forEach(function(instance) {
      //   if (instance === 4) {
      //     output = true;
      //   }
      // })
      // return output;
    },

    fullHouse: function(){

    },
    flush: function(){

    },
    straight: function(){

    },
    threeOfAKind: function(){

    },
    twoPair: function(){

    },
    pair: function(){

    },
    highCard: function() {

    }
  }
}
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
Table.prototype.handRank(hand) {
  var keyArr = Object.keys(this.hands);
  return keyArr.indexOf(hand);
}
Table.prototype.getHands(player.cards) {
  // return array of all player.holeCards + this.communityCards combinations
}
Table.prototype.findBestHand(handArray) {
  // find all possible hands for handArray
  // player.finalFive = bestHand.cards
  // return bestHand key
}
Table.prototype.findWinner() {

}
function Card(suit,rank) {
  this.suit = suit;
  this.rank = rank;
}
function Hand(arr) {
  this.cards = [];
  this.instances = [];
}
Hand.prototype.getInstances() {
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
  this.bank = 0;
  this.holeCards = [];
  this.finalFive = [];
  this.hand = undefined;
}
