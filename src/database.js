const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

const { databaseConfig } = require('../config')

const url = `mongodb://${databaseConfig.user}:${databaseConfig.password}@localhost:27017/cryptodidacte`;
const client = new MongoClient(url);

const connect = (callback) => {
  client.connect(function(err) {
    assert.equal(null, err);
    console.log("Connected successfully to server");
    var db = client.db("cryptodidacte");
    console.log("Go callback DB")
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
      client.close();
    });
  })
}

const insertOneDocument = (collection, newEntry, callback) => {
  connect((db) => {
    // Get the collection
    // Insert some documents
    db.collection(collection).insertOne(newEntry, function(err, result) {
      assert.equal(err, null);
      console.log("Inserted 1 document into the collection");
      callback(result);
      client.close();
    });
  });
}

const findDocuments = (collection, query, callback) => {
  connect((db) => {
    // Get the documents collection and find some documents
    const col = db.collection(collection);
    col.find(query).toArray(function(err, docs) {
      if (err) throw err;
      console.log("Found the following records");
      console.log(docs);
      callback(docs);
      client.close();
    });
  })
}

const removeDocument = (collection, query, callback) => {
  connect((db) => {
    // Get the documents collection
    // Delete document
    db.collection(collection).deleteOne(query, function(err, result) {
      assert.equal(err, null);
      assert.equal(1, result.result.n);
      console.log("Document removed");
      callback(result);
      client.close();
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
      callback(result);
      client.close();
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
