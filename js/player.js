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
Player.prototype.pickBestMove = function() {
  var action = "call-check";
  var bet = undefined;
  var hole1 = this.holeCards[0];
  var hole2 = this.holeCards[1];
  if (this.table.communityCards.length === 0) {
    // preFlop
    if (hole1 === hole2) {
      this.confidence += 5;
      console.log("CPU has an inside pair! " + this.confidence);
      action = "bet-raise";
      if (hole1.value < 5) {
        this.confidence += 5;
        console.log("CPU has a high inside pair! " + this.confidence);
        bet = this.table.bigBlind*2
        $('#thinking-message').text("Computer really likes its hole cards.");
      } else if (hole1.value > 8) {
        console.log("CPU has a low inside pair! " + this.confidence);
        $('#thinking-message').text("Computer looks okay with its hole cards.");
      } else {
        $('#thinking-message').text("Computer looks confident in its hole cards.");
      }
    } else if (hole1.value < 5 || hole2.value < 5 ) {
      this.confidence += 2
      console.log("CPU has a high card! " + this.confidence);
      action = "call-check";
      $('#thinking-message').text("Computer seems neutral about its hole cards.");
    } else {
      console.log("CPU has two lousy low cards! " + this.confidence);
      action = "call-check";
      $('#thinking-message').text("Computer seems uneasy about its hole cards.");
    }
    
  } else if (this.table.communityCards.length === 3) {
    // flop
    var hand = new Hand([hole1,hole2,this.table.communityCards[0],this.table.communityCards[1],this.table.communityCards[2]])
    var handRating = this.table.handKeys.length-this.table.handKeys.indexOf(hand.handValue)
    console.log("value " + handRating + " for " + hand.handValue)
    if (handRating > 5) {
      action = "allIn";
      $('#thinking-message').text("Computer looks overjoyed at its hand.");
    } else if (handRating > 2) {
      action = "bet-raise";
      $('#thinking-message').text("Computer looks confident in its hand.");
    } else {
      action = "call-check";
      $('#thinking-message').text("Computer is feeling lousy about its hand.");
    }
    console.log("with this hand, CPU will " + action)
    this.hand = hand;
  } else if (this.table.communityCards.length === 4) {
    console.log("length 4!!")
    var hand1 = new Hand([hole1,hole2,this.table.communityCards[0],this.table.communityCards[1],this.table.communityCards[2]])
    var hand2 = new Hand([hole1,hole2,this.table.communityCards[0],this.table.communityCards[1],this.table.communityCards[3]])
    var handRating1 = this.table.handKeys.length-this.table.handKeys.indexOf(this.hand.handValue);
    var handRating2 = this.table.handKeys.length-this.table.handKeys.indexOf(hand2.handValue);
    if (handRating2 > handRating1) {
      var handRating = handRating2;
      this.hand = hand2;
      this.confidence += (handRating2-handRating1)*2
      console.log("new card enabled a better hand: " + hand2.handValue + " conf. " + this.confidence)
    } else {
      var handRating = handRating1;
      this.hand = hand1;
      console.log("kept same old cards for a best hand: " + hand1.handValue)
    }
    if (handRating > 5) {
      action = "allIn";
      $('#thinking-message').text("Computer looks overjoyed at its hand.");
    } else if (handRating > 2) {
      action = "bet-raise";
      $('#thinking-message').text("Computer looks confident in its hand.");
    } else {
      action = "call-check";
      $('#thinking-message').text("Computer is feeling lousy about its hand.");
    }
    console.log("with this hand, CPU will " + action)
  } else if (this.table.communityCards.length === 5) {
    var hands = this.table.getHands([this.holeCards[0],this.holeCards[1],this.table.communityCards[0],this.table.communityCards[1],this.table.communityCards[2],this.table.communityCards[3],this.table.communityCards[4]])
    var winningHand = this.table.findBestHand(hands);
    console.log("best hand is " + this.hand.handValue)
    var handRating = this.table.handKeys.length-this.table.handKeys.indexOf(winningHand.handValue);
    if (handRating > this.table.handKeys.indexOf(this.hand.handValue)) {
      console.log(winningHand.handValue + " beats " + this.hand.handValue)
    } else {
      console.log(winningHand.handValue + " don't beat no " + this.hand.handValue)
    }
    if (handRating > 5) {
      action = "allIn";
      $('#thinking-message').text("Computer looks overjoyed at its hand.");
    } else if (handRating > 4) {
      action = "bet-raise";
      bet = this.table.bigBlind
      $('#thinking-message').text("Computer looks happy about its hand.");
    } else if (handRating > 2) {
      action = "bet-raise";
      $('#thinking-message').text("Computer looks fairly confident in its hand.");
    } else {
      action = "call-check";
      $('#thinking-message').text("Computer is feeling lousy about its hand.");
    }
    this.hand = winningHand;
  }
  if (!this.table.minimumBet && this.table.calledOrChecked > 0) {
    this.confidence += 2;
    console.log("got come conf since ain't no bet " + this.confidence)
  }
  if (hole1.suit === hole2.suit && this.table.communityCards.length < 4) {
    this.confidence += 2
    console.log("got some confidence from same suit hold cards");
    this.table.communityCards.forEach(function(card,i){
      if (card.suit === hole1.suit) {
        this.confidence += 1;
        console.log("got confidence from a same suit comm card! " + this.confidence)
      }
    },this)
  }
  if (this.table.minimumBet > 80+(this.confidence*40)) {
    console.log("min bet " + this.table.minimumBet + " and conf " + this.confidence + " (" + (80+(this.confidence*40))+ ")")
    action = "fold";
    bet = undefined
  }
  console.log("returning " + action)
  return [action,bet]
}
Player.prototype.makeMove = function(delay) {
  console.log("making move in " + delay)
  if (!this.table.autoDealing) {
    $('.game-button').prop('disabled',true)
    $('.game-button').hide()
    $('#thinking-message').fadeIn();
    var self = this;
    setTimeout(function(){
      var bestMove = self.pickBestMove();
      var moveAction = bestMove[0]
      if (bestMove[1]) {
        $('#bet-raise').val(bestMove[1])
      }
      console.log("picked " + moveAction)
      setTimeout(function(){
        $('#'+moveAction).click();
        $('#top-message').css({
          'animation-play-state': 'paused'
        })
        console.log("CPU moved!")
        $('.game-button').fadeIn();
        $('#thinking-message').hide();
        $('#thinking-message').text("Computer is thinking...");
        },delay);
    },2000);
  }
}