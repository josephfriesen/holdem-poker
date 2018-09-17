var table = new Table();
function Table() {
  this.handsPlayed = 0;
  this.handWinner = undefined;
  this.startingBank = 1500;
  this.players = [];
  this.calledOrChecked = [];
  this.communityCards = [];
  this.dealtCards = [];
  this.bigBlind = 80;
  this.dealer;
  this.atBat;
  this.minimumBet = this.bigBlind;
  this.round = "";
  this.pot = 0;
  this.autoDealing = false;
  this.vsCPU = false;
  this.cpu = undefined;
 this.deck = [];
  this.roundIndex = 0;
};
Table.prototype.playerCoords = function(playerIndex) {
  var coords = {};
  coords.x = (this.players[playerIndex].div.offset().left+(this.players[playerIndex].div.width()/2));
  coords.y = (this.players[playerIndex].div.offset().top+(this.players[playerIndex].div.height()/2));
  return coords;
}
Table.prototype.placeOrb = function(playerIndex) {
  var playerCoords = this.playerCoords(playerIndex)
  this.turnOrb.css({
    'left': playerCoords.x +'px',
    'top': playerCoords.y +'px'
  });
}
Table.prototype.moveOrb = function(playerIndex) {
  var playerCoords = this.playerCoords(playerIndex);
  var playerX = Math.round(playerCoords.x);
  var playerY = Math.round(playerCoords.y);
  var orbX =  parseInt(this.turnOrb.css('left'));
  var orbY =  parseInt(this.turnOrb.css('top'));
  if (playerX !== orbX || playerY !== orbY) {
    if (playerIndex === 0) {
      this.turnOrb.css({
        'animation-name': 'bob-down'
      })
    } else {
      this.turnOrb.css({
        'animation-name': 'bob-up'
      })
    }
    this.turnOrb.css({
      'animation-play-state': 'running',
      'opacity': '1'
    })
    // this.turnOrb.fadeIn(100)
    var self = this;
    var playerCoords = this.playerCoords(playerIndex)
    this.turnOrb.css({
      'left': playerX + 'px',
      'top': playerY + 'px'
    });
    setTimeout(function(){
      self.turnOrb.css({
        'animation-play-state': 'paused',
        'opacity': '0'
      });
    },500);
  }
}
Table.prototype.refresh = function() {
  this.handWinner = undefined;
  this.calledOrChecked = [];
  this.communityCards = [];
  this.dealtCards = [];
  this.deck = [];
  this.roundIndex = 0;
  this.dealing = false;
  this.autoDealing = false;
  this.minimumBet = this.bigBlind;
  $('.hole-card').empty();
  $('.community-card').empty();
}
Table.prototype.initiateGame = function(playerNameArray,humanOpponent){
  this.turnOrb = $('#turn-orb');
  this.slots = [
    $('.community-card:first-child'),
    $('.community-card:nth-child(2)'),
    $('.community-card:nth-child(3)'),
    $('.community-card:nth-child(4)'),
    $('.community-card:nth-child(5)')
  ];
  playerNameArray.forEach(function(name,i){
    new Player(this, humanOpponent, name, this.startingBank);
    if (i===0) {
      $('#player-1-name').text(name);
    } else {
      $('#player-2-name').text(name);
    }
  },this);
  this.vsCPU = !this.players[1].human;
  if (this.vsCPU) {
    this.cpu = this.players[1];
  }
  if (this.cpu) {
    $('.space-flip').css({
      'opacity': '0'
    });
  } else {
    $('.game-button').fadeIn();
  }
  this.players.forEach(function(player,i){
    if (this.players.indexOf(player)-1 >= 0) {
      player.previousPlayer = this.players[this.players.indexOf(player)-1]
    } else {
      player.previousPlayer = this.players[this.players.length-1]
    }
  },this);
  this.setDealer(this.players[(this.handsPlayed % 2)]);
  this.atBat = this.players[((this.handsPlayed+1) % 2)];
  this.dealer.blind = this.dealer.currentBet = this.bigBlind;
  this.atBat.blind = this.atBat.currentBet = this.bigBlind/2;
  this.atBat = this.dealer;
  $('#funds').val(this.bigBlind);
  $('#top-message').fadeIn();
  this.createDeck();
  this.shuffle();
  this.advanceRound();
  
}
Table.prototype.showStatusLabel = function(player) {
  var playerNum = this.players.indexOf(player)+1;
  $('.status-label').css({
    'opacity': '0'
  });
  $('#dealer-'+playerNum).animate({
    'opacity': '1'
  },300);
}
Table.prototype.setDealer = function(newDealer) {
  this.dealer = newDealer;
  var playerNum = this.players.indexOf(this.dealer)+1;
  $('.status-label').css({
    'opacity': '0'
  });
  $('#dealer-'+playerNum).animate({
    'opacity': '1'
  },300);
}
Table.prototype.startNewHand = function() {
  if (this.pot) {
    clearInterval(this.drainSequence)
    this.handWinner.bank += this.pot;
    this.pot = 0;
  }
  this.changeButtonSelection();
  this.players.forEach(function(player,i) {
    player.swapLabel();
    player.holeCards = [];
    player.hand = undefined;
    player.confidence = 0;
  });
  this.handsPlayed++;
  this.setDealer(this.players[(this.handsPlayed % 2)]);
  this.atBat = this.players[((this.handsPlayed+1) % 2)];
  this.dealer.blind = this.dealer.currentBet = this.bigBlind;
  this.atBat.blind = this.atBat.currentBet = (this.bigBlind/2);
  this.dealer.statusLabel.addClass('status-label');  
  this.dealer.statusLabel.removeClass('winner-label');
  this.atBat = this.dealer;
  // $('.hole-card').removeClass('protruding');
  $('#funds').val(this.bigBlind);
  $('.playing-card').fadeOut(200);
  $('#top-message').animate({
    'opacity': '0',
  },200,function(){
    $('#top-message').css({
    'cursor':'default',
    'animation-play-state':'initial',
    'transform': 'scale(0.75)'
    });
    $('#top-message').addClass('space-flip')
    $('#top-message').removeClass('space-next')
  });
  $('.win-lose-message').fadeOut();
  $('.game-button').prop("disabled", false);
  $('#call-check').text("Call " + this.minimumBet);
  $('#bet-raise').text("Raise " + this.bigBlind);
  this.refresh();
  this.createDeck();
  this.shuffle();
  var self = this;
  setTimeout(function(){
    self.advanceRound();
  },800);
  
}
Table.prototype.changeButtonSelection = function(handOver,gameOver) {
  var self = this;
  if (gameOver) {
    $('.game-button').hide();
    $('#new-hand').fadeIn();
    $('#new-hand').text("New Game");
    $('#new-hand').off().click(function(){
      window.location.reload();
    });
  } else if (handOver) {
    $('.game-button').hide();
    $('#new-hand').fadeIn();
    $('#new-hand').off().click(function(){
      self.startNewHand()
    });
  } else {
    $('.post-game-button').hide();    
    $('.game-button').fadeIn();    
  }
}
Table.prototype.createDeck = function(){
  poker.suits.forEach(function(suit,i){
    poker.ranks.forEach(function(rank,j){
      this.deck.push(new Card(suit,rank));
    },this)
  },this)
}
Table.prototype.compareCards = function(hand1, hand2, index) {
  if (poker.ranks.indexOf(hand1.cards[index].rank) > poker.ranks.indexOf(hand2.cards[index].rank)) {
    return "card1";
  } else if (poker.ranks.indexOf(hand1.cards[index].rank) < poker.ranks.indexOf(hand2.cards[index].rank)) {
    return "card2";
  } else if (poker.ranks.indexOf(hand1.cards[index].rank) === poker.ranks.indexOf(hand2.cards[index].rank)) {
    return "tie";
  }
}
Table.prototype.shuffle = function() {
  var newDeck = [];
  this.deck.forEach(function(card) {
    newDeck.push(card);
  })
  var len = newDeck.length;
  var output = [];
  var limit;
  var rand;
  for (var j = 0; j < len; j++) {
    limit = len - j;
    rand = Math.floor(Math.random() * (limit));
    output.push(newDeck[rand]);
    newDeck.splice(rand,1);
  }
  this.deck = output;
  return output;
}
Table.prototype.advanceTurn = function() {  
  if (this.roundIndex > 1) {
    if (!this.minimumBet && this.calledOrChecked.length === 0) {
      // first bet = player after dealer (always non-dealer in 2P game)
      if (this.players.indexOf(this.dealer)+1 < this.players.length) {
        var playerIndex = this.players.indexOf(this.dealer)+1
      } else {
        var playerIndex = 0;
      }
      
    } else {
      if (this.players.indexOf(this.atBat)+1 < this.players.length) {
        var playerIndex = this.players.indexOf(this.atBat)+1
      } else {
        var playerIndex = 0;
      }
    }
  } else if (this.roundIndex === 1) {
    if (!this.minimumBet && this.calledOrChecked.length === 0) {
      for (var i=0; i<this.players.length; i++) {
        var player = this.players[i];
        if (player.blind == this.bigBlind) {
          if (i < this.players.length-1) {
            playerIndex = i+1
          } else {
            playerIndex = 0
          }
          continue
        }
      }
    } else {
      if (this.players.indexOf(this.atBat)+1 < this.players.length) {
        var playerIndex = this.players.indexOf(this.atBat)+1
      } else {
        var playerIndex = 0;
      }
    }
  }
  var previousBatter = this.atBat;
  this.fadeTurnGlow(previousBatter)
  this.atBat = this.players[playerIndex];
  
  // see if player has money
  if (!this.atBat.bank) {
    // auto-deal rest of round
    if (!this.autoDealing) {
      this.autoDealing = true;
      this.advanceRound(true);
    }
    return;
  }
  // move orb/glow if changing turns
  var currentRound = poker.rounds[this.roundIndex]
  if (currentRound !== "showdown" && this.atBat !== previousBatter) {
    if (!this.autoDealing) {
      // start moving turnOrb
      var self = this;
      this.moveOrb(this.players.indexOf(this.atBat));
      
      setTimeout(function(){
        self.startTurnGlow(self.atBat);
      },700) // wait for orb to land
    }
  } else if (this.atBat === previousBatter) {
   
    var self = this;
    setTimeout(function(){
      self.startTurnGlow(self.atBat)
    },1200) // wait for holeCard deal animation to finish
  }
  $('.game-button').prop('disabled', false)
  $('#funds').val(this.bigBlind); // default bet/raise amount
  // decide which buttons to disable or change
  if (this.minimumBet) {
    // a bet exists
    var betAmount = this.minimumBet;
    var raiseAmount = parseInt($('#funds').val());
    var totalStake = (this.atBat.bank+this.atBat.currentBet)
    $('#call-check').text("Call " + betAmount);
    $('#bet-raise').text("Raise " + raiseAmount);
    if (totalStake < (betAmount+raiseAmount)) {
      // not enough to raise
      $('#bet-raise').prop("disabled", true);
    }
    if (totalStake < betAmount) {
      // not enough to call
      $('#call-check').prop("disabled", true);
      $('#bet-raise').prop("disabled", true);
    }
  }
  if (this.atBat === this.cpu) {
    var makeCPUMove = true
    if (makeCPUMove) {
      if (this.roundIndex === 2) {
        var delay = 3000
      } else {
        var delay = this.atBat.moveDelay
      }
      this.atBat.makeMove(delay);
    }
  } else {
    var self = this;
    setTimeout(function(){
      if (self.vsCPU) {
        $('#thinking-message').hide();
      }
      $('.game-button').fadeIn();
    },600);  
  }
}
Table.prototype.deal = function(amount) {
  var self = this;
  this.dealing = true;
  if (amount === 2) { // hole
    for (var p=0; p<this.players.length; p++) {
      var player = this.players[p];
      for (var i=0; i<amount; i++) {
        var newCard = self.deck.shift()
        player.holeCards.push(newCard);
        if (this.vsCPU) {
          var isCPU = (player === this.cpu);
          var cpuTurn = (this.atBat === this.cpu)
          // newCard.place(player.slots[i],true,isCPU,isCPU);
          newCard.place(player.slots[i],true,false,false);
        } else {
          newCard.place(player.slots[i],true,true,true);
        }
        
      }
    }
  } else { // community
    $('.game-button').prop("disabled", true);
    if (amount === 3) {
      var newCard = self.deck.shift();
      this.communityCards.push(newCard);
      newCard.place(this.slots[0],true,true);
      setTimeout(function(){
        var newCard2 = self.deck.shift();
        self.communityCards.push(newCard2);
        newCard2.place(self.slots[1],true,true);
        setTimeout(function(){
          var newCard3 = self.deck.shift();
          self.communityCards.push(newCard3);
          newCard3.place(self.slots[2],true,true);
          if (!self.autoDealing) {
            setTimeout(function(){
              if (self.atBat === self.cpu) {
                $('.game-button').hide()
                $('#thinking-message').fadeIn()
              } else {
                $('.game-button').prop("disabled", false);
              }
              self.dealing = false;
            },480)
          }
        },500);
      },500);
    } else {
      var startAt = this.communityCards.length;
      var newCard = this.deck.shift();
      this.communityCards.push(newCard);
      newCard.place(this.slots[startAt],true,true);
      if (!self.autoDealing) {
        setTimeout(function(){
          if (self.atBat === self.cpu) {
            $('.game-button').hide()
          } else {
            $('.game-button').prop("disabled", false);
          }
          self.dealing = false;
        },500)
      }
    }    
  }
  // DOES NOT AUTODEAL PROPERLY VS CPU
  if (this.autoDealing) {
    var roundsLeft = poker.rounds.length-this.roundIndex
    var totalDelay = 0
    for (var i=1; i<roundsLeft; i++) {
      var currentIndex = (this.roundIndex+i);      
      if (currentIndex === 3) {
        totalDelay += 1600; // how long to wait to deal turn card (waits for 3 flop cards)
      } else if (currentIndex === 5) {
        totalDelay += 1000; // how long to wait to show hand results after river
      } else {
        totalDelay += 600; // how long to wait to deal river (waits for turn card)
      }
      setTimeout(function(){
        table.advanceRound();
      },totalDelay);
    }
  } 
}
Table.prototype.advanceRound = function(handOver) {
  this.calledOrChecked = [];
  this.roundIndex++;
  if (this.roundIndex > 1) {
    this.players[0].currentBet = 0;
    this.players[1].currentBet = 0;
    this.minimumBet = 0;
    $('#funds').val(this.bigBlind); 
  }
  var roundName = poker.rounds[this.roundIndex];
  if (roundName === "preFlop") {
    // delay to wait for zoom out effect
    var self = this;
    setTimeout(function(){
      self.players[0].addToPot(self.players[0].blind); // compulsory bets
      self.players[1].addToPot(self.players[1].blind,true);
      self.deal(2); // hole cards
      // starts call/raise because of blinds
      $('#call-check').text("Call " + self.minimumBet);
      $('#bet-raise').text("Raise " + self.bigBlind);
      self.updateFigures();
      self.placeOrb(self.players.indexOf(self.atBat),true)
    },600)
  } else if (roundName === "flop") {
    this.deal(3,handOver);
    $('#call-check').text("Check");
    $('#bet-raise').text("Bet " + table.bigBlind);
  } else if (roundName === "turn") {
    this.deal(1,handOver);
    $('#call-check').text("Check");
    $('#bet-raise').text("Bet " + table.bigBlind);
  } else if (roundName === "river") {
    this.deal(1,handOver);
    $('#call-check').text("Check");
    $('#bet-raise').text("Bet " + table.bigBlind);
  } else if (roundName === "showdown") {
    $('.game-button').prop('disabled','true');
    this.fadeTurnGlow(this.atBat)
    var self = this;
    setTimeout(function(){ // pause for suspense
      self.beginShowdown()
    },500);
  }
  
  if (roundName !== "showdown") {
    this.advanceTurn();
  }
}
Table.prototype.handIndex = function(handKey) {
  var keyArr = Object.keys(this.hands);
  return keyArr.indexOf(handKey);
}
Table.prototype.getHands = function(multiCardArray) {
  var handArray = [];
  var badCard1;
  var badCard2;
  var fiveCardArr = [];
  var newHand;
  var len = multiCardArray.length - 1;
  for (var i = 0; i < len; i++) {
    badCard1 = multiCardArray[i];
    for (var j = i+1; j <= len; j++) {
      badCard2 = multiCardArray[j];
      fiveCardArr = multiCardArray.filter(function(card) {
        return card != badCard1;
      });
      fiveCardArr = fiveCardArr.filter(function(card) {
        return card != badCard2;
      });
      newHand = new Hand(fiveCardArr);
      handArray.push(newHand);
      fiveCardArr = [];
    }
  }
  return handArray;
}
Table.prototype.evaluateHand = function(hand) {
  for (handKey in poker.handActions) {
    if (poker.handActions[handKey].evaluate(hand)) {
      return handKey;
    }
  }
};
Table.prototype.findBestHand = function(handArray) {
  var bestHand = 9;
  handArray.forEach(function(hand) {
    if (poker.handKeys.indexOf(hand.handValue) < bestHand) {
      bestHand = poker.handKeys.indexOf(hand.handValue);
    }
  })
  bestArr = [];
  handArray.forEach(function(hand) {
    if (poker.handKeys.indexOf(hand.handValue) === bestHand) {
      bestArr.push(hand);
    }
  })
  var handType = bestArr[0].handValue;
  var len = bestArr.length;
  if (len === 1) {
    return bestArr[0];
  } else {
    for (var i = 0; i < len - 1; i++) {
      if (poker.handActions[handType].breakTie(bestArr[0], bestArr[1]) === "hand1") {
        bestArr.splice(1,1);
      } else {
        bestArr.shift();
      }
      // here, what I want to do is call the specific breakTie function associated with the handValue key stored in variable handType, with hands bestArr[i] and bestArr[i+1] as arguments, then remove the losing hand from bestArr before moving on to the next step in the loop.
    }
  }
  return bestArr[0];
}
Table.prototype.findWinner = function (player1, player2) {
  if (poker.handKeys.indexOf(player1.hand.handValue) < poker.handKeys.indexOf(player2.hand.handValue)) {
    return player1;
  } else if (poker.handKeys.indexOf(player1.hand.handValue) > poker.handKeys.indexOf(player2.hand.handValue)) {
    return player2;
  } else {
    var handType = player1.hand.handValue;
    if (poker.handActions[handType].breakTie(player1.hand, player2.hand) === "hand1") {
      return player1;
    } else if (poker.handActions[handType].breakTie(player1.hand, player2.hand) === "hand2") {
      return player2;
    } else {
      return "tie";
    }
  }
};
Table.prototype.numberOfSuit = function(arr,suit) {
  var suits = 0;
  arr.forEach(function(card){
    if (card.suit === suit) {
      suits++
    }
  })
  return suits;
}
Table.prototype.numberOfRank = function(arr,rank) {
  var ranks = 0;
  arr.forEach(function(card){
    if (card.rank === rank) {
      ranks++
    }
  })
  return rank;
}

