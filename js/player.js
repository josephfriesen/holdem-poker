function Player(human, name, bank) {
  this.human = human;
  this.name = name;
  this.handsWon = 0;
  this.bank = bank;
  this.holeCards = [];
  this.hand = undefined;
  this.blind;
  this.currentBet;
  this.flippedCards = false;
  this.options = ["call-check","bet-raise","allIn","fold"]
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
  },50).css({
    'transform': 'translateX('+moveX+')'
  }).delay(800);
  $('#player-'+p+'-action').animate({
    'opacity': '0',
    // 'transition': 'none'
  },200);
  
  setTimeout(function(){
    // $('#player-'+p+'-action').css('transition','initial');
    $('#player-'+p+'-action').css('transform','none');
  },1200)
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
  this.div.removeClass("at-bat");
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
Player.prototype.makeMove = function(action) {
  var moveAction = action
  $('button').prop('disabled',true)
  $('#top-message').removeClass('space-flip');
  $('#top-message').css({
    'animation-play-state': 'paused'
  })
  $('#top-message').html("COMPUTER IS THINKING...");
  setTimeout(function(){
    $('#'+moveAction).click();
    console.log("cpu made a move!")
    $('#top-message').css({
      'animation-play-state': 'paused'
    })
    $('#top-message').empty()
    $('#top-message').addClass('space-flip');
    console.log("advancing after cpu move")
  },2000)
}