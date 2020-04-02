//config.js
/** TWITTER APP CONFIGURATION
 * consumer_key
 * consumer_secret
 * access_token
 * access_token_secret
 */

const env = require('dotenv').config();

if (env.error) {
  throw env.error
}

const twitterConfig = {
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET,
  webhook_id: '1238264407626592257',
  user_id_bot: '1235621426125774850',
  admin: ["986994912565620736", "955781788743454721", "1175249514745212928"] // @lounes_kmt, @Cryptodidacte
};        

const databaseConfig = {
  user: "bot",
  password: process.env.DB_PASSWORD
}

module.exports = {
  twitterConfig,
  databaseConfig
}