Table.prototype.beginShowdown = function() {
  var arr1 = this.players[0].holeCards.concat(this.communityCards);
  var handArr1 = this.getHands(arr1);
  this.players[0].hand = this.findBestHand(handArr1);
  var arr2 = this.players[1].holeCards.concat(this.communityCards);
  var handArr2 = this.getHands(arr2);
  this.players[1].hand = this.findBestHand(handArr2);
  this.handWinner = this.findWinner(this.players[0], this.players[1]);
  if (this.handWinner === "tie") {
    var half = Math.round(this.pot/2);
    this.players[0].addToPot(-half);
    this.players[1].addToPot(-this.pot);
    if (this.players[0].hand.handValue === "highCard") {
      var appendage = " " + this.players[0].hand.cards[0].rank;
    } else {
      var appendage = "";
    }
    $('#winner-message').text("It's a tie!");
    $('#loser-message').text("Both players have " + poker.handInfo[this.players[0].hand.handValue].fullName + appendage);
    $('.win-lose-message').fadeIn();
    this.atBat.statusLabel.removeClass("status-label");
    this.atBat.statusLabel.removeClass("winner-label");
    this.revealHands();
    this.showHandResults(true);
    this.updateFigures();
  } else {
    this.handWinner.handsWon++;
    if (this.players.indexOf(this.handWinner) === 0) {
      var loser  = this.players[1];
    } else {
      var loser = this.players[0];
    }
    this.drainPot(this.handWinner);
    this.updateFigures();
    this.showStatusLabel(this.handWinner);
    this.handWinner.statusLabel.addClass("winner-label");
    if (this.handWinner.hand.value === "highCard") {
      var appendage1 = " " + this.handWinner.hand.cards[0].rank;
      var appendage2 = " " + loser.hand.cards[0].rank;
    } else {
      var appendage1 = "";
      var appendage2 = "";
    }
    $('#winner-message').text(this.handWinner.name + " wins with " + poker.handInfo[this.handWinner.hand.handValue].fullName + appendage1);
    $('#loser-message').text(loser.name + " had " + poker.handInfo[loser.hand.handValue].fullName + appendage2);
    $('.win-lose-message').fadeIn();
    this.revealHands();
    this.showHandResults();
  }
};
Table.prototype.revealHands = function(){
  $('#thinking-message').hide();
  this.players[0].holeCards[0].animateFlip("front");
  this.players[0].holeCards[1].animateFlip("front");
  this.players[1].holeCards[0].animateFlip("front");
  this.players[1].holeCards[1].animateFlip("front");
  // $('.hole-card').addClass('protruding');
}
Table.prototype.showHandResults = function(notHand){
  $('#thinking-message').hide();
  if (!notHand) {
    var winningHand = this.handWinner.hand;
    var involvedCards = poker.handInfo[winningHand.handValue].cardsInvolved;
    for (var i=0; i<this.dealtCards.length; i++) {
      var card = this.dealtCards[i];
      if (winningHand.cards.indexOf(card) > -1 && winningHand.cards.indexOf(card) < involvedCards) {
        card.div.addClass('protruding');
      } else {
        card.div.css({
          'opacity': '0.4',
        })
      }
      
    }
  }
  $('#top-message').removeClass('space-flip');
  $('#top-message').removeClass('space-next');
  var gameOver = false;
  this.players.forEach(function(player,i){
    if (!player.bank) {
      gameOver = true;
    }
  })
  if (gameOver) {
    $('#top-message').removeClass('space-next');
    $('#top-message').removeClass('space-flip');
    $('#top-message').html("<span>WINNER: " + this.handWinner.name + " with " + this.handWinner.handsWon + "/" + (this.handsPlayed+1) + " hands won</span>");
    var topCursor = "initial"
  } else {
    $('#top-message').addClass('space-next');
    var topCursor = "pointer"
  }
  this.changeButtonSelection(true,gameOver);
  $('.game-button').prop("disabled", false);
  $('#top-message').animate({
    'opacity': '1'
  },500,function(){
    $('#top-message').css({
      'cursor': topCursor,
      'animation-play-state':'running',
      'transform': 'scale(1)'
    });
    
  });
}
Table.prototype.drainPot = function(winner) {
  var self = this;
  this.drainSequence = setInterval(function(){
    winner.addToPot(-1)
    self.updateFigures()
    if (!self.pot) {
      clearInterval(self.drainSequence);
    }
  },5)
}
Table.prototype.updateFigures = function() {
  $('#pot-amount').text(this.pot);
  $('#player-1-bank').text(this.players[0].bank);
  $('#player-2-bank').text(this.players[1].bank);
  $('#player-1-bet').text(this.players[0].currentBet);
  $('#player-2-bet').text(this.players[1].currentBet);
  if (this.cpu) {
    $('#player-2-name').html(this.cpu.name + ": "+this.cpu.confidence);
  }
};
Table.prototype.fadeTurnGlow = function(player) {
  player.div.css({
    'animation-name': 'fade-pulse',
    'animation-iteration-count': '1',
    'animation-duration': '250ms'
  })
}
Table.prototype.startTurnGlow = function(player) {
  player.div.css({
    'animation-name': 'pulse',
    'animation-iteration-count': 'infinite',
    'animation-duration': '1000ms'
  })
}
