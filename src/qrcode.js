var QRCode = require('qrcode');
var path = require('path')

const generateQRCode = (text) => {
  var filePath = './assets/temp/qrcode-' + text.substring(0,15).toLowerCase().replace(/ /g, '_') + '.png';
  QRCode.toFile(filePath, text, {
    color: {
      dark: '#FC0030',  // Blue dots
      light: '#ffffff' // Transparent background
    }
  }, function (err) {
      if (err) {
        return None;
      }
      return filePath;
  });

}

module.exports = {
  generateQRCode
}
