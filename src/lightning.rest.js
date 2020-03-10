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
    creation_date: Date.now(),
    route_hints: [
      {
        hop_hints : [
          {
            node_id: '03864ef025fde8fb587d989186ce6a4a186895ee44a926bfc370e2c366597a3f8f',
            chan_id: '682828606770184193'
          }
        ]
      }
    ]
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
    return body.payment_request;
  });
}

module.exports = {
  payInvoice,
  generateInvoice
}
