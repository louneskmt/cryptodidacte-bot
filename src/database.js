const {__} = require("./logger.js");

const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

const { databaseConfig } = require('../config')

class Database {
  constructor(name) {
      this.name = name;
      this.db = null;
      this.client = null;
      this.url = `mongodb://${databaseConfig.user}:${databaseConfig.password}@localhost:27017/cryptodidacte`

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
                  return reject(err)
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
      var fn = null
      var text = null;

      if (Array.isArray(newEntry)) {
          fn = coll.insertMany;
          text = `Inserted many (${newEntry.length}) documents into collection '${collection}'`
      } else {
          fn = coll.insertOne;
          text = `Inserted one document into collection '${collection}'`
      }


      return new Promise((resolve, reject) => {
          fn.call(coll, newEntry, (err, res) => {
              if (err) {
                  __("Could not insert document, got : ", 9)
                  __(err, 9);
                  return reject(err)
              }
              __(`Inserted ${res.insertedCount} documents into ${collection}`);
              resolve(res);
          });
      })
  }

  async remove(collection, query, many = false) {
      var self = this;
      await this.connectIfNot();

      var coll = this.db.collection(collection);
      var fn = null
      var text = null;

      fn = many ? coll.deleteMany : coll.deleteOne;

      return new Promise((resolve, reject) => {
          fn.call(coll, query, (err, res) => {
              if (err) {
                  __("Could not remove document, got : ", 9)
                  __(err, 9);
                  return reject(err)
              }

              __(`Removed ${res.deletedCount} documents from ${collection}`)
              resolve(res);
          });
      })
  }

  async update(collection, filter, edit, many = false) {
      var self = this;
      await this.connectIfNot();

      var coll = this.db.collection(collection);
      var fn = null
      var text = null;

      fn = many ? coll.updateMany : coll.updateOne;

      return new Promise(function (resolve, reject) {
          fn.call(coll, filter, {
                  $set: edit
              }, (err, res) => {
                  if (err) {
                      __("Could not remove document, got : ", 9)
                      __(err, 9);
                      return reject(err)
                  }

                  __(`Updated ${res.modifiedCount} documents from ${collection}`)
                  resolve(res);
              })
          /*
           */
      })
  }


}

module.exports = Database
