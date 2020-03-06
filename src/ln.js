var fs = require('fs');
const path = require('path');
var grpc = require('grpc');

process.env.GRPC_SSL_CIPHER_SUITES = 'HIGH+ECDSA';

var lndCert = fs.readFileSync('/home/lounes_kmt/cryptodidacte-bot/certs/tls.cert');
var credentials = grpc.credentials.createSsl(lndCert);

var m = fs.readFileSync('/home/lounes_kmt/cryptodidacte-bot/certs/admin.macaroon');
var macaroon = m.toString('hex');
var meta = new grpc.Metadata().add('macaroon', macaroon);

var lnrpcDescriptor = grpc.load('/home/lounes_kmt/cryptodidacte-bot/src/rpc.proto');
var lnrpc = lnrpcDescriptor.lnrpc;
var client = new lnrpc.Lightning('84.100.44.54:10009', grpc.credentials.createInsecure());

const pay_ln_invoice = (invoice) => {
  console.log("Invoice paid!")
  console.log(invoice)
  client.getInfo({}, meta);
}

module.exports = {
  pay_ln_invoice
}
