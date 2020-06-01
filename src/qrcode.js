const path = require('path');
const QRCode = require('qrcode');

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

module.exports = {
  generateQRCode,
};
