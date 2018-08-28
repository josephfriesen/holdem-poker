//Make submission form to enter name

var oneBank = 1500

$(document).ready(function() {
  var oneName = $("#enterName").submit(function(event) {
    event.preventDefault();
    $("#enterName").hide();
    $("#container").show();
    var name = $("#name").val()
    $("#playerOneName").text(name);
    $("#playerOneBank").text(oneBank);
    console.log()
    // $("#playerOneFunds").text();
    // $("#playerTwoName").text();
    // $("#playerTwoFunds").text();
  });
});


//Future reference for action actionButtons depending on scenario

//If no bets at moment
// $("#check").show();
// $("#bet").show();
// $("#allIn").show();

//If opponent bets or raises
// $("#call").show();
// $("#raise").show();
// $("#allIn").show();

//If opponent goes all in
// $("#call").show();
// $("#fold").show();
