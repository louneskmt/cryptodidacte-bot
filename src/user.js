const database = require('./database.js');

const getStatus = (user_id, callback) => {
  database.findDocuments("status", { user_id: user_id.toString() }, (docs) => {
    if(docs.length === 0) {
      return undefined;
    }
    console.log("Found one status", docs[0].status)
    if(typeof callback === "function") {
      callback(docs[0].status);
    }
  })
}

const addStatus = (user_id, status) => {
  var newEntry = {
    user_id: user_id.toString(),
    status: status
  }
  database.insertOneDocument("status", newEntry, () => {});
}

const setStatus = (user_id, newStatus) => {
  console.log("setStatus");
  getStatus(user_id, (status) => {
    if(status) {
      console.log("Updating status");
      updateDocument("status", { user_id: user_id.toString() }, { status: newStatus }, () => {});
    } else {
      console.log("Adding status");
      addStatus(user_id, newStatus);
    }
  });
}

const deleteStatus = (user_id) => {
  getStatus(user_id, (status) => {
    if(status) {
      database.removeDocuments("status", { user_id: user_id.toString() }, () => {});
    }
  })
}

module.exports = {
  getStatus,
  setStatus,
  deleteStatus
}
