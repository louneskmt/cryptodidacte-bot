const Twit = require('twit');
const { __ } = require('./logger.js');

const { twitterConfig } = require('../config.js');

const Twitter = new Twit(twitterConfig);

const sendMessage = (userId, messageData) => {
  const message = {
    event: {
      type: 'message_create',
      message_create: {
        target: {
          recipient_id: userId,
        },
        message_data: messageData,
      },
    },
  };

  Twitter.post('direct_messages/events/new', message, (err) => {
    if (err) __(err, 9);
  });
};

const sendTextMessage = (userId, text) => {
  const messageData = {
    text,
  };

  sendMessage(userId, messageData);
};

const uploadImage = (filePath, callback) => {
  Twitter.postMediaChunked({ file_path: filePath, media_category: 'dm_image' }, (err, data) => {
    if (err) __(err, 9);
    else {
      __('Uploaded image : ');
      __(data);
    }

    if (data && typeof callback === 'function') {
      callback(data.media_id_string, data.image.image_type);
    }
  });
};

const sendMessageWithImage = (userId, text, filePath) => {
  uploadImage(filePath, (mediaId) => {
    const messageData = {
      text,
      attachment: {
        type: 'media',
        media: {
          id: mediaId,
        },
      },
    };
    sendMessage(userId, messageData);
  });
};

const getUserInfo = ({ userId, username } = {}) => {
  let query;
  if (userId) query = { user_id: userId };
  else if (username) query = { screen_name: username };
  else return;

  return new Promise((resolve, reject) => {
    Twitter.get('users/show', query, (err, data) => {
      if (err) {
        reject(err);
        __(err, 9);
      }
      resolve(data);
    });
  });
};

module.exports = {
  Twitter,
  sendTextMessage,
  sendMessage,
  uploadImage,
  sendMessageWithImage,
  getUserInfo,
};
