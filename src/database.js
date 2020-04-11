const mongodb = require('mongodb');
const { __ } = require('./logger.js');

const { MongoClient } = mongodb;

const { databaseConfig } = require('../config.js');

class Database {
  constructor(name, url, debug = false) {
    this.name = name;
    this.db = null;
    this.client = null;
    this.url = url || `mongodb://${databaseConfig.user}:${databaseConfig.password}@localhost:27017/cryptodidacte`;

    this.connected = false;
    this.debug = debug;
  }

  async connect() {
    this.client = new MongoClient(this.url);
    const self = this;

    return new Promise(((resolve, reject) => {
      self.client.connect((err) => {
        if (err) {
          __('Could not connect, got following : ', 9);
          __(err, 9);
          throw err;
        }
        if (self.debug) __('Connected successfully to server', 1);
        self.db = self.client.db(self.name);
        self.connected = true;
        resolve(self);
      });
    }));
  }

  disconnect() {
    this.client.close();
  }

  async connectIfNot() {
    if (!this.connected) await this.connect();
  }

  async insert(collection, newEntry) {
    const self = this;
    await this.connectIfNot();

    const coll = this.db.collection(collection);
    let fn = null;

    if (Array.isArray(newEntry)) fn = coll.insertMany;
    else fn = coll.insertOne;

    return new Promise((resolve, reject) => {
      fn.call(coll, newEntry, (err, res) => {
        if (err) {
          __('Could not insert document, got : ', 9);
          __(err, 9);
          throw err;
        }
        if (self.debug) __(`Inserted ${res.insertedCount} document(s) into ${collection}`);
        resolve(res);
      });
    });
  }

  async remove(collection, query, many = false, { idList = null }) {
    const self = this;
    await this.connectIfNot();

    const coll = this.db.collection(collection);
    let fn = null;

    if (idList && !query) {
      const idObject = [];
      for (const id of idList) {
        idObject.push(new mongodb.ObjectID(id));
      }
      // eslint-disable-next-line no-param-reassign
      query = { _id: { $in: idObject } };
    }

    fn = many ? coll.deleteMany : coll.deleteOne;

    return new Promise((resolve, reject) => {
      fn.call(coll, query, (err, res) => {
        if (err) {
          __('Could not remove document, got : ', 9);
          __(err, 9);
          throw err;
        }

        if (self.debug) __(`Removed ${res.deletedCount} documents from ${collection}`);
        resolve(res);
      });
    });
  }

  async update(collection, {
    filter, edit, mode = 'set', many = false,
  }) {
    const self = this;
    await this.connectIfNot();

    const coll = this.db.collection(collection);
    let fn = null;

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

    return new Promise(((resolve, reject) => {
      fn.call(coll, filter, update, (err, res) => {
        if (err) {
          __('Could not remove document, got : ', 9);
          __(err, 9);
          throw err;
        }

        if (self.debug) __(`Updated ${res.modifiedCount} documents from ${collection}`);
        resolve(res);
      });
    }));
  }

  async find(collection, query) {
    const self = this;
    await this.connectIfNot();

    const coll = this.db.collection(collection);

    return new Promise(((resolve, reject) => {
      coll.find(query).toArray((err, docs) => {
        if (err) {
          __("Couldn't get documents, got following error : ", 9);
          __(err, 9);
        }
        if (self.debug) __(`database.js@findDocuments : Found the following documents : \n${JSON.stringify(docs)}`);
        resolve(docs);
      });
    }));
  }
}

module.exports = Database;
