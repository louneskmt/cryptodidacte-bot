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

const getSubscriptions = () => {
  Twitter.get('account_activity/all/dev/subscriptions/list', function (err, data, response) {
    console.log("SUBSCRIPTIONS :\n", data);
  });
}

const getAllWebhooksStatus = () => {
  Twitter.get('account_activity/all/webhooks', function (err, data, response) {
    console.log("ALL :\n", data);
  });
}

const triggerVerification = (id) => {
  Twitter.put('account_activity/all/dev/webhooks/' + id, function (err, data, response) {
    console.log("TRIGGER VERIFICATION :\n", data)
  });
}

module.exports = {
  sendTextMessage,
  getSubscriptions,
  getAllWebhooksStatus,
  triggerVerification
};
