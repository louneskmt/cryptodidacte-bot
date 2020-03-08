var fs = require('fs');
var grpc = require('grpc');
var lnrpc = grpc.load('rpc.proto').lnrpc;

process.env.GRPC_SSL_CIPHER_SUITES = 'HIGH+ECDSA'

var lndCert = fs.readFileSync('../certs/tls.cert');
var sslCreds = grpc.credentials.createSsl(lndCert);
var macaroonCreds = grpc.credentials.createFromMetadataGenerator(function(args, callback) {
  var macaroon = fs.readFileSync("../certs/admin.macaroon").toString('hex');
  var metadata = new grpc.Metadata()
  metadata.add('macaroon', macaroon);
  callback(null, metadata);
});

var creds = grpc.credentials.combineChannelCredentials(sslCreds, macaroonCreds);
var lightning = new lnrpc.Lightning('84.100.44.54:10009', creds);

const payInvoice = (invoice) => {
  var request = {
    payment_request: invoice
  };

  var call = lightning.sendPayment({});

  call.on('data', function(response) {
    // A response was received from the server.
    console.log(response);
  });
  call.on('status', function(status) {
    console.log("Status :\n", status);
  });
  call.on('end', function() {
    console.log("END");
  });

  call.write(request);
}

const generateInvoice = (value, memo) => {
  var request = {
    memo: memo,
    value: value,
    creation_date: Date.now()
  };

  lightning.addInvoice(request, function(err, response) {
    console.log("Invoice : ", response.payment_request);
    return response.payment_request;
  })
}

module.exports = {
  payInvoice,
  generateInvoice
}
