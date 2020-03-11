const Twit = require('twit');
const twitterApp = require('../config.js');
const Twitter = new Twit(twitterApp);
const request = require('request');

// @lounes_kmt -> 986994912565620736

const sendMessage = (user_id, message_create_object) => {
  var message = {
    event: {
      type: "message_create",
      message_create: {
        target: {
          recipient_id: user_id
        },
        message_data: message_create_object
      }
    }
  }

  Twitter.post('direct_messages/events/new', message, function (err, data, response) {
    console.log(data)
  });
}

const sendTextMessage = (user_id, text) => {
  var message_create_object = {
    text: text
  }

  sendMessage(user_id, message_create_object);
}

const sendMessageWithImage = (user_id, text, filePath) => {
  uploadImage(filePath, (media_id_string) => {
    var message_create_object = {
      text: text,
      attachment: {
        media_id: media_id_string
      }
    }
    sendMessage(user_id, message_create_object);
  })
}

const sendMenu = (user_id) => {
  var message_create_object = {
    text: "What do you want to do ?",
    quick_reply: {
      type: "options",
      options: [
        {
          label: "Claim rewards",
          description: "Claim #LNQuiz rewards if you won",
          metadata: "claim_rewards"
        },
        {
          label: "Tip Cryptodidacte",
          description: "Generate an LN invoice to tip Cryptodidacte",
          metadata: "generate_invoice"
        },
        {
          label: "Receive sats",
          description: "Test option for sats sending",
          metadata: "receive_sats"
        }
      ]
    }
  }

  sendMessage(user_id, message_create_object);
}

const uploadImage = (filePath, callback) => {
  Twitter.postMediaChunked({ file_path: filePath }, function (err, data, response) {
    console.log(err || data)
    if(data && typeof callback === "function") {
      callback(data.media_id_string)
    }
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
  sendMenu,
  uploadImage,
  sendMessageWithImage,
  getSubscriptions,
  getAllWebhooksStatus,
  triggerVerification
};
