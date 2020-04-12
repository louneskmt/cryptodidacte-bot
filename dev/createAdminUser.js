const readline = require('readline');
const crypto = require('crypto');
const Db = require('../src/database.js');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const prompt = async (text) => new Promise((resolve, reject) => {
  rl.question(text, resolve);
});

const hashPassword = ({ username, password }) => {
  const hashedPassword = crypto.createHash('sha256').update(`1d34caabaa37${password}ead78d1d5753583562b6`).digest('hex');

  const salt = `${process.env.SALT}*#*${username}--${hashedPassword}*#*${process.env.SALT}`;
  console.log(salt);
  const shasum = crypto.createHash('sha256').update(salt).digest('hex');
  return shasum;
};

(async function main() {
  console.log('************************* CONNECT TO DATABASE *************************');
  const username = await prompt('Enter your username: ');
  const password = await prompt('Enter your password: ');

  console.log('\n TRYING TO CONNECT \n');

  const db = new Db('adminWebsite', `mongodb://${username}:${password}@localhost:27017/adminWebsite`);
  await db.connect();
  if (!db.connected) {
    console.error("Couldn't log in");
    return process.exit(1);
    // END
  }
  console.log('You are connected to the authAdminTable');
  console.log('\n\n************************* CREATING USER *************************\n\n');
  const nUsername = await prompt('Enter username of new user:');
  let nPassword = await prompt('Enter password of new user:');

  console.log('\n\n************************* INSERTING USER *************************\n\n');
  nPassword = hashPassword({ username: nUsername, password: nPassword });
  console.log(nPassword);
  await db.insert('users', { username: nUsername, password: nPassword });
  console.log('**END**');
  return process.exit(0);
}());
