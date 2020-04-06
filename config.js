// config.js

const env = require('dotenv').config();
const crypto = require("crypto");

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
  admin: ["986994912565620736", "955781788743454721", "1175249514745212928"] // @lounes_kmt, @Cryptodidacte @cillianklota
};        

const databaseConfig = {
  user: "bot",
  password: process.env.DB_PASSWORD
}

const websiteDbConfig = {
  user: "bot",
  password: process.env.DB_PASSWORD,
  hash: ({username, password}) => crypto.createHash("sha256").update(process.env.SALT+"*#*"+username+"--"+password+"*#*"+process.env.SALT).digest("hex")
}

const ethereumConfig = {
  mnemonic: process.env.MNEMONIC,
  projectId: process.env.INFURA_PROJECT_ID,
  contractAddress: '0xFF193B51c9A02761c81297d9a3Db409e6Dd8B317'
}

module.exports = {
  twitterConfig,
  databaseConfig,
  ethereumConfig,
  websiteDbConfig
}
