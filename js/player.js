function Player(table, human, name, bank) {
  this.table = table;
  this.human = human;
  this.moveDelay = 1500;
  this.name = name;
  this.handsWon = 0;
  this.bank = bank;
  this.holeCards = [];
  this.hand = undefined;
  this.blind;
  this.currentBet;
  this.flippedCards = false;
  this.confidence = 0;
  this.hopes = {};
  this.previousPlayer = undefined;
  Array.from(poker.handKeys).forEach(function(hand){
    this.hopes[hand] = 0
  },this)
  this.options = ["call-check"]
  if (!this.table.players.length) {
    this.slots = [
      $('#hole-1>.hole-card:first-child'),
      $('#hole-1>.hole-card:nth-child(2)'),
    ];
    this.hole = $('#hole-1')
  } else {
    this.slots = [
      $('#hole-2>.hole-card:first-child'),
      $('#hole-2>.hole-card:nth-child(2)'),
    ];
    this.hole = $('#hole-2')
  }
  this.table.players.push(this);
  this.div = $('#player-' + this.table.players.length);
  this.statusLabel = $('#dealer-' + this.table.players.length)
}
Player.prototype.addToPot = function(amount,noBounce) {
  this.changeBankAmountBy(-amount);
  this.table.pot += amount;
  if (!noBounce) {
    $('#pot-amount').timeAnimation(500);
  }
}
Player.prototype.emitAction = function(actionMessage) {
  var p = this.table.players.indexOf(this)+1;
  if (p === 1) {
    var moveX = '120%'
  } else {
    var moveX = '-120%'
  }
  $('#player-'+p+'-action').html(actionMessage);
  $('#player-'+p+'-action').animate({
    'opacity': '1'
  },10).css({
    'transform': 'translateX('+moveX+')'
  }).delay(800);
  $('#player-'+p+'-action').animate({
    'opacity': '0',
  },200);
  
  setTimeout(function(){
    $('#player-'+p+'-action').css('transform','none');
  },1550)
}
Player.prototype.fold = function() {
  var player = this.table.atBat;
  if (this.table.players[0]===this.table.atBat) {
    this.table.handWinner = this.table.players[1];
  } else {
    this.table.handWinner = this.table.players[0];
  }
  this.table.handWinner.addToPot(-this.table.pot);
  this.table.handWinner.handsWon++;
  $('#winner-message').text(this.name + " folded");
  $('#winner-message').fadeIn();
  this.swapLabel("fold-label")
  this.div.removeClass("at-bat");
  this.table.showStatusLabel(player);
  this.holeCards[0].div.addClass('retracted');
  this.holeCards[1].div.addClass('retracted');
  this.table.showHandResults(true);
  this.table.updateFigures();
}
Player.prototype.swapLabel = function(newLabel) {
  this.statusLabel.removeClass("fold-label");
  this.statusLabel.removeClass("status-label");
  this.statusLabel.removeClass("winner-label");
  this.statusLabel.addClass(newLabel);
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