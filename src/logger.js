const beautify = require('json-beautify');
const colors = require('colors');
const fs = require('fs');

const main = fs.createWriteStream('./logs/main.log', { flags: 'a' });

function __(message, lvl = 0) {
  let newMessage = message;

  if (newMessage && newMessage.toString() === '[object Object]') {
    try {
      newMessage = beautify(newMessage, null, 2, 100);
    } catch (err) {
      console.dir(newMessage);
      __("CIRCULAR OBJECTS CAN'T BE LOGGED", 2);
    }
  }

  const date = new Date();
  const formatedDate = `${date.getDate()}/${date.getMonth() + 1} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;

  const levels = {
    0: 'VERBOSE',
    1: 'DEBUG',
    2: 'IMPORTANT',
    9: 'ERROR',
  };

  const colorList = {
    0: 'grey',
    1: 'bgWhite',
    2: 'blue',
    9: 'red',
  };

  const level = levels[lvl];
  const color = colorList[lvl];

  const textRaw = `\n[${formatedDate}] | [${level}] |: ${newMessage}`;
  const textColor = colors[color](textRaw);

  console.log(textColor);
  main.write(textRaw);
}

const date = new Date();
main.write(`\n\n\n------------------------ ${date.getDate()}/${date.getMonth() + 1} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()} ------------------------`);

__('Logger has started');

module.exports = {
  __,
};
