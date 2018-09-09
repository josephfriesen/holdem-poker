function Card(suit, rank) {
  this.suit = suit;
  this.rank = rank;
  this.cardHTML = `<div class="playing-card protruding" id="`+this.rank+`-of-`+this.suit+`"></div>`;
  this.dimensions = {
    width: ($('#cardsheet').width()/13),
    height: ($('#cardsheet').height()/4)
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
  console.log("placing a " + this.rank + " of " + this.suit)
  this.div = $('#'+this.rank+`-of-`+this.suit);
  if (resize) {
    this.dimensions.width = Math.round(targetElement.width());
    this.dimensions.height = Math.round(targetElement.height());
  }
  var pos = {};
  pos.left = table.ranks.indexOf(this.rank) * this.dimensions.width;
  pos.top = table.suits.indexOf(this.suit) * this.dimensions.height;
  this.div.css({
    'background-image': 'url(img/cardsheet.png)',
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
    }
  } else {
    this.showFront();
  }
  this.div.animate({
    'opacity': '1'
  },180);
  this.div.delay(500).removeClass('protruding')
  if (!table.vsCPU && Array.from($(targetElement)[0].classList).includes("holeCard")) {
    document.getElementById(this.rank+`-of-`+this.suit).onmousedown = function(){
      self.animateFlip();
    };
  }
  table.dealtCards.push(this);
}
Card.prototype.animateFlip = function(side="auto",speed=200) {
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
      },speed);
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
      },speed);
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