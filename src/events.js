var events = require('events');
var Twitter = require('./Twit');
var lightning = require('./lightning.rest.js');

var eventEmitter = new events.EventEmitter();

eventEmitter.on('dm', (user_id, message) => {
  if(message.startsWith('ln')) {
    console.log("Paying invoice : ", message)
    lightning.payInvoice(message);
  }

  if(message.startsWith('Generate invoice for 200 sats')) {
    var invoice = lightning.generateInvoice(200, "Test");
    console.log("Generating invoice")
    Twitter.sendTextMessage(user_id, invoice);
  }
});

module.exports.eventEmitter = eventEmitter;
