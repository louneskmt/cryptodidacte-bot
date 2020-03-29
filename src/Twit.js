const {__} = require("./logger.js");

const Twit = require('twit');
const { twitterConfig } = require('../config.js');
const Twitter = new Twit(twitterConfig);

const request = require('request');

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
     if(err) __(err,9)
  });
}

const sendTextMessage = (user_id, text) => {
  var message_create_object = {
    text: text
  }

  sendMessage(user_id, message_create_object);
}

const sendMessageWithImage = (user_id, text, filePath) => {
  uploadImage(filePath, (media_id_string, image_type) => {
    var message_create_object = {
      text: text,
      attachment: {
        type: "media",
        media: {
          id: media_id_string
        }
      }
    }
    sendMessage(user_id, message_create_object);
  })
}

const sendMenu = (user_id) => {
  var message_create_object = {
    text: "👋 Hey ! What do you want to do ?",
    quick_reply: {
      type: "options",
      options: [
        {
          label: "🎁 Claim rewards",
          description: "Claim #LNQuiz rewards if you won",
          metadata: "claim_rewards"
        },
        {
          label: "💸 Tip Cryptodidacte",
          description: "Generate an LN invoice to tip Cryptodidacte",
          metadata: "generate_invoice"
        }
        // {
        //   label: "🏦 See CDT Balance",
        //   description: "Display your CryptoDidacteTokens balance",
        //   metadata: "display_cdt_balance"
        // },
        // {
        //   label: "📥 Receive sats",
        //   description: "Test option for sats sending",
        //   metadata: "receive_sats"
        // }
      ]
    }
  }

  sendMessage(user_id, message_create_object);
}

const sendAdminMenu = (user_id) => {
  var message_create_object = {
    text: "👋 Hey, admin ! What do you want to do ? 🤔",
    quick_reply: {
      type: "options",
      options: [
        {
          label: "🏅 Add new #LNQuiz winners",
          description: "Set Twitter accounts as winners",
          metadata: "add_winners"
        },
        {
          label: "ℹ️ Get #LNQuiz Rewards info",
          description: "See the current rewards amounts",
          metadata: "get_rewards_info"
        },
        {
          label: "🔄 Update #LNQuiz Rewards",
          description: "Set new rewards amounts",
          metadata: "update_rewards"
        },
        {
          label: "💸 Send CDT",
          description: "Send CDT to an ETH address or Twitter account",
          metadata: "send_cdt"
        },
        {
          label: "Refill Lightning node",
          description: "Generate an invoice to refill LN node",
          metadata: "refill_node"
        }
      ]
    }
  }
  sendMessage(user_id, message_create_object);
}

const uploadImage = (filePath, callback) => {
  Twitter.postMediaChunked({ file_path: filePath, media_category: "dm_image" }, function (err, data, response) {
    if(err) __(err, 9)
    else{
      __(`Uploaded image : `)
      __(data)
    }

    if(data && typeof callback === "function") {
      callback(data.media_id_string, data.image.image_type)
    }
  });
}

module.exports = {
  Twitter,
  sendTextMessage,
  sendAdminMenu,
  sendMenu,
  uploadImage,
  sendMessageWithImage,
  botId: "1235621426125774850"
};
