//config.js
/** TWITTER APP CONFIGURATION
 * consumer_key
 * consumer_secret
 * access_token
 * access_token_secret
 */

const env = require('dotenv').config()

if (env.error) {
  throw env.error
}

console.log(env.parsed)

const twitterApp = {
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET,
  webhook_id: '1235734253855485955'
};

module.exports = twitterApp;
