const {__} = require("./logger.js");

const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

const { databaseConfig } = require('../config')

class Database {
  constructor(name, url) {
      this.name = name;
      this.db = null;
      this.client = null;
      this.url = url || `mongodb://${databaseConfig.user}:${databaseConfig.password}@localhost:27017/cryptodidacte`

      this.connected = false;
  }

  async connect() {
      let self = this;
      let client = this.client = new MongoClient(this.url)

      return new Promise(function (resolve, reject) {
          client.connect(function (err) {
              if (err) {
                  __("Could not connect, got following : ", 9);
                  __(err, 9);
                  throw err;
              }
              __("Connected successfully to server", 1);
              self.db = client.db(self.name);
              self.connected = true;
              resolve(self);
          });
      });
  }

  disconnect() {
      this.client.close();
  }

  async connectIfNot() {
      if (!this.connected) await this.connect();
  }

  async insert(collection, newEntry) {
      var self = this;
      await this.connectIfNot();

      var coll = this.db.collection(collection);
      var fn = null;

      if (Array.isArray(newEntry)) {
          fn = coll.insertMany;
      } else {
          fn = coll.insertOne;
      }


      return new Promise((resolve, reject) => {
          fn.call(coll, newEntry, (err, res) => {
              if (err) {
                  __("Could not insert document, got : ", 9)
                  __(err, 9);
                  throw err
              }
              __(`Inserted ${res.insertedCount} document(s) into ${collection}`);
              resolve(res);
          });
      })
  }

  async remove(collection, query, many = false) {
      var self = this;
      await this.connectIfNot();

      var coll = this.db.collection(collection);
      var fn = null;

      fn = many ? coll.deleteMany : coll.deleteOne;

      return new Promise((resolve, reject) => {
          fn.call(coll, query, (err, res) => {
              if (err) {
                  __("Could not remove document, got : ", 9)
                  __(err, 9);
                  throw err
              }

              __(`Removed ${res.deletedCount} documents from ${collection}`)
              resolve(res);
          });
      })
  }

  async update(collection, filter, edit, mode = 'set', many = false) {
      var self = this;
      await this.connectIfNot();

      var coll = this.db.collection(collection);
      var fn = null;

      fn = many ? coll.updateMany : coll.updateOne;

      let update = {};
      switch (mode) {
        case 'set':
            update = { $set: edit };
            break;
        case 'inc':
            update = { $inc: edit };
            break;
        default:
            break;
      }

      return new Promise(function (resolve, reject) {
          fn.call(coll, filter, update, (err, res) => {
                  if (err) {
                      __("Could not remove document, got : ", 9)
                      __(err, 9);
                      throw err
                  }

                  __(`Updated ${res.modifiedCount} documents from ${collection}`)
                  resolve(res);
              })
          /*
           */
      })
  }

  async find(collection, query) {
    var self = this;
    await this.connectIfNot();

    var coll = this.db.collection(collection);

    return new Promise(function (resolve, reject) {
      coll.find(query).toArray(function (err, docs) {
        if (err) {
          __("Couldn't get documents, got following error : ", 9);
          __(err, 9);
        }
        __("database.js@findDocuments : Found the following documents : \n" + JSON.stringify(docs));
        resolve(docs);
      })

    })
  }


}

module.exports = Database
