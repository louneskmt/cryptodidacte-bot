const lnService = require('ln-service');

const {lnd} = lnService.authenticatedLndGrpc({
  cert: 'LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSUNCekNDQWEyZ0F3SUJBZ0lRWmpRc0xlNjJpQndvVlFVbndudkFuREFLQmdncWhrak9QUVFEQWpBeU1SOHcKSFFZRFZRUUtFeFpzYm1RZ1lYVjBiMmRsYm1WeVlYUmxaQ0JqWlhKME1ROHdEUVlEVlFRREV3WnRlVTV2WkdVdwpIaGNOTWpBd01URXpNREkxTnpBeFdoY05NakV3TXpBNU1ESTFOekF4V2pBeU1SOHdIUVlEVlFRS0V4WnNibVFnCllYVjBiMmRsYm1WeVlYUmxaQ0JqWlhKME1ROHdEUVlEVlFRREV3WnRlVTV2WkdVd1dUQVRCZ2NxaGtqT1BRSUIKQmdncWhrak9QUU1CQndOQ0FBUlQ5Rk95Y1BBZVJZWDVuakZ0WWhobGRoamdHL0xMb3VIVlRlWEtnU0drcnFYOQphRXBNQ2JMTGFPMlk3VEQ2cUsyc2xaRGc3OWNCSHlyb0srNjJQMndIbzRHa01JR2hNQTRHQTFVZER3RUIvd1FFCkF3SUNwREFQQmdOVkhSTUJBZjhFQlRBREFRSC9NSDRHQTFVZEVRUjNNSFdDQm0xNVRtOWtaWUlKYkc5allXeG8KYjNOMGdneHRlVzV2WkdVdWJHOWpZV3lDQkhWdWFYaUNDblZ1YVhod1lXTnJaWFNIQkg4QUFBR0hFQUFBQUFBQQpBQUFBQUFBQUFBQUFBQUdIQk1Db0FVU0hCS3dSQUFHSEJLd1NBQUdIRVA2QUFBQUFBQUFBZE5uTXZwUEJDd2lICkJBQUFBQUF3Q2dZSUtvWkl6ajBFQXdJRFNBQXdSUUlnRU5lQW9mZ1FWODVTMHV5Z1I4aEZmdUFtV2lnSUFLRWoKT3FoYktvSzVaMDhDSVFEWVdPbEJuTGxzZDhjNS9ZZmYzdjZ1NjZjYThjTU5yd25yTnM1aHVNUkZtUT09Ci0tLS0tRU5EIENFUlRJRklDQVRFLS0tLS0K',
  macaroon: 'AgEDbG5kAs8BAwoQY+8bwRPfrLMdaX9u8GiRaBIBMBoWCgdhZGRyZXNzEgRyZWFkEgV3cml0ZRoTCgRpbmZvEgRyZWFkEgV3cml0ZRoXCghpbnZvaWNlcxIEcmVhZBIFd3JpdGUaFgoHbWVzc2FnZRIEcmVhZBIFd3JpdGUaFwoIb2ZmY2hhaW4SBHJlYWQSBXdyaXRlGhYKB29uY2hhaW4SBHJlYWQSBXdyaXRlGhQKBXBlZXJzEgRyZWFkEgV3cml0ZRoSCgZzaWduZXISCGdlbmVyYXRlAAAGIAbppUGSefi2E7vFvFYutIRwMAd72PAdKLdl39tO84zI',
  socket: '84.100.44.54:10009',
});

// Promise syntax
const nodePublicKey = (await lnService.getWalletInfo({lnd})).public_key;

const pay_ln_invoice = (invoice) => {
  console.log("Invoice paid!")
  console.log(invoice)

  lnService.getWalletInfo({lnd}, (err, result) => {
    const nodeKey = result.public_key;
    console.log(nodeKey)
  });
}

module.exports = {
  pay_ln_invoice
}
