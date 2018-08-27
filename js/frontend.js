//Make submission form to enter name


$(document).ready(function() {
  var oneName = $("#enterName").submit(function(event) {
    event.preventDefault();
    $("#enterName").hide();
    $("#container").show();
    var name = $("#name").val()
    $("#playerOneName").text(name);
    console.log()
    // $("#playerOneFunds").text();
    // $("#playerTwoName").text();
    // $("#playerTwoFunds").text();
  });
});
