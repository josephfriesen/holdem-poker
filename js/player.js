function Player(name, bank) {
this.name = name;
this.bank = bank;
this.bet
}

var actions = ["check", "call", "bet", "raise", "allIn", "fold"]
var amount = "";



Player.prototype.betMoney = function() {
  this.bank;
  if ((actions === "check") || (actions === "call") )
    return this.bank;
  if ((actions === "bet") || (actions === "raise") )
    return this.bank - amount;
  if (actions === "allIn")
    return 0;
}

var oneName = "playerOne";
var oneBank = 1500

console.log(oneName);
console.log(oneBank);

var one = new Player(oneName, oneBank)
var bet = one.betMoney();

$(document).ready(function() {
  $("#form").submit(function(event) {
    event.preventDefault();
    actions = "bet"
    amount = parseInt($("#input").val());
    bet;
    console.log ("Player 1 bet: " + amount)
    oneBank = oneBank - amount;
    console.log("Money left: " + oneBank);
  });
});
