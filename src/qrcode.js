var QRCode = require('qrcode');
var path = require('path')

const generateQRCode = (text, callback) => {
  var filePath = path.join(__dirname, '../assets/temp/qrcode-' + text.substring(0,30).toLowerCase().replace(/ /g, '_') + '.jpeg');
  QRCode.toFile(filePath, text, {
    color: {
      dark: '#FC0030',  // Blue dots
      light: '#ffffff' // Transparent background
    }
  }, function (err) {
      if(typeof callback === "function") {
        if(err) {
          callback("None");
          console.log(err)
        }
        else callback(filePath);
      }
  });
  return filePath;
}

module.exports = {
  generateQRCode
}
