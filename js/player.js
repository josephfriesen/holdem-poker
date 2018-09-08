function Player(human, name, bank) {
  this.human = human;
  this.moveDelay = 2000;
  this.name = name;
  this.handsWon = 0;
  this.bank = bank;
  this.holeCards = [];
  this.hand = undefined;
  this.blind;
  this.currentBet;
  this.flippedCards = false;
  this.options = ["call-check"]
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
Player.prototype.addToPot = function(amount,noBounce) {
  this.changeBankAmountBy(-amount);
  table.pot += amount;
  if (!noBounce) {
    $('#pot').bounce();
  }
}
Player.prototype.emitAction = function(actionMessage) {
  var p = table.players.indexOf(this)+1;
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
  var player = table.atBat;
  if (table.players[0]===table.atBat) {
    table.handWinner = table.players[1];
  } else {
    table.handWinner = table.players[0];
  }
  table.handWinner.addToPot(-table.pot);
  table.handWinner.handsWon++;
  $('#winner-message').text(this.name + " folded");
  $('.win-lose-message').fadeIn();
  this.swapLabel("fold-label")
  this.div.removeClass("at-bat");
  table.showStatusLabel(player);
  this.holeCards[0].div.addClass('retracted');
  this.holeCards[1].div.addClass('retracted');
  table.showHandResults(true);
  table.updateFigures();
}
Player.prototype.swapLabel = function(newLabel) {
  this.statusLabel.removeClass("fold-label");
  this.statusLabel.removeClass("dealer-label");
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
  var moveAction = action
  $('.game-button').prop('disabled',true)
  $('.game-button').hide()
  $('#thinking-message').fadeIn();
  setTimeout(function(){
    $('#'+moveAction).click();
    $('#top-message').css({
      'animation-play-state': 'paused'
    })
    $('.game-button').fadeIn();
    $('#thinking-message').hide();
  },delay)
}