const fs = require('fs');
const path = require('path');

const QRCode = require('qrcode');
const { CronJob } = require('cron');
const { __ } = require('./logger.js');

const tempDirectory = path.join(__dirname, '../assets/temp');

const generateQRCode = (text, callback) => {
  const filePath = path.join(tempDirectory, `/qrcode-${text.substring(0, 30).toLowerCase().replace(/ /g, '_')}.png`);
  QRCode.toFile(filePath, text, {
    color: {
      dark: '#FC0030', // Blue dots
      light: '#ffffff', // Transparent background
    },
  }, (err) => {
    if (typeof callback === 'function') {
      if (err) {
        callback('None');
        console.log(err);
      } else callback(filePath);
    }
  });
  return filePath;
};

// eslint-disable-next-line no-unused-vars
const emptyTempDir = new CronJob('00 00 04 * * *', (() => {
  fs.readdir(tempDirectory, (errReading, files) => {
    if (errReading) {
      __(`Error deleting temp directory (${tempDirectory}) : ${errReading}`, 9);
      throw errReading;
    }

    for (const file of files) {
      fs.unlink(path.join(tempDirectory, file), (errDeleting) => {
        if (errDeleting) {
          __(`Error deleting file (${file}) : ${errDeleting}`, 9);
          throw errDeleting;
        }
      });
    }

    __('Temp direcotry successfully deleted');
  });
}), null, true);

module.exports = {
  generateQRCode,
};
