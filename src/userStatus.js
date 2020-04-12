const { __ } = require('./logger.js');
const Database = require('./database.js');

const database = new Database('cryptodidacte');

const getStatus = (userId, callback) => {
  database.find('status', { userId: userId.toString() }).then((docs) => {
    if (docs.length === 0) {
      callback(undefined);
      return;
    }

    __(`Found status for ${userId} : ${docs[0].status}`);

    if (typeof callback === 'function') {
      callback(docs[0].status);
    }
  });
};

const addStatus = async (userId, status) => {
  const newEntry = {
    userId: userId.toString(),
    status,
  };
  await database.insert('status', newEntry);
};

const setStatus = async (userId, newStatus) => {
  __(`Updating status of ${userId}`);

  getStatus(userId, async (status) => {
    if (status) {
      await database.updateDocument('status', { userId: userId.toString() }, { status: newStatus });
    } else {
      await addStatus(userId, newStatus);
    }
  });
};

const deleteStatus = async (userId, callback) => {
  getStatus(userId, async (status) => {
    if (status) {
      await database.remove('status', { userId: userId.toString() });

      if (typeof callback === 'function') {
        callback();
      }
    }
  });
};

module.exports = {
  getStatus,
  setStatus,
  deleteStatus,
};
