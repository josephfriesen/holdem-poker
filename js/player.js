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
  Array.from(this.table.handKeys).forEach(function(hand){
    this.hopes[hand] = 0
  },this)
  console.log(this.hopes)
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
  var message = "";
  var action = "call-check";
  var winningHand = undefined;
  var bet = undefined;
  var hole1 = this.holeCards[0];
  var hole2 = this.holeCards[1];
  if (this.table.communityCards.length === 0) {
    /**
     * preFlop
     * total confidence possible: 5
     * high card pair (3) + two face cards (2) = 5
     * two of same suit (3) + two face cards (2) = 5
     */
    if (hole1.rank === hole2.rank) {
      // has a pair
      console.log("CPU has an inside pair! " + this.confidence);
      if (hole1.value < 5) {
        // has a high pair
        this.confidence += 3;
        console.log("CPU has a high inside pair! " + this.confidence);
        action = "bet-raise";
        bet = this.table.bigBlind*2
      } else if (hole1.value > 8) {
        // has a low pair
        this.confidence += 1;
        console.log("CPU has a low inside pair! " + this.confidence);
        action = "call-check"
      } else {
        // has a medium pair
        this.confidence += 2;
        action = "call-check"
      }
    } else if (hole1.suit === hole2.suit) {
      // has two of same suit
      this.confidence += 2;
      this.hopes.flush += 2;
      console.log("CPU got some confidence from same suit hole cards " + this.confidence);
    }
    if (hole1.value < 5 || hole2.value < 5 ) {
      // has one or two face cards
      if (hole1.value < 5 && hole2.value < 5) {
        // has two face cards
        this.confidence += 2
        console.log("computer has two high cards! " + this.confidence)
      } else {
        // has one face card
        this.confidence += 1
        console.log("CPU has a high card! " + this.confidence);
        action = "call-check";
      }
    } else {
      // has no face cards
      console.log("CPU has two lousy low cards! " + this.confidence);
      action = "call-check";
    }
    console.log("end conf " + this.confidence)
    message = this.table.cpuMessages["preFlop"][this.confidence]
  } else if (this.table.communityCards.length === 3) {
    /**
     * flop
     * total confidence possible: 7
     * 5+ handValue (4) + cards to complete a flush (3) = 7
     */
    var hand = new Hand([hole1,hole2,this.table.communityCards[0],this.table.communityCards[1],this.table.communityCards[2]])
    var handRating = this.table.handKeys.length-this.table.handKeys.indexOf(hand.handValue)
    console.log("value " + handRating + " for " + hand.handValue)
    if (hole1.suit === hole2.suit) {
      // same suit hole cards
      var numberOfSuit = this.table.numberOfSuit(this.table.communityCards,hole1.suit);
      if (numberOfSuit === 0) {
        // no flop cards match suit
        this.confidence -= this.hopes.flush;
        this.hopes.flush = 0;
        console.log("no longer a chance for a flush! losing confidence")
      } else {
        // one or more flop cards match
        this.hopes.flush += numberOfSuit; // max 3
        this.confidence += numberOfSuit;
        console.log("could get a flush! need " + (5-(numberOfSuit+2)) + " more cards! ")
      } 
    } else if (hole1.rank === hole2.rank) {
      // pair hole cards
      var numberOfRank = this.table.numberOfRank(this.table.communityCards,hole1.rank);
      if (numberOfRank === 0) {

      }
    }
    if (handRating >= 5) {
      // straight or better
      action = "bet-raise";
      bet = this.table.bigBlind*3;
      this.confidence += 4
    } else if (handRating >= 3) {
      // two pair or better
      action = "bet-raise";
      bet = this.table.bigBlind*2;
      this.confidence += 3
    } else if (handRating === 2) {
      // pair
      action = "call-check";
      if (hole1.rank !== hole2.rank) {
        this.confidence += 2
      }
    } else {
      // high card
      action = "call-check";
    }
    console.log("end conf " + this.confidence)
    console.log("with "+hand.handValue+" and confidence "+this.confidence+", CPU will " + action)
    this.hand = hand;
    message = this.table.cpuMessages["flop"][this.confidence]
  } else if (this.table.communityCards.length === 4) {
    /**
     * turn
     * total confidence possible:  7
     * 5+ handValue (4) + cards to complete a flush (3) = 7
     */
    var hand1 = new Hand([hole1,hole2,this.table.communityCards[0],this.table.communityCards[1],this.table.communityCards[2]])
    var hand2 = new Hand([hole1,hole2,this.table.communityCards[0],this.table.communityCards[1],this.table.communityCards[3]])
    var handRating1 = this.table.handKeys.length-this.table.handKeys.indexOf(this.hand.handValue);
    var handRating2 = this.table.handKeys.length-this.table.handKeys.indexOf(hand2.handValue);
    if (handRating2 > handRating1) {
      var handRating = handRating2;
      this.hand = hand2;
      console.log("new card enabled a better hand: " + hand2.handValue + " conf. " + this.confidence)
    } else {
      var handRating = handRating1;
      this.hand = hand1;
      console.log("kept same old cards for a best hand: " + hand1.handValue)
    }
    if (hole1.suit === hole2.suit) {
      // same suit hole cards
      var numberOfSuit = this.table.numberOfSuit(this.table.communityCards,hole1.suit);
      if (numberOfSuit < 2) {
        // one or no flop cards match suit
        this.confidence -= this.hopes.flush;
        this.hopes.flush = 0;
        console.log("no longer a chance for a flush! losing confidence")
      } else {
        // two or more flop cards match
        this.hopes.flush += numberOfSuit; // max 3
        this.confidence += numberOfSuit;
        console.log("still could get a flush! need " + (5-(numberOfSuit+2)) + " more cards! ")
      } 
    } else if (hole1.rank === hole2.rank) {
      // pair hole cards
      var numberOfRank = this.table.numberOfRank(this.table.communityCards,hole1.rank);
      if (numberOfRank === 0) {

      }
    }
    if (!this.hand.rated) {
      if (handRating >= 5) {
        // straight or better
        action = "bet-raise";
        bet = this.table.bigBlind*3;
        this.confidence += 4;
        this.hand.rated = true;
      } else if (handRating >= 3) {
        // two pair or better
        action = "bet-raise";
        bet = this.table.bigBlind*2;
        this.confidence += 3;
        this.hand.rated = true;
      } else if (handRating === 2) {
        // pair
        action = "call-check";
        if (hole1.rank !== hole2.rank) {
          this.confidence += 2;
          this.hand.rated = true;
        }
      } else {
        // high card
        action = "call-check";
      }
    }
    console.log("with this hand, CPU will " + action)
   
    message = this.table.cpuMessages["turn"][this.confidence];
    console.log("final message " + message)
  } else if (this.table.communityCards.length === 5) {
    /**
     * river
     * 
     */
    var hands = this.table.getHands([this.holeCards[0],this.holeCards[1],this.table.communityCards[0],this.table.communityCards[1],this.table.communityCards[2],this.table.communityCards[3],this.table.communityCards[4]])
    winningHand = this.table.findBestHand(hands);
    console.log("best hand is " + this.hand.handValue)
    var handRating = this.table.handKeys.length-this.table.handKeys.indexOf(winningHand.handValue);
    if (handRating > this.table.handKeys.length-this.table.handKeys.indexOf(this.hand.handValue)) {
      console.log("New final best " + winningHand.handValue + " beats existing" + this.hand.handValue)
    } else {
      console.log("New final best " + winningHand.handValue + " doesn't beat existing " + this.hand.handValue)
    }
    if (!this.hand.rated) {
      if (handRating >= 5) {
        // straight or better
        action = "bet-raise";
        bet = this.table.bigBlind*3;
        this.confidence += 4;
        this.hand.rated = true;
      } else if (handRating >= 3) {
        // two pair or better
        action = "bet-raise";
        bet = this.table.bigBlind*2;
        this.confidence += 3;
        this.hand.rated = true;
      } else if (handRating === 2) {
        // pair
        action = "call-check";
        if (hole1.rank !== hole2.rank) {
          this.confidence += 2;
          this.hand.rated = true;
        }
      } else {
        // high card
        action = "call-check";
      }
    }
    this.hand = winningHand;
    if (hole1.suit === hole2.suit) {
      // same suit hole cards
      var numberOfSuit = this.table.numberOfSuit(this.table.communityCards,hole1.suit);
      if (numberOfSuit < 3) {
        // no flush possible
        this.confidence -= this.hopes.flush;
        console.log("no longer a chance for a flush! losing "+this.hopes.flush+" confidence")
        this.hopes.flush = 0;
        
      } else {
        // a flush is occuring
        this.hopes.flush += numberOfSuit; // max 3
        this.confidence += numberOfSuit;
        console.log("have a flush! ")
      } 
    } else if (hole1.rank === hole2.rank) {
      // pair hole cards
      var numberOfRank = this.table.numberOfRank(this.table.communityCards,hole1.rank);
      if (numberOfRank === 0) {

      }
    }
    message = this.table.cpuMessages["river"][this.confidence]
  }
  if (!this.table.minimumBet && this.table.calledOrChecked > 0) {
    this.confidence += 1;
    console.log("got some conf since ain't no bet " + this.confidence)
  }
  if (winningHand) {
    this.hand = winningHand
    console.log("changed best hand to " + this.hand.handValue)
  }
  // if (!randomInt(0,2) && this.table.minimumBet > 80+(this.confidence*80)) {
  //   console.log("min bet " + this.table.minimumBet + " and conf " + this.confidence + " (" + (80+(this.confidence*40))+ ")")
  //   action = "fold";
  //   bet = undefined
  //   message = "Computer can't take it any more."
  // }
  console.log("returning " + action);
  if (bet && this.bank <= bet) {
    console.log("changing to all in")
    bet = this.bank;
    action = "allIn"
  }
  console.log("final action " + action + ", final bet " + bet)
  console.log("final message " + message)
  $('#thinking-message').text(message);
  this.table.updateFigures()
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
      console.log("CPU picked move " + bestMove[0] + " with bet " + bestMove[1])
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
        // $('.game-button').fadeIn();
        $('#thinking-message').hide();
        $('#thinking-message').text("Computer is thinking...");
      },delay);
    },2000);
  }
}