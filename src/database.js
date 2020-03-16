const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

const { databaseConfig } = require('../config')

const url = `mongodb://${databaseConfig.user}:${databaseConfig.password}@localhost:27017/cryptodidacte`;

const connect = (callback) => {
  MongoClient.connect(url, function(err, client) {
    assert.equal(null, err);
    console.log("Connected successfully to server");
    var db = client.db("cryptodidacte");
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
      console.log("Inserted" + result.result.n + "documents into the collection");
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
      console.log("Inserted 1 document into the collection");
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
      console.log("Found the following records");
      console.log(docs);
      disconnect(client);
      callback(docs);
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
      console.log("Document removed");
      disconnect(client);
      callback(result);
    });
  });
}

const removeDocuments = (collection, query, callback) => {
  connect((client, db) => {
    // Get the documents collection
    // Delete document
    db.collection(collection).deleteMany(query, function(err, result) {
      assert.equal(err, null);
      console.log(result.deletedCount.toString() + " documents removed");
      disconnect(client);
      callback(result);
    });
  });
}

const updateDocument = (collection, query, modification, callback) => {
  connect((db) => {
    // Get the documents collection
    // Update document where a is 2, set b equal to 1
    db.collection(collection).updateOne(query
      , { $set: modification }, function(err, result) {
      assert.equal(err, null);
      assert.equal(1, result.result.n);
      console.log("Document updated");
      disconnect(client);
      callback(result);
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
