const { __ } = require('../logger.js');
const Twitter = require('../Twitter.js');
const { UserStatus } = require('../database/mongoose.js');
const lightning = require('../lightning.rest.js');
const QRCode = require('../qrcode.js');
const { end } = require('./global.js');

const messageTemplates = require('../../data/message_templates.json');

function generateInvoice(params) {
  const { userId } = params;

  __('events.js@generateInvoice : Generating an invoice (tip) ');

  Twitter.sendMessage(userId, messageTemplates.tip.wip);
  UserStatus.set(userId, 'generating_invoice');

  lightning.generateInvoice(200, '@Cryptodidacte Tip', (invoice) => {
    Twitter.sendMessage(userId, messageTemplates.global.done);

    QRCode.generateQRCode(invoice, (QRCodePath) => {
      __(`QRCodePath :${QRCodePath}`);
      if (QRCodePath !== 'None') {
        Twitter.sendMessageWithImage(userId, invoice, QRCodePath);
      } else {
        Twitter.sendTextMessage(userId, invoice);
      }
      end(params, { description: messageTemplates.tip.thanks, endMessage: false });
    });
  }, (err) => {
    __('events.js@generateInvoice : Could not generate invoice, got following', 9);
    __(err, 9);

    end(params, { description: messageTemplates.tip.error });
  });
}

module.exports = generateInvoice;
