const Twit = require('twit');
const twitterApp = require('../config.js');
const Twitter = new Twit(twitterApp);

// @lounes_kmt -> 986994912565620736

const sendTextMessage = (user_id, text) => {
  var message = {
    event: {
      type: "message_create",
      message_create: {
        target: {
          recipient_id: user_id
        },
        message_data: {
          text: text
        }
      }
    }
  }

  Twitter.post('direct_messages/events/new', message, function (err, data, response) {
    console.log(data)
    //console.log(response)
  });
}

module.exports = {
  sendTextMessage
};
