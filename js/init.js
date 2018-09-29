$(document).ready(function() {
  $("#table").hide()
  if (window.innerWidth < window.innerHeight) {
    // portrait
    if (window.innerWidth <= 500) {
      // small phone
      $('#two-player-start').hide();
      $('#vs-cpu-start').text("Start Game");
      $('#name-input-2')[0].placeholder = table.aiNames[randomInt(0,table.aiNames.length-1)]
    } else {
      // large phone/tablet

    }
    // header is 8vh
    // top-message is 4vh
    // table is 120vw
    // leaves 23vh bottom space
    var usedSpace = (window.innerHeight*0.12) + (window.innerWidth*1.2);
    var bottomSpace = (window.innerHeight - usedSpace)*0.8;
    if (bottomSpace < 150) {
      console.log("COCKS")
      console.log(bottomSpace)

    } else {
      console.log(bottomSpace)
    }
    document.querySelector("#button-area").style.setProperty("height",bottomSpace+"px")

  } else {
    // landscape
    document.querySelector("#table").style.setProperty('--table-height', '50vw')
    document.querySelector("#table").style.setProperty('--table-width', (50*(10 / 6)) + 'vw')
  }
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
    $("#button-area").removeClass("off-to-bottom");
    $("#button-area").fadeIn();
    $('#new-game-button').fadeIn();
    var name1 = $("#name-input-1")[0];
    var name2 = $("#name-input-2")[0];
    var names = [ name1.value || name1.placeholder, name2.value || name2.placeholder ];
    var humanOpponent = ($(this)[0].id === "two-player-start");
    if (!humanOpponent && !name2.value.length && name2.placeholder === "Player 2") {
      names[1] = table.aiNames[0,table.aiNames.length-1];
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
      table.advanceRound();    } else {
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
    var raiseAmount = parseInt($('#player-bet-amount').val());
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
  $('#all-in').click(function(){
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
  if (event.target.id === "player-bet-amount") {
    var nonNumber = hasLetters($('#player-bet-amount').val());
    if (nonNumber) {
      $('#player-bet-amount').val(parseInt($('#player-bet-amount').val()));
    }
    if ($('#bet-raise').text() === "Bet") {
      var tooMuch = $('#player-bet-amount').val() > table.atBat.bank
      if (tooMuch) {
        $('#player-bet-amount').val(table.atBat.bank);
      }
      $('#bet-raise').text("Bet " + $('#player-bet-amount').val());
    } else {
      var tooMuch = $('#player-bet-amount').val() > table.atBat.bank-table.atBat.currentBet
      if (tooMuch) {
        $('#player-bet-amount').val(table.atBat.bank-table.atBat.currentBet);
      }
      $('#bet-raise').text("Raise " + $('#player-bet-amount').val());
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