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

  return new Promise((resolve, reject) => {
    Twitter
      .post('direct_messages/events/new', message)
      .then(() => resolve())
      .catch((err) => __(err, 9));
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

const getRetweeters = (tweetId) => new Promise((resolve, reject) => {
  Twitter.get('statuses/retweeters/ids', { id: tweetId, stringify_ids: true }, (err, data) => {
    if (err) {
      reject(err);
      __(err, 9);
    }
    resolve(data);
  });
});

const getTweetInfo = (tweetId) => new Promise((resolve, reject) => {
  Twitter.get('statuses/show/:id', { id: tweetId }, (err, data) => {
    if (err) {
      reject(err);
      __(err, 9);
    }
    resolve(data);
  });
});

const getManyTweetsInfo = (idsArray) => new Promise((resolve, reject) => {
  const MAX_TWEETS = 100;
  const resultArrayOfArrays = [];
  const promisesArray = [];

  for (let i = 0; i < idsArray.length; i += MAX_TWEETS) {
    const ids = idsArray.slice(i, i + MAX_TWEETS).join(',');

    const lookupPromise = Twitter.get('statuses/lookup', { id: ids });

    lookupPromise
      .then((result) => {
        resultArrayOfArrays.push(result.data);
      })
      .catch((err) => {
        reject(err);
        __(err, 9);
      });

    promisesArray.push(lookupPromise);
  }

  Promise
    .all(promisesArray)
    .then(() => {
      const resultArray = Array.prototype.concat(...resultArrayOfArrays);
      resolve(resultArray);
    });
});

const replyToTweet = async (tweetId, content) => {
  const originalTweet = await getTweetInfo(tweetId);
  const statusData = {
    status: `@${originalTweet.user.screen_name} ${content}`,
    in_reply_to_status_id: tweetId,
  };

  Twitter.post('statuses/update', statusData, (err) => {
    if (err) __(err, 9);
  });
};

module.exports = {
  Twitter,
  sendTextMessage,
  sendMessage,
  uploadImage,
  sendMessageWithImage,
  getUserInfo,
  getTweetInfo,
  replyToTweet,
  getRetweeters,
  getManyTweetsInfo,
};
