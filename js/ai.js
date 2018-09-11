Player.prototype.chooseAction = function() {
  var action = undefined;
  var bet = undefined;
  if (this.confidence > 5) {
    action = "bet-raise";
    bet = this.table.bigBlind*2;
  } else if (this.confidence > 3) {
    action = "bet-raise";
    bet = this.table.bigBlind;
  } else if (this.confidence > 1) {
    action = "call-check"
  } else {
    action = "call-check"
  }
  return [action, bet]
}
Player.prototype.receiveHoleCardConfidence = function() {
  var hole1 = this.holeCards[0];
  var hole2 = this.holeCards[1];
  if (hole1.rank === hole2.rank) {
    // has a pair
    console.log("CPU has an inside pair! " + this.confidence);
    if (hole1.value < 5) {
      // has a high pair
      this.confidence += 3;
      console.log("CPU +3 for a high inside pair of " + hole1.rank + "s! " + this.confidence);
    } else if (hole1.value > 8) {
      // has a low pair
      this.confidence += 1;
      console.log("CPU +1 for a low inside pair of " + hole1.rank + "s! " + this.confidence);
    } else {
      // has a medium pair
      this.confidence += 2;
      console.log("CPU +2 for a medium inside pair of " + hole1.rank + "s! " + this.confidence);
    }
  } else if (hole1.suit === hole2.suit) {
    // has two of same suit
    this.confidence += 2;
    this.hopes.flush += 2;
    console.log("CPU got 2 confidence from "+hole1.suit+" hole cards! " + this.confidence);
  }
  if (hole1.value < 5 || hole2.value < 5 ) {
    // has one or two face cards
    if (hole1.value < 5 && hole2.value < 5) {
      // has two face cards
      this.confidence += 2
      console.log("CPU has two high hole cards! " + this.confidence)
    } else {
      // has one face card
      this.confidence += 1
      console.log("CPU has one high hole card! " + this.confidence);
    }
  } else {
    // has no face cards
    console.log("CPU has two lousy low hole cards! " + this.confidence);
  }
}
Player.prototype.receiveHandConfidence = function() {
  console.log("before RHC conf was " + this.confidence)
  var handRating = poker.handKeys.length-poker.handKeys.indexOf(this.hand.handValue)
  if (handRating >= 5) {
    // straight or better
    this.confidence += 4;
  } else if (handRating >= 3) {
    // two pair or better
    this.confidence += 3;
  } else if (handRating === 2) {
    // pair
    if (this.holeCards[0].rank !== this.holeCards[1].rank) { // one or more pair cards are community
      this.confidence += 1;
    }
  } else {
    // high card
  }
  this.hand.rated = true;
  console.log("RHC bumped up conf to " + this.confidence)
}
Player.prototype.checkFlushPotential = function() {
  var hole1 = this.holeCards[0];
  var hole2 = this.holeCards[1];
  var commCards = this.table.communityCards
  if (hole1.suit === hole2.suit) {
    var numberOfSuit = this.table.numberOfSuit(commCards,hole1.suit);
    if (commCards.length === 3) {
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
    } else if (commCards.length === 4 && this.hopes.flush) {
      if (numberOfSuit < 2) {
        // one or no flop cards match suit
        this.confidence -= this.hopes.flush;
        console.log("no longer a chance for a flush! losing "+this.hopes.flush+" confidence")
        this.hopes.flush = 0;
      } else {
        // two flop cards match
        this.hopes.flush += numberOfSuit; // max 3
        this.confidence += numberOfSuit;
        console.log("still could get a flush! need " + (5-(numberOfSuit+2)) + " more cards! ")
      } 
    } else if (commCards.length === 5 && this.hopes.flush) {
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
    }
  }
}
Player.prototype.pickBestMove = function() {
  var message = "";
  // var action = "call-check";
  var winningHand = undefined;
  // var bet = undefined;
  var hole1 = this.holeCards[0];
  var hole2 = this.holeCards[1];
  if (this.table.communityCards.length === 0) {
    // preFlop
    this.receiveHoleCardConfidence()
    message = poker.cpuMessages["preFlop"][this.confidence] + " conf " + this.confidence;
  } else if (this.table.communityCards.length === 3) {
    // flop
    var hand = new Hand([hole1,hole2,this.table.communityCards[0],this.table.communityCards[1],this.table.communityCards[2]])
    var handRating = poker.handKeys.length-poker.handKeys.indexOf(hand.handValue)
    this.checkFlushPotential();
    this.hand = hand;
    if (!this.hand.rated) {
      this.receiveHandConfidence()
    }    
    message = poker.cpuMessages["flop"][this.confidence]
  } else if (this.table.communityCards.length === 4) {
    // turn
    var hand1 = new Hand([hole1,hole2,this.table.communityCards[0],this.table.communityCards[1],this.table.communityCards[2]])
    var hand2 = new Hand([hole1,hole2,this.table.communityCards[0],this.table.communityCards[1],this.table.communityCards[3]])
    var handRating1 = poker.handKeys.length-poker.handKeys.indexOf(this.hand.handValue);
    var handRating2 = poker.handKeys.length-poker.handKeys.indexOf(hand2.handValue);
    if (handRating2 > handRating1) {
      var handRating = handRating2;
      this.hand = hand2;
      console.log("new card enabled a better hand: " + hand2.handValue + " conf. " + this.confidence)
    } else {
      var handRating = handRating1;
      this.hand = hand1;
      console.log("kept same old cards for a best hand: " + hand1.handValue)
    }
    this.checkFlushPotential();
    if (!this.hand.rated) {
      this.receiveHandConfidence();
    }   
    message = poker.cpuMessages["turn"][this.confidence];
    console.log("final message " + message)
  } else if (this.table.communityCards.length === 5) {
    /**
     * river
     * 
     */
    var hands = this.table.getHands([this.holeCards[0],this.holeCards[1],this.table.communityCards[0],this.table.communityCards[1],this.table.communityCards[2],this.table.communityCards[3],this.table.communityCards[4]])
    winningHand = this.table.findBestHand(hands);
    console.log("best hand is " + this.hand.handValue)
    var handRating = poker.handKeys.length-poker.handKeys.indexOf(winningHand.handValue);
    if (handRating > poker.handKeys.length-poker.handKeys.indexOf(this.hand.handValue)) {
      console.log("New final best " + winningHand.handValue + " beats existing" + this.hand.handValue)
    } else {
      console.log("New final best " + winningHand.handValue + " doesn't beat existing " + this.hand.handValue)
    }
    if (!this.hand.rated) {
      this.receiveHandConfidence()
    }
    this.hand = winningHand;
    this.checkFlushPotential();
    message = poker.cpuMessages["river"][this.confidence]
  }
  if (!this.table.minimumBet && this.table.calledOrChecked > 0) {
    this.confidence += 1;
    console.log("got some conf since ain't no bet " + this.confidence)
  }
  if (winningHand) {
    this.hand = winningHand
    console.log("changed best hand to " + this.hand.handValue)
  }
  var move = this.chooseAction();
  var action = move[0];
  var bet = move[1];
  if (!randomInt(0,2) && this.table.minimumBet > 80+(this.confidence*80)) {
    console.log("min bet " + this.table.minimumBet + " and conf " + this.confidence + " (" + (80+(this.confidence*40))+ ")")
    action = "fold";
    bet = undefined
    message = "Computer can't take it any more."
  }
  if (bet) {
    if (this.bank <= bet) {
      console.log("changing to all in")
      bet = this.bank;
      action = "allIn";
    } else {
      var totalIn = (this.currentBet+bet)
      console.log("cpu currentBet is " + this.currentBet)
      console.log("cpu turn bet is " + bet)
      console.log("cpu totalIn is " + totalIn)
      // get the previous player
      if (this.table.players.indexOf(this)-1 >= 0) {
        var previousPlayer = this.table.players[this.table.players.indexOf(this)-1]
      } else {
        var previousPlayer = this.table.players[this.table.players.length-1]
      }
      // determine if cpu is betting, calling, or raising
      if (!previousPlayer.currentBet) {
        // betting
        console.log("betting ---------------------------------->>>>>>>>>>>")
      } else if (previousPlayer.currentBet === totalIn) {
        // calling
        console.log("calling ---------------------------------->>>>>>>>>>>")
      } else if (previousPlayer.currentBet < totalIn) {
        var raiseAmount = totalIn - previousPlayer.currentBet;
        console.log("raising " + raiseAmount + " ---------------------------------->>>>>>>>>>>")
      }
    }
  } else {

  }
  console.log("final action " + action + ", final bet " + bet)
  console.log("final message " + message)
  $('#thinking-message').text(message);
  this.table.updateFigures();
  return [action, bet]
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
        $('#funds').val(bestMove[1])
        console.log("CPU currentBet: " + self.currentBet + ", table min " + self.table.minimumBet)
        if (self.currentBet < self.table.minimumBet) {
          $('#bet-raise').text("Raise " + bestMove[1])
        } else {
          $('#bet-raise').text("Bet " + bestMove[1])
        }
      }
      setTimeout(function(){
        console.log("bet says " + $('#funds').val() + " when timeout is over and move")
        $('#'+moveAction).click();
        $('#top-message').css({
          'animation-play-state': 'paused'
        })
        // $('.game-button').fadeIn();
        // $('#thinking-message').hide();
        // $('#thinking-message').text("Computer is thinking...");
      },delay);
    },2000);
  }
}