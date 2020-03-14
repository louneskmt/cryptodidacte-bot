var events = require('events');
var eventEmitter = new events.EventEmitter();

// Twitter modules
var Twitter = require('./Twit');
const twitterConfig = require('../config.js');

// Lightning REST
var lightning = require('./lightning.rest.js');

// QRCode generator module
var QRCode = require('./qrcode.js');

eventEmitter.on('tweet', (tweet) => {
  Twitter.sendTextMessage(tweet.user_id, "We got your tweet!");
});

eventEmitter.on('logs', (body) => {
  if(body.hasOwnProperty("direct_message_indicate_typing_events")) {
    console.log("Typing...");
  }
  if(body.hasOwnProperty("direct_message_events")) {
    console.log("New message :");
    console.log(body.direct_message_events[0].message_create);
  }
});

eventEmitter.on('dm', (user_id, message_create_object) => {
  var message = message_create_object.message_data.text;
  var message_data = message_create_object.message_data;

  if(message_data.hasOwnProperty("quick_reply_response")) {
    console.log(message_data)
    if(message_data.quick_reply_response.metadata === "receive_sats") {
      Twitter.sendTextMessage(user_id, "You just choose to receive sats.")
    }
    if(message_data.quick_reply_response.metadata === "claim_rewards") {
      Twitter.sendTextMessage(user_id, "You just choose to claim rewards.")
    }
    if(message_data.quick_reply_response.metadata === "generate_invoice") {
      Twitter.sendTextMessage(user_id, "You just choose to tip Cryptodidacte and generate an invoice.")
    }
  }

  if(message.toLowerCase() === "start") {
    if(twitterConfig.admin.includes(user_id)) {
      console.log("Sending admin menu...")
      Twitter.sendAdminMenu(user_id)
    } else {
      Twitter.sendMenu(user_id)
    }
  }

  if(message.toLowerCase() === "start no admin") {
    Twitter.sendMenu(user_id);
  }

  if(message.startsWith('ln')) {
    console.log("Paying invoice : ", message)
    Twitter.sendTextMessage(user_id, "Paying invoice...");
    lightning.payInvoice(message, () => {
      Twitter.sendTextMessage(user_id, "✅ Paid!");
    }, (err) => {
      Twitter.sendTextMessage(user_id, "❌ Error paying invoice... Please try later.");
      Twitter.sendTextMessage(user_id, "Logs : " + err.payment_error);
    });
  }

  if(message.startsWith('Generate invoice')) {
    console.log("Generating invoice");
    Twitter.sendTextMessage(user_id, "Generating invoice...");
    lightning.generateInvoice(200, "Test", (invoice) => {
      Twitter.sendTextMessage(user_id, "✅ Done!");
      QRCode.generateQRCode(invoice, (QRCodePath) => {
        console.log("QRCodePath :", QRCodePath);
        if(QRCodePath !== "None") {
          Twitter.sendMessageWithImage(user_id, invoice, QRCodePath);
        } else {
          Twitter.sendTextMessage(user_id, invoice);
        }
      });
    }, (err) => {
      Twitter.sendTextMessage(user_id, "❌ Error generating invoice... Please try later.");
    });
  }
});

module.exports = eventEmitter;
