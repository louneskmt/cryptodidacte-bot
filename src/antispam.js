const { __ } = require('./logger.js');
const { TweetEvent } = require('./database/mongoose.js');
const { deleteEvent } = require('./fidelity.js');
const Twitter = require('./Twitter.js');

const retweetVerification = () => {
  const to = new Date();
  const from = new Date(to.getTime() - 86400000);
  TweetEvent
    .findByDateRange(from, to)
    .then((results) => {
      const allRetweetEvents = results.filter((event) => event.eventType === 'retweet');
      const allRetweetedIds = [...new Set(allRetweetEvents.map((event) => event.targetTweetId))];

      allRetweetedIds.forEach((tweetId) => {
        Twitter
          .getRetweeters(tweetId)
          .then((data) => {
            const retweeters = data.ids;
            const retweetEvents = allRetweetEvents.filter((event) => event.targetTweetId === tweetId);

            retweetEvents.forEach((retweetEvent) => {
              if (!retweeters.includes(retweetEvent.user._id)) {
                __(`Event ${retweetEvent._id} from @${retweetEvent.user.username} have been detected as removed.`);
                deleteEvent(retweetEvent);
              }
            });
          });
      });
    });
};

const quoteVerification = () => {
  const to = new Date();
  const from = new Date(to.getTime() - 86400000);
  TweetEvent
    .findByDateRange(from, to)
    .then((results) => {
      const allQuoteEvents = results.filter((event) => event.eventType === 'quote');
      const allQuoteIds = [...new Set(allQuoteEvents.map((event) => event.tweetId))];

      Twitter
        .getManyTweetsInfo(allQuoteIds)
        .then((result) => {
          const foundIds = [...new Set(result.map((tweet) => tweet.id_str))];

          allQuoteIds.forEach((quoteId) => {
            if (!foundIds.includes(quoteId)) {
              const correspondingEvent = allQuoteEvents.find((event) => event.tweetId === quoteId);

              __(`Event ${correspondingEvent._id} from @${correspondingEvent.user.username} have been detected as removed.`);
              deleteEvent(correspondingEvent);
            }
          });

          foundIds.forEach((foundId) => {
            const correspondingEvent = allQuoteEvents.find((event) => event.tweetId === foundId);
            const correspondingTweet = result.find((tweet) => tweet.id_str === foundId);

            if (correspondingEvent.targetTweetId !== correspondingTweet.quoted_status_id_str) {
              __(`Event ${correspondingEvent._id} from @${correspondingEvent.user.username} have been detected as removed.`);
              deleteEvent(correspondingEvent);
            }
          });
        });
    });
};

const replyVerification = () => {
  const to = new Date();
  const from = new Date(to.getTime() - 86400000);
  TweetEvent
    .findByDateRange(from, to)
    .then((results) => {
      const allReplyEvents = results.filter((event) => event.eventType === 'reply');
      const allReplyIds = [...new Set(allReplyEvents.map((event) => event.tweetId))];

      Twitter
        .getManyTweetsInfo(allReplyIds)
        .then((result) => {
          const foundIds = [...new Set(result.map((tweet) => tweet.id_str))];

          allReplyIds.forEach((quoteId) => {
            if (!foundIds.includes(quoteId)) {
              const correspondingEvent = allReplyEvents.find((event) => event.tweetId === quoteId);

              __(`Event ${correspondingEvent._id} from @${correspondingEvent.user.username} have been detected as removed.`);
              deleteEvent(correspondingEvent);
            }
          });

          foundIds.forEach((foundId) => {
            const correspondingEvent = allReplyEvents.find((event) => event.tweetId === foundId);
            const correspondingTweet = result.find((tweet) => tweet.id_str === foundId);

            if (correspondingEvent.targetTweetId !== correspondingTweet.in_reply_to_status_id_str) {
              __(`Event ${correspondingEvent._id} from @${correspondingEvent.user.username} have been detected as removed.`);
              deleteEvent(correspondingEvent);
            }
          });
        });
    });
};

module.exports = {
  retweetVerification,
  quoteVerification,
  replyVerification,
};
