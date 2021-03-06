$(document).ready(function() {
  $('body').fadeIn();
  $('.blind-amounts').text((table.bigBlind/2)+"/"+table.bigBlind)
  $('.starting-bank').text(table.startingBank)
  $(".start-button").click(function(event) {
    event.preventDefault();
    $("#sign-in-box").hide();
    $("#table").fadeIn(1);
    $("#table").css({
      'transform': 'scale(1)'
    });
    $("#action-buttons").removeClass("off-to-bottom");
    $("#action-buttons").fadeIn();
    $('#new-game-button').fadeIn();
    
    var name1 = $("#name-input-1")[0];
    var name2 = $("#name-input-2")[0];
    var names = [ name1.value || name1.placeholder, name2.value || name2.placeholder ];
    var humanOpponent = $(this)[0].id === "two-player-start"
    if (!humanOpponent && !name2.value) {
      names[1] = "Computer"
    }
    table.initiateGame(names,humanOpponent);
  });
  $('#call-check').click(function(){
    var player = table.atBat;
    var amountToAdd = 0;
    table.calledOrChecked.push(player);
    if (table.minimumBet) {
      // call
      amountToAdd = table.minimumBet - player.currentBet;
      player.currentBet += amountToAdd;
      table.minimumBet = player.currentBet;
      player.emitAction($(this).text());
      player.addToPot(amountToAdd);
      table.advanceRound();
    } else {
      player.emitAction($(this).text());
      if (table.calledOrChecked.length === table.players.length) {
        table.advanceRound();
      } else if (table.roundIndex < 5) {
        table.advanceTurn();
      }
    }
    table.updateFigures();
  });
  $('#bet-raise').click(function() {
    var player = table.atBat;
    var raiseAmount = parseInt($('#funds').val());
    var matchAmount = table.minimumBet-player.currentBet
    var amountToAdd = matchAmount+raiseAmount;
    player.currentBet += amountToAdd;
    table.minimumBet = player.currentBet;
    player.addToPot(amountToAdd);
    player.emitAction($(this).text());
    // $('#call-check').text("Call " + table.minimumBet);
    // $('#bet-raise').text("Raise " + table.bigBlind);
    table.updateFigures();
    table.advanceTurn();
    table.calledOrChecked = [];
  });
  $('#allIn').click(function(){
    var player = table.atBat;
    var raiseAmount = table.minimumBet = player.bank;
    player.currentBet += raiseAmount;
    player.addToPot(raiseAmount);
    player.emitAction($(this).text());
    // $('#call-check').text("Call " + table.minimumBet);
    // $('#bet-raise').text("Raise " + table.bigBlind);
    table.updateFigures();
    table.advanceTurn();
    table.calledOrChecked = [];
  });
  $('#fold').click(function(){
    table.atBat.fold()
  });
  $('#new-hand').click(function(){
    $(this).fadeOut();
    table.startNewHand()
  });
  $('#new-game-button').click(function(){
    window.location.reload()
  });
  document.getElementById("hole-1").onmousedown = function(){
    if (!table.vsCPU) {
      table.players[0].flippedCards = true;
      table.players[0].holeCards.forEach(function(card){
        card.animateFlip("auto",64)
      });
    }
  };
  document.getElementById("hole-2").onmousedown = function(){
    if (!table.vsCPU) {
      table.players[1].flippedCards = true;
      table.players[1].holeCards.forEach(function(card){
        card.animateFlip("auto",64)
      });
    }
  };
  document.body.onmouseup = function(){
    table.players.forEach(function(player,i){
      if (player.flippedCards) {
        player.holeCards.forEach(function(card){
          card.animateFlip("auto",64)
        });
        player.flippedCards = false;
      }
    });
  };
});
function hasLetters(string) {
  var parsedString = parseInt(string);
  var origLength = string.length;
  var parseLength = parsedString.toString().length
  if (origLength !== parseLength) {
    return true;
  }
}
// window.addEventListener("resize", function() {
//   table.dealtCards.forEach(function(card,i) {
//     card.dimensions.width = $('.hole-card').width();
//     card.dimensions.height = $('.hole-card').height();
//     if (card.div.css("background-image").includes("cardsheet")) {
//       var pos = {};
//       pos.left = table.ranks.indexOf(card.rank) * card.dimensions.width;
//       pos.top = table.suits.indexOf(card.suit) * card.dimensions.height;
//       card.div.css({
//         'background-size': (card.dimensions.width*13)+'px '+(card.dimensions.height*4)+'px',
//         'background-position': '-' + pos.left + 'px -' + pos.top + 'px',
//         'width': card.dimensions.width + 'px',
//         'height': card.dimensions.height + 'px',
//       });
//     } else {
//       card.div.css({
//         'background-size': (card.dimensions.width)+'px '+(card.dimensions.height)+'px',
//         'background-position': '0 0',
//         'width': card.dimensions.width + 'px',
//         'height': card.dimensions.height + 'px',
//       });
//     }
//   });
// });
document.onkeydown = function(event) {
  if (!table.vsCPU && event.keyCode == 32) {
    // if (event.keyCode == 32) {
      if ($('#top-message').css('cursor') === 'pointer') {
      event.preventDefault();
      table.startNewHand()
    } else if (!table.atBat.flippedCards) {
      event.preventDefault();
      table.atBat.flippedCards = true;
      table.atBat.holeCards.forEach(function(card){
        card.animateFlip("auto",64)
      });
    }
  }
};
document.onkeyup = function(event) {
  if (!table.vsCPU && event.keyCode == 32) {
    // if (event.keyCode == 32) {
      if ($('#top-message').css('cursor') !== 'pointer') {
      if (table.atBat.flippedCards) {
        event.preventDefault();
        table.atBat.holeCards.forEach(function(card){
          card.animateFlip("auto",64)
        });
        table.atBat.flippedCards = false;
      }
    }
  }
}
window.addEventListener("input",function(event){
  if (event.target.id === "funds") {
    var nonNumber = hasLetters($('#funds').val());
    if (nonNumber) {
      $('#funds').val(parseInt($('#funds').val()));
    }
    if ($('#bet-raise').text() === "Bet") {
      var tooMuch = $('#funds').val() > table.atBat.bank
      if (tooMuch) {
        $('#funds').val(table.atBat.bank);
      }
      $('#bet-raise').text("Bet " + $('#funds').val());
    } else {
      var tooMuch = $('#funds').val() > table.atBat.bank-table.atBat.currentBet
      if (tooMuch) {
        $('#funds').val(table.atBat.bank-table.atBat.currentBet);
      }
      $('#bet-raise').text("Raise " + $('#funds').val());
    }
  }
});
function randomInt(min,max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
};
jQuery.prototype.timeAnimation = function(duration) {
  this.css({
    'animation-play-state': 'running'
  })
  var self = this;
  setTimeout(function(){
    self.css({
      'animation-play-state': 'paused',
    })
  },duration)
}