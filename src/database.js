const {__} = require("./logger.js");

const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

const { databaseConfig } = require('../config')

const url = `mongodb://${databaseConfig.user}:${databaseConfig.password}@localhost:27017/cryptodidacte`;

const connect = (callback) => {
  MongoClient.connect(url, function(err, client) {
    assert.equal(null, err);
    __("Connected successfully to server",1);
    let db = client.db("cryptodidacte");
    callback(client, db);
  });
}

const disconnect = (client) => {
  client.close();
}

const insertDocuments = (collection, newEntries, callback) => {
  connect((client, db) => {
    // Get collection
    // Insert some documents
    db.collection(collection).insertMany(newEntries, function(err, result) {
      assert.equal(err, null);
      __("database.js@insertDocuments : Inserted many (" + result.result.n + ") documents into the collection");
      callback(result);
      disconnect(client);
    });
  })
}

const insertOneDocument = (collection, newEntry, callback) => {
  connect((client, db) => {
    // Get the documents collection and find some documents
    db.collection(collection).insertOne(newEntry, function(err, result) {
      assert.equal(err, null);
      __("database.js@insertOneDocument : 1 document inserted into "+collection);
      disconnect(client);
      callback(result);
    });
  });
}

const findDocuments = (collection, query, callback) => {
  connect((client, db) => {
    // Get the documents collection and find some documents
    db.collection(collection).find(query).toArray(function(err, docs) {
      if (err) throw err;
      __("database.js@findDocuments : Found the following records : \n"+ JSON.stringify(docs));
      disconnect(client);
      if(typeof callback === "function") callback(docs);
    });
  });
}

const removeOneDocument = (collection, query, callback) => {
  connect((client, db) => {
    // Get the documents collection
    // Delete document
    db.collection(collection).deleteOne(query, function(err, result) {
      assert.equal(err, null);
      assert.equal(1, result.result.n);
      __("1 document removed");
      disconnect(client);
      if(typeof callback === "function") callback(result);
    });
  });
}

const removeDocuments = (collection, query, callback) => {
  connect((client, db) => {
    // Get the documents collection
    // Delete document
    db.collection(collection).deleteMany(query, function(err, result) {
      assert.equal(err, null); 
      __("database.js@removeDocuments : " + result.deletedCount.toString() + " documents removed from collection "+collection);
      disconnect(client);
      if(typeof callback === "function") callback(result);
    });
  });
}

const updateDocument = (collection, query, modification, callback) => {
  connect((db) => {
    // Get the documents collection
    // Update document where a is 2, set b equal to 1
    __(db, 2)
    db.collection(collection).updateOne(query
      , { $set: modification }, function(err, result) {
      assert.equal(err, null);
      assert.equal(1, result.result.n);
      __("database.js@updateDocument : 1 document updated in collection "+collection);
      disconnect(client);
      if(typeof callback === "function") callback(result);
    });
  });
}

module.exports = {
  connect,
  disconnect,
  insertDocuments,
  insertOneDocument,
  findDocuments,
  removeDocuments,
  removeOneDocument,
  updateDocument
}
