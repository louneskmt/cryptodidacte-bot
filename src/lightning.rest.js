var fs = require('fs');
var path = require("path");
var request = require('request');
var https = require('https')
var Agent = require('socks5-https-client/lib/Agent');
var macaroon = fs.readFileSync(path.resolve('./certs/admin.macaroon')).toString('hex');

const payInvoice = (invoice) => {
  var requestBody = {
    payment_request: invoice
  };

  var options = {
    url: 'https://wbpc4nobccaml6sw.onion:10080/v1/channels/transactions',
    strictSSL: false,
  	agentClass: Agent,
    agentOptions: {
  		socksHost: '127.0.0.1', // Defaults to 'localhost'.
  		socksPort: 9050, // Defaults to 1080.
  	},
    rejectUnauthorized: false,
    json: true,
    headers: {
      'Grpc-Metadata-macaroon': macaroon,
    },
    form: JSON.stringify(requestBody)
  };

  request.post(options, function(error, response, body) {
    console.log(error || body);
  });
}

const generateInvoice = (value, memo) => {
  var requestBody = {
    memo: memo,
    value: value,
    creation_date: Date.now()
  };

  var options = {
    url: 'https://wbpc4nobccaml6sw.onion:10080/v1/invoices',
    strictSSL: false,
  	agentClass: Agent,
    agentOptions: {
  		socksHost: '127.0.0.1', // Defaults to 'localhost'.
  		socksPort: 9050, // Defaults to 1080.
  	},
    rejectUnauthorized: false,
    json: true,
    headers: {
      'Grpc-Metadata-macaroon': macaroon,
    },
    form: JSON.stringify(requestBody)
  };

  request.post(options, function(error, response, body) {
    console.log(error || body);
  });
}

module.exports = {
  payInvoice,
  generateInvoice
}
