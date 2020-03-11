var events = require('events');
var Twitter = require('./Twit');
var lightning = require('./lightning.rest.js');

var eventEmitter = new events.EventEmitter();

eventEmitter.on('dm', (user_id, message_create_object) => {
  var message = message_create_object.message_data.text;
  
  if(message.startsWith('ln')) {
    console.log("Paying invoice : ", message)
    Twitter.sendTextMessage(user_id, "Paying invoice...");
    lightning.payInvoice(message, () => {
      Twitter.sendTextMessage(user_id, "✅ Paid!");
    }, (err) => {
      Twitter.sendTextMessage(user_id, "❌ Error paying invoice... Please try later.");
      Twitter.sendTextMessage(user_id, "Logs : " + err.payment_error);
    });
  }

  if(message.startsWith('Generate invoice for 200 sats')) {
    console.log("Generating invoice");
    Twitter.sendTextMessage(user_id, "Generating invoice...");
    lightning.generateInvoice(200, "Test", (invoice) => {
      Twitter.sendTextMessage(user_id, "✅ Done!");
      Twitter.sendTextMessage(user_id, invoice);
    }, (err) => {
      Twitter.sendTextMessage(user_id, "❌ Error generating invoice... Please try later.");
    });
  }
});

module.exports.eventEmitter = eventEmitter;
