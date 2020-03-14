const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

const { databaseConfig } = require('../config')

const url = `mongodb://${databaseConfig.user}:${databaseConfig.password}@localhost:27017/cryptodidacte`;
const client = new MongoClient(url);

client.connect(function(err) {
  assert.equal(null, err);
  console.log("Connected successfully to server");
  const db = client.db("cryptodidacte");
  client.close();
});
