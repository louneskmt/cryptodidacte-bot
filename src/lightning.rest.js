const fs = require('fs');
const path = require('path');
const request = require('request');
const Agent = require('socks5-https-client/lib/Agent');

const macaroon = fs.readFileSync(path.resolve('./certs/admin.macaroon')).toString('hex');

const payInvoice = (invoice, successCallback, errorCallback) => {
  const requestBody = {
    payment_request: invoice,
  };

  const options = {
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
    form: JSON.stringify(requestBody),
  };

  request.post(options, (error, response, body) => {
    console.log(error || body);
    if (body && typeof successCallback === 'function') {
      if (body.payment_error !== '') errorCallback(body.payment_error);
      successCallback(body.payment_request);
    } else if (error && typeof errorCallback === 'function') {
      errorCallback(error);
    }
  });
};

const generateInvoice = (value, memo, successCallback, errorCallback) => {
  const requestBody = {
    memo,
    value,
    creation_date: Date.now(),
    route_hints: [
      {
        hop_hints: [
          {
            node_id: '03864ef025fde8fb587d989186ce6a4a186895ee44a926bfc370e2c366597a3f8f',
            chan_id: '682828606770184193',
          },
        ],
      },
    ],
  };

  const options = {
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
    form: JSON.stringify(requestBody),
  };

  request.post(options, (error, response, body) => {
    console.log(error || body);
    if (body && typeof successCallback === 'function') {
      successCallback(body.payment_request);
    } else if (error && typeof errorCallback === 'function') {
      errorCallback(error);
    }
  });
};

const getInvoiceData = (paymentRequest, successCallback, errorCallback) => {
  const options = {
    url: `https://kfmprmnblmf262qcj7vf7lh7lqzrybruj5vvzx7rkpt3kafejwtvydad.onion:10080/v1/payreq/${paymentRequest}`,
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
  };

  return new Promise((resolve, reject) => {
    request.get(options, (error, response, body) => {
      console.log(body);
      if (Object.prototype.hasOwnProperty.call(body, 'error')) {
        if (typeof errorCallback === 'function') errorCallback(body);
        return reject(body);
      }
      resolve(body);
      if (typeof successCallback === 'function') successCallback(body);
    });
  });
};

module.exports = {
  payInvoice,
  generateInvoice,
  getInvoiceData,
};
