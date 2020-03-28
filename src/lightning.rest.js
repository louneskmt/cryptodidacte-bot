var fs = require('fs');
var path = require("path");
var request = require('request');
var https = require('https')
var Agent = require('socks5-https-client/lib/Agent');
var macaroon = fs.readFileSync(path.resolve('./certs/admin.macaroon')).toString('hex');

const payInvoice = (invoice, successCallback, errorCallback) => {
  var requestBody = {
    payment_request: invoice
  };

  var options = {
    url: 'https://kfmprmnblmf262qcj7vf7lh7lqzrybruj5vvzx7rkpt3kafejwtvydad.onion:10080/v1/channels/transactions',
    strictSSL: false,
  	agentClass: Agent,
    agentOptions: {
  		socksHost: 'localhost', // Defaults to 'localhost'.
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
    if(body && typeof successCallback === "function") {
      successCallback();
    } else if (error && typeof errorCallback === "function") {
      errorCallback(error);
    }
  });
}

const generateInvoice = (value, memo, successCallback, errorCallback) => {
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
    url: 'https://kfmprmnblmf262qcj7vf7lh7lqzrybruj5vvzx7rkpt3kafejwtvydad.onion:10080/v1/invoices',
    strictSSL: false,
  	agentClass: Agent,
    agentOptions: {
  		socksHost: 'localhost', // Defaults to 'localhost'.
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
    if(body && typeof successCallback === "function") {
      successCallback(body.payment_request);
    } else if (error && typeof errorCallback === "function") {
      errorCallback(error);
    }
  });
}

const getInvoiceData = (payment_request, successCallback, errorCallback) => {
  var options = {
    url: `https://kfmprmnblmf262qcj7vf7lh7lqzrybruj5vvzx7rkpt3kafejwtvydad.onion:10080/v1/payreq/${payment_request}`,
    strictSSL: false,
  	agentClass: Agent,
    agentOptions: {
  		socksHost: 'localhost', // Defaults to 'localhost'.
  		socksPort: 9050, // Defaults to 1080.
  	},
    rejectUnauthorized: false,
    json: true,
    headers: {
      'Grpc-Metadata-macaroon': macaroon,
    }
  };

  request.get(options, function(error, response, body) {
    console.log(error || body);
    if(body && typeof successCallback === "function") {
      successCallback(body);
    } else if (error && typeof errorCallback === "function") {
      errorCallback(error);
    }
  });
}

module.exports = {
  payInvoice,
  generateInvoice,
  getInvoiceData
}
