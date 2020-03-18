const getStatus = (user_id, callback) => {
  database.find("status", { user_id: user_id.toString() }).then((docs) => {
    if(docs.length === 0) {
      callback(undefined);
      return;
    }
    
    __(`Found status for ${user_id} : `+docs[0].status);

    if(typeof callback === "function") {
      callback(docs[0].status);
    }
  })
}

const addStatus = async (user_id, status) => {
  var newEntry = {
    user_id: user_id.toString(),
    status: status
  }
  await database.insert("status", newEntry);
}

const setStatus = async (user_id, newStatus) => {
  __(`Updating status of ${user_id}`);

  getStatus(user_id, (status) => {
    if(status) {
      await database.updateDocument("status", { user_id: user_id.toString() }, { status: newStatus })
    } else {
      addStatus(user_id, newStatus)
    }
  })
}

const deleteStatus = async (user_id, callback) => {
  getStatus(user_id, (status) => {
    if(status) {
      await database.remove("status", { user_id: user_id.toString() });
    }
  })
}

module.exports = {
  getStatus,
  setStatus,
  deleteStatus
}
