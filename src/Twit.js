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

const getUserInfo = ({user_id, user_name} = {}) => {
  let query;
  if(user_id) query = {user_id: user_id};
  else if (user_name) query = {screen_name: user_name};
  else return;

  return new Promise((resolve, reject) => {
    Twitter.get('users/show', query, function (err, data, response) {
      if(err) {
        reject(err);
        __(err, 9);
      }
      resolve(data);
    });
  });
}

module.exports = {
  Twitter,
  sendTextMessage,
  uploadImage,
  sendMessageWithImage,
  getUserInfo,
  botId: "1235621426125774850"
};
