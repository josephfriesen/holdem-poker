function Card(suit, rank) {
  this.suit = suit;
  this.rank = rank;
  this.cardHTML = `<div class="playing-card protruding" id="`+this.rank+`-of-`+this.suit+`"></div>`;
  this.dimensions = {
    width: 225,
    height: 315
  };
  this.value = this.getValue();
}
Card.prototype.getValue = function(){
  return table.ranks.slice().reverse().indexOf(this.rank);
}
Card.prototype.showFront = function() {
  var pos = {};
  pos.left = table.ranks.indexOf(this.rank) * this.dimensions.width;
  pos.top = table.suits.indexOf(this.suit) * this.dimensions.height;
  this.div.css({
    'background-image': 'url(img/cardsheet.png)',
    'background-size': (this.dimensions.width*13)+'px '+(this.dimensions.height*4)+'px',
    'background-position': '-' + pos.left + 'px -' + pos.top + 'px'
  });
}
Card.prototype.showBack = function() {
  this.div.css({
    'background-image': 'url(img/cardback.png)',
    'background-size': (this.dimensions.width)+'px '+(this.dimensions.height)+'px',
    'background-position': '0',
  });
}
Card.prototype.place = function (targetElement,resize,faceDown,stayFlipped) {
  var self = this;
  targetElement.html(this.cardHTML);
  this.div = $('#'+this.rank+`-of-`+this.suit);
  if (resize) {
    this.dimensions.width = targetElement.width();
    this.dimensions.height = targetElement.height();
  }
  var pos = {};
  pos.left = table.ranks.indexOf(this.rank) * this.dimensions.width;
  pos.top = table.suits.indexOf(this.suit) * this.dimensions.height;
  this.div.css({
    'background-repeat': 'no-repeat',
    'width': this.dimensions.width + 'px',
    'height': this.dimensions.height + 'px'
  });
  if (faceDown) {
    this.showBack();
    if (!stayFlipped) {
      setTimeout(function(){
        self.animateFlip();
      },200)
    } else {
      this.showFront()
    }
  }
  this.div.animate({
    'opacity': '1'
  },180);
  this.div.delay(500).removeClass('protruding')
  if (Array.from($(targetElement)[0].classList).includes("holeCard")) {
    this.div.click(function(){
      self.animateFlip();
    });
  }
  table.dealtCards.push(this);
}
Card.prototype.animateFlip = function(side="auto") {
  var self = this;
  if (this.div.css("background-image").includes("cardsheet")) {
    if (side !== "front") {
      this.div.css({
        'transform':'scaleX(0)'
      });
      setTimeout(function(){
        self.div.css({
          'background-image': 'url(img/cardback.png)',
          'background-size': (self.dimensions.width)+'px '+(self.dimensions.height)+'px',
          'background-position': '0 0'
        });
        self.div.css({
          'transform':'scaleX(1)'
        });
      },180);
    }
  } else if (this.div.css("background-image").includes("cardback")) {
    if (side !== "back") {
      this.div.css({
        'transform':'scaleX(0)'
      });
      var pos = {};
      pos.left = table.ranks.indexOf(self.rank) * self.dimensions.width;
      pos.top = table.suits.indexOf(self.suit) * self.dimensions.height;
      setTimeout(function(){
        self.div.css({
          'background-image': 'url(img/cardsheet.png)',
          'background-size': (self.dimensions.width*13)+'px '+(self.dimensions.height*4)+'px',
          'background-position': '-' + pos.left + 'px -' + pos.top + 'px'
        });
        self.div.css({
          'transform':'scaleX(1)'
        });
      },180);
    }
  }
}
function Hand(arr) {
  this.cards = arr;
  this.instances = this.getInstances(this.cards);
  this.handValue = table.evaluateHand(this);
}
Hand.prototype.sortByValue = function(cardArr=this.cards) {
  cardArr.sort(function(card1, card2){
    return card1.value - card2.value;
  })
  return cardArr;
}
Hand.prototype.getInstances = function() {
  var cardArray = this.cards
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
  this.hand = undefined;
  this.blind;
  this.currentBet;
  if (!table.players.length) {
    this.slots = [
      $('#holeOne>.holeCard:first-child'),
      $('#holeOne>.holeCard:nth-child(2)'),
    ];
    this.hole = $('#holeOne')
  } else {
    this.slots = [
      $('#holeTwo>.holeCard:first-child'),
      $('#holeTwo>.holeCard:nth-child(2)'),
    ];
    this.hole = $('#holeTwo')
  }
  table.players.push(this);
  this.div = $('#player' + table.players.length);
  this.statusLabel = $('#dealer-' + table.players.length)
}
Player.prototype.addToPot = function(amount) {
  this.changeBankAmountBy(-amount);
  table.pot += amount;
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
  console.log("adding " + amount)
  this.bank += amount;
}
$(document).ready(function() {
  $("#enterName").submit(function(event) {
    event.preventDefault();
    $(".sign-in").hide();
    $("#table").show();
    var names = [ name1.value || "Player 1" , name2.value || "Player 2" ];
    table.initiateGame(names);
  });
  $('#call-check').click(function(){
    console.log("min bet " + table.minimumBet)
    var player = table.atBat;
    var amountToAdd = 0;
    table.calledOrChecked.push(player);
    if (table.minimumBet) {
      // call
      amountToAdd = table.minimumBet - player.currentBet;
      player.currentBet += amountToAdd;
      table.minimumBet = player.currentBet;
      player.addToPot(amountToAdd);
      table.advanceRound();
    } else {
      // check
      table.advanceTurn();
      if (table.calledOrChecked.length === table.players.length) {
        table.advanceRound();
      }
    }
    table.updateFigures();
  });
  $('#bet-raise').click(function() {
    var player = table.atBat;
    var raiseAmount = parseInt($('#funds').val());
    var matchAmount = table.minimumBet-player.currentBet
    var amountToAdd = matchAmount+raiseAmount
    player.currentBet += amountToAdd;
    table.minimumBet = player.currentBet;
    player.addToPot(amountToAdd);
    $('#call-check').text("Call " + table.minimumBet)
    table.calledOrChecked = [];
    table.updateFigures();
    table.advanceTurn();
  });
  $('#allIn').click(function(){
    var player = table.atBat;
    var raiseAmount = table.minimumBet = player.bank;
    player.currentBet += raiseAmount;
    player.addToPot(raiseAmount);
    $('#call-check').text("Call " + table.minimumBet)
    table.calledOrChecked = [];
    table.updateFigures();
    table.advanceTurn();
  });
  $('#fold').click(function(){
    var player = table.atBat;
    if (table.players[0]===table.atBat) {
      var winner = table.players[1]
    } else {
      var winner = table.players[0]
    }
    winner.bank += table.pot;
    player.holeCards[0].div.addClass('retracted');
    player.holeCards[1].div.addClass('retracted');
    setTimeout(function(){
      table.startNewHand();
    },1200);
  });
});
window.addEventListener("resize", function() {
  table.dealtCards.forEach(function(card,i){
    card.dimensions.width = $('.commCard').width();
    card.dimensions.height = $('.commCard').height();
    if (card.div.css("background-image").includes("cardsheet")) {
      var pos = {};
      pos.left = table.ranks.indexOf(card.rank) * card.dimensions.width;
      pos.top = table.suits.indexOf(card.suit) * card.dimensions.height;
      card.div.css({
        'background-size': (card.dimensions.width*13)+'px '+(card.dimensions.height*4)+'px',
        'background-position': '-' + pos.left + 'px -' + pos.top + 'px',
        'width': card.dimensions.width + 'px',
        'height': card.dimensions.height + 'px',
      });
    } else {
      card.div.css({
        'background-size': (card.dimensions.width)+'px '+(card.dimensions.height)+'px',
        'background-position': '0',
        'width': card.dimensions.width + 'px',
        'height': card.dimensions.height + 'px',
      });
    }
  });
});
document.onkeydown = function(event) {
  if (event.keyCode == 32 && $('#space-for-next').css('display') !== 'none') {
    event.preventDefault();
    table.startNewHand()
    console.log($('#space-for-next').css('opacity'))
  }
};
window.addEventListener("input",function(event){
  if (event.target.id === "funds") {
    if ($('#bet-raise').text() === "Bet") {
      $('#bet-raise').text("Bet " + $('#funds').val());
    } else {
      $('#bet-raise').text("Raise " + $('#funds').val());
    }
  }
});