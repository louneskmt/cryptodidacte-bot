var events = require('events');
var eventEmitter = new events.EventEmitter();
// Twitter modules
var Twitter = require('./Twit');
const { twitterConfig } = require('../config.js');
// Lightning REST
var lightning = require('./lightning.rest.js');
// QRCode generator module
var QRCode = require('./qrcode.js');
// LNQuiz function
var lnquiz = require('./lnquiz.js');
// Status and database functions
var user = require('./user.js');
var database = require('./database.js');

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
  var message = message_create_object.message_data.text.toLowerCase();
  var message_data = message_create_object.message_data;

  if(message === "cancel") {
    user.deleteStatus(user_id);
    return;
  }

  user.getStatus(user_id, (status) => {
    if(status === 'add_winners') {
      console.log("Waiting for winners")
      if(message_data.entities.user_mentions.length === 3) {
        lnquiz.addWinners(message_data.entities.user_mentions);
        Twitter.sendTextMessage(user_id, "✅ You successfully added three winners! ");
      } else {
        Twitter.sendTextMessage(user_id, "You didn't enter three winners, please try again or send 'Cancel'.");
      }
    } else if (status === 'generating_invoice') {
      user.deleteStatus(user_id);
    } else if (status.startsWith('claim_rewards_') && message.startsWith('ln')) {
      var amount = status.split('_')[2];
      var invoice = message;
      lightning.getInvoiceData(invoice, (result) => {
        if(result.num_satoshis === amount) {
          Twitter.sendTextMessage(user_id, "Paying invoice...");
          lightning.payInvoice(invoice, () => {
            Twitter.sendTextMessage(user_id, "✅ Paid!");
            user.deleteStatus(user_id);
            database.removeDocuments("rewards", { user_id: user_id.toString() })
          }, (err) => {
            Twitter.sendTextMessage(user_id, "❌ Error paying invoice... Please try later.");
            Twitter.sendTextMessage(user_id, "Logs : " + err.payment_error);
            user.deleteStatus(user_id);
          });
        } else {
          Twitter.sendTextMessage(user_id, "❌ Error, your invoice is for " + result.num_satoshis.toString() + " sats, \
and you can only claim " + amount.toString() + " sats.\n\nPlease send another invoice, or send 'Cancel'.");

        }
      })
    }
  });

  if(message_data.hasOwnProperty("quick_reply_response")) {
    console.log("Quick Reply")
    if(message_data.quick_reply_response.metadata === "receive_sats") {
      Twitter.sendTextMessage(user_id, "You just chose to receive sats.")
    }
    if(message_data.quick_reply_response.metadata === "claim_rewards") {
      lnquiz.claimRewards(user_id);
    }
    if(message_data.quick_reply_response.metadata === "generate_invoice") {
      Twitter.sendTextMessage(user_id, "You just chose to tip Cryptodidacte and generate an invoice.")
      console.log("Generating invoice");
      Twitter.sendTextMessage(user_id, "Generating invoice...");
      user.setStatus(user_id, "generating_invoice")
      lightning.generateInvoice(200, "Test", (invoice) => {
        Twitter.sendTextMessage(user_id, "✅ Done!");
        user.deleteStatus(user_id);
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
    if(message_data.quick_reply_response.metadata === "add_winners") {
      Twitter.sendTextMessage(user_id, "Please, send the new winners in the following order : question-writing-random.");
      user.setStatus(user_id, "add_winners");
      return;
    }
  }

  if(message === "start admin" && twitterConfig.admin.includes(user_id)) {
    console.log("Sending admin menu...")
    Twitter.sendAdminMenu(user_id)
  }

  if(message === "start") {
    Twitter.sendMenu(user_id);
  }

  // if(message.startsWith('ln')) {
  //   console.log("Checking invoice : ", message);
  //   lightning.getInvoiceData(message, (result) => {
  //     console.log("Amount : ", result.value);
  //   })
  // }


  // if(message.startsWith('ln')) {
  //   console.log("Paying invoice : ", message)
  //   Twitter.sendTextMessage(user_id, "Paying invoice...");
  //   lightning.payInvoice(message, () => {
  //     Twitter.sendTextMessage(user_id, "✅ Paid!");
  //   }, (err) => {
  //     Twitter.sendTextMessage(user_id, "❌ Error paying invoice... Please try later.");
  //     Twitter.sendTextMessage(user_id, "Logs : " + err.payment_error);
  //   });
  // }
});

module.exports = eventEmitter;
