
var twit = require('twit');
var config = require('./config.js');

var Twitter = new twit(config);

var message = {
  event: {
    type: "message_create",
    message_create: {
      target: {
        recipient_id: "986994912565620736"
      },
      message_data: {
        text: "Hello World!"
      }
    }
  }
}

Twitter.post('direct_messages/events/new', message, function (err, data, response) {
  console.log(data)
  //console.log(response)
})

setTimeout(function() {

}, 60000);
