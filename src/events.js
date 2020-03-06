var events = require('events');
var eventEmitter = new events.EventEmitter();

var { pay_ln_invoice } = require('./ln.js');

eventEmitter.on('dm', (message) => {
  if(message.message_data.text.beginWith('ln')) {
    pay_ln_invoice(message.message_data.text);
  }
})

module.exports.eventEmitter = eventEmitter;
