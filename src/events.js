var events = require('events');
var Twitter = require('./Twit');
var lightning = require('./lightning.rest.js');

var eventEmitter = new events.EventEmitter();

eventEmitter.on('dm', (message) => {
  if(message.message_data.text.startsWith('ln')) {
    console.log("Paying invoice : ", message.message_data.text)
    lightning.payInvoice(message.message_data.text);
  }

  if(message.message_data.text.startsWith('Generate invoice for 200 sats')) {
    var invoice = lightning.generateInvoice(200, "Test");
    console.log("Generating invoice")
    Twitter.sendTextMessage('986994912565620736', invoice);
  }
});

module.exports.eventEmitter = eventEmitter;
