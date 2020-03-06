var grpc = require('grpc');
var fs = require("fs");

// Due to updated ECDSA generated tls.cert we need to let gprc know that
// we need to use that cipher suite otherwise there will be a handhsake
// error when we communicate with the lnd rpc server.
process.env.GRPC_SSL_CIPHER_SUITES = 'HIGH+ECDSA'

//  Lnd cert is at ~/.lnd/tls.cert on Linux and
//  ~/Library/Application Support/Lnd/tls.cert on Mac
var lndCert = fs.readFileSync('../certs/tls.cert');
var credentials = grpc.credentials.createSsl(lndCert);

var m = fs.readFileSync('../certs/admin.macaroon');
var macaroon = m.toString('hex');
var meta = new grpc.Metadata().add('macaroon', macaroon);

var lnrpcDescriptor = grpc.load("rpc.proto");
var lnrpc = lnrpcDescriptor.lnrpc;
var client = new lnrpc.Lightning('some.address:10009', grpc.credentials.createInsecure());

const pay_ln_invoice = (invoice) => {
  console.log("Invoice paid!")
  console.log(invoice)
  client.getInfo({}, meta);
}

module.exports = {
  pay_ln_invoice
}
