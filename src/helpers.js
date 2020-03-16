const database = require('./database.js');

const getStatus = (user_id) => {
  database.findDocuments("status", { user_id: user_id.toString() }, (result) => {
    if(result === 0) {
      return undefined;
    }
    return result[0].status;
  })
}

const addStatus = (user_id, status) => {
  var newEntry = {
    user_id: user_id.toString(),
    status: status
  }
  database.insertDocuments("status", newEntry, () => {});
}

const updateStatus = (user_id, status) => {
  if(getStatus(user_id)) {
    updateDocument("status", { user_id: user_id.toString() }, { status: status }, () => {});
  } else {
    addStatus(user_id, status);
  }
}

module.exports = {
  getStatus,
  updateStatus,
  setStatus
}
