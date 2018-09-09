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
  this.options = ["call-check"]
  if (!this.table.players.length) {
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
Player.prototype.makeMove = function(action,delay) {
  console.log("making move...")
  if (!this.table.autoDealing) {
    var moveAction = action
    $('.game-button').prop('disabled',true)
    $('.game-button').fadeOut()
    $('#thinking-message').show();
    setTimeout(function(){
      $('#'+moveAction).click();
      $('#top-message').css({
        'animation-play-state': 'paused'
      })
      console.log("CPU moved!")
      $('.game-button').fadeIn();
      $('#thinking-message').hide();
    },delay)
  } else {
    console.log("tried to move when hand was over!")
  }
}