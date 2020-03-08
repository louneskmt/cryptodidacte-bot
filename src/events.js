var events = require('events');
var Twitter = require('./Twit');
var lightning = require('./lightning.js');

var eventEmitter = new events.EventEmitter();

eventEmitter.on('dm', (message) => {
  if(message.message_data.text.startsWith('ln')) {
    lightning.sendPayment(message.message_data.text);
  }

  if(message.message_data.text.startsWith('Generate invoice for 200 sats')) {
    invoice = lightning.addInvoice("Test", 200);
    Twitter.sendTextMessage('986994912565620736', invoice);
  }
});

module.exports.eventEmitter = eventEmitter;
