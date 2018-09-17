Player.prototype.chooseAction = function() {
  var action = undefined;
  var wager = 0;
  if (this.confidence > 5) {
    // call and raise BB or bet BB*2
    action = "bet-raise";
    if (this.previousPlayer.currentBet) {
      // call and raise bigBlind
      var callAmount = this.previousPlayer.currentBet - this.currentBet;
      wager += callAmount;
      wager += this.table.bigBlind;
    } else {
      // bet bigBlind*2
      wager = this.table.bigBlind*2;
    }
  } else if (this.confidence > 3) {
    // call or bet BB
    wager = this.table.bigBlind;
    if (this.previousPlayer.currentBet) {
      // call
      action = "call-check";
    } else {
      // bet bigBlind
      action = "bet-raise";
    }
  } else if (this.confidence > 1) {
    // call or check
    action = "call-check";
    if (this.previousPlayer.currentBet) {
      // call
      
    } else {
      // check

    }
  } else {
    // check or fold
    if (!randomInt(0,10)) {
      console.log("randomly folding at confidence 0")
      action = "fold"
    } else {
      action = "call-check";
    }
  }
  return [action, wager];
}
Player.prototype.receiveHoleCardConfidence = function() {
  var hole1 = this.holeCards[0];
  var hole2 = this.holeCards[1];
  if (hole1.rank === hole2.rank) {
    // has a pair
    if (hole1.value < 5) {
      // has a high pair
      this.confidence += 3;
      console.log("CPU +3 for high inside pair: " + hole1.rank + "s! " + this.confidence);
    } else if (hole1.value > 8) {
      // has a low pair
      this.confidence += 1;
      console.log("CPU +1 for low inside pair: " + hole1.rank + "s! " + this.confidence);
    } else {
      // has a medium pair
      this.confidence += 2;
      console.log("CPU +2 for med inside pair: " + hole1.rank + "s! " + this.confidence);
    }
  } else if (hole1.suit === hole2.suit) {
    // has two of same suit
    this.confidence += 2;
    this.hopes.flush += 2;
    console.log("CPU +2 for "+hole1.suit+" hole cards! " + this.confidence);
  }
  if (hole1.value < 5 || hole2.value < 5 ) {
    // has one or two face cards
    if (hole1.value < 5 && hole2.value < 5) {
      // has two face cards
      this.confidence += 2
      console.log("CPU +2 for two face hole cards! " + this.confidence)
    } else {
      // has one face card
      this.confidence += 1
      console.log("CPU +1 for one face hole card! " + this.confidence);
    }
  }
}
Player.prototype.receiveHandConfidence = function() {
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
  var communityCards = this.table.communityCards
  if (hole1.suit === hole2.suit) {
    var numberOfSuit = this.table.numberOfSuit(communityCards,hole1.suit);
    if (communityCards.length === 3) {
      if (numberOfSuit < 1) {
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
    } else if (communityCards.length === 4 && this.hopes.flush) {
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
    } else if (communityCards.length === 5 && this.hopes.flush) {
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
  var winningHand = undefined;
  var hole1 = this.holeCards[0];
  var hole2 = this.holeCards[1];
  if (this.table.communityCards.length === 0) {
    // preFlop
    this.receiveHoleCardConfidence()
    message = poker.cpuMessages["preFlop"][this.confidence];
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
      this.hand = hand2;
      console.log("turn enabled a better hand: " + hand2.handValue)
    } else {
      this.hand = hand1;
      console.log("turn did not enable better than: " + hand1.handValue)
    }
    this.checkFlushPotential();
    if (!this.hand.rated) {
      this.receiveHandConfidence();
    }   
    message = poker.cpuMessages["turn"][this.confidence];
  } else if (this.table.communityCards.length === 5) {
    // river
    var hands = this.table.getHands([this.holeCards[0],this.holeCards[1],this.table.communityCards[0],this.table.communityCards[1],this.table.communityCards[2],this.table.communityCards[3],this.table.communityCards[4]])
    winningHand = this.table.findBestHand(hands);
    console.log("this.hand is " + this.hand.handValue);
    console.log("winningHand is " + winningHand.handValue)
    if (winningHand.handValue > this.hand.handValue) {
      this.hand = winningHand;
      console.log("changed hand. rated " + this.hand.rated);
    }
    this.checkFlushPotential();
    if (!this.hand.rated) {
      this.receiveHandConfidence()
    }
    message = poker.cpuMessages["river"][this.confidence]
  }
  if (!this.previousPlayer.currentBet && this.table.calledOrChecked > 0) {
    this.confidence += 1;
    console.log("CPU +1 from no opponent bet, now " + this.confidence)
  }
  var move = this.chooseAction();
  var action = move[0];
  var wager = move[1];
  if (!randomInt(0,2) && this.table.minimumBet > 80+(this.confidence*80)) {
    console.log("min bet " + this.table.minimumBet + " and conf score " + this.confidence + " (" + (80+(this.confidence*40))+ ")")
    action = "fold";
    wager = undefined
    message = this.name + " can't take it any more."
  }
  // if (wager) {
  //   if (wager >= this.bank) {
  //     console.log("changing to all in")
  //     wager = undefined;
  //     action = "allIn";
  //   } else {
  //     var totalIn = (this.currentBet+wager)
  //     console.log("cpu currentBet is " + this.currentBet)
  //     console.log("cpu turn wager is " + wager)
  //     console.log("cpu totalIn is " + totalIn)
  //     // determine if cpu is betting, calling, or raising
  //     if (!this.previousPlayer.currentBet) {
  //       // betting
  //       console.log("betting " + wager + " --------------->>>>>>>>>>>")
  //     } else if (this.previousPlayer.currentBet === totalIn) {
  //       // calling
  //       console.log("calling " + wager + " --------------->>>>>>>>>>>")
  //     } else if (this.previousPlayer.currentBet < totalIn) {
  //       var raiseAmount = totalIn - this.previousPlayer.currentBet;
  //       console.log("raising " + raiseAmount + " ----------------->>>>>>>>>>>")
  //     }
  //   }
  // } else {

  // }
  console.log("final action " + action + ", final wager " + wager + ", confidence " + this.confidence)
  $('#thinking-message').text(this.name+message);
  this.table.updateFigures();
  return [action, wager]
}
Player.prototype.makeMove = function(delay) {
  if (!this.table.autoDealing) {
    $('.game-button').prop('disabled',true)
    $('.game-button').hide()
    $('#thinking-message').text(this.name+" is thinking...")
    $('#thinking-message').fadeIn();
    var self = this;
    setTimeout(function(){
      var bestMove = self.pickBestMove();
      var moveAction = bestMove[0]
      if (bestMove[1]) {
        $('#funds').val(bestMove[1])
        if (self.currentBet < self.table.minimumBet) {
          $('#bet-raise').text("Raise " + bestMove[1])
        } else {
          $('#bet-raise').text("Bet " + bestMove[1])
        }
      }
      setTimeout(function(){
        $('#'+moveAction).click();
        $('#top-message').css({
          'animation-play-state': 'paused'
        })
      },delay);
    },2000);
  }
}