const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

const { databaseConfig } = require('../config')

const url = `mongodb://${databaseConfig.user}:${databaseConfig.password}@localhost:27017/cryptodidacte`;
const client = new MongoClient(url);

const connect = (callback) => {
  client.connect(function(err) {
    assert.equal(null, err);
    console.log("Connected successfully to server");
    const db = client.db("cryptodidacte");
    callback(db);
  });
}

const disconnect = () => {
  client.close();
}

const insertDocuments = (collection, newEntries, callback) => {
  connect((db) => {
    // Get collection
    // Insert some documents
    db.collection(collection).insertMany(newEntries, function(err, result) {
      assert.equal(err, null);
      console.log("Inserted" + result.result.n + "documents into the collection");
      callback(result);
      disconnect();
    });
  })
}

const insertOneDocument = (collection, newEntry, callback) => {
  connect((db) => {
    // Get the collection
    // Insert some documents
    db.getCollection(collection).insertOne(newEntry, function(err, result) {
      assert.equal(err, null);
      console.log("Inserted 1 document into the collection");
      callback(result);
      disconnect();
    });
  });
}

const findDocuments = (collection, query, callback) => {
  connect((db) => {
    // Get the documents collection and find some documents
    db.collection(collection).find(query).toArray(function(err, docs) {
      // assert.equal(err, null);
      console.log("Found the following records");
      console.log(docs);
      callback(docs);
      disconnect();
    });
  })
}

const removeDocument = (collection, query, callback) => {
  connect((db) => {
    // Get the documents collection
    // Delete document
    db.getCollection(collection).deleteOne({ a : 3 }, function(err, result) {
      assert.equal(err, null);
      assert.equal(1, result.result.n);
      console.log("Document removed");
      callback(result);
      disconnect();
    });
  });
}

const updateDocument = (collection, query, modification, callback) => {
  connect((db) => {
    // Get the documents collection
    // Update document where a is 2, set b equal to 1
    db.getCollection(collection).updateOne(query
      , { $set: modification }, function(err, result) {
      assert.equal(err, null);
      assert.equal(1, result.result.n);
      console.log("Document updated");
      callback(result);
      disconnect();
    });
  });
}

module.exports = {
  insertDocuments,
  insertOneDocument,
  findDocuments,
  removeDocument,
  updateDocument
}
