const {__} = require("./logger.js");
var Twitter = require('./Twit');


var lightning = require('./lightning.rest.js');
var QRCode = require('./qrcode.js');
var lnquiz = require('./lnquiz.js');
var user = require('./user.js');
var database = require('./database.js');


function start(params){
    if(params.status) end(params);
    
    let {user_id} = params;
  
    Twitter.sendMenu(user_id);
  }
  
  function tryAddWinners(params){
    let {user_id, message_data} = params;
  
    if(message_data.entities.user_mentions.length === 3) {
      lnquiz.addWinners(message_data.entities.user_mentions);
      end(params, "✅ You successfully added three winners! ");
    } else {
      retry(params, "You didn't enter three winners.");
    }
  }
  
  function generatingInvoice(params){
    /** ??????? **/
  
    let {user_id} = params;
  
    Twitter.sendTextMessage(user_id, "Nothing here yet.");
    end(user_id)
  }
  
  function addWinners(params){
    let {user_id} = params;
    Twitter.sendTextMessage(user_id, "Please, send the new winners in the following order : question-writing-random.");
    return user.setStatus(user_id, "adding_winners");
  }
  
  function generateInvoice(params){
    let {user_id} = params;
  
    Twitter.sendTextMessage(user_id, "Thank you for choosing to tip Cryptodidacte")
    __("events.js@generateInvoice : Generating an invoice (tip) ");
  
    Twitter.sendTextMessage(user_id, "Generating invoice...");
    user.setStatus(user_id, "generating_invoice")
  
    lightning.generateInvoice(200, "Test", (invoice) => {
  
      Twitter.sendTextMessage(user_id, "✅ Done!");
  
      QRCode.generateQRCode(invoice, (QRCodePath) => {
        __("QRCodePath :", QRCodePath);
        if(QRCodePath !== "None") {
          Twitter.sendMessageWithImage(user_id, invoice, QRCodePath);
        } else {
          Twitter.sendTextMessage(user_id, invoice);
        }
  
        end(params);
      });
  
    }, (err) => {
      __("events.js@generateInvoice : Could not generate invoice, got following", 9);
      __(err, 9);
  
      end(params, "❌ Error generating invoice... Please try later.");
  
    });
  }
  
  function claimRewards(params){
    let {message, user_id, status} = params;
  
    if(message.startsWith('ln')) {
      var amount = status.split('_')[2];
      var invoice = message;
  
      lightning.getInvoiceData(invoice,
  
        (result) => {
        if(result.num_satoshis === amount) {
          Twitter.sendTextMessage(user_id, "Paying invoice...");
          __`events.js@claimRewars : An invoice is being paid`
  
          lightning.payInvoice(invoice, () => {
            database.removeDocuments("rewards", { user_id: user_id.toString() })
            __(`events.js@claimRewars : Reward paid, document removed !`, 2)
  
            //*** TODO : Should I send message "end of action" ?***//
            end(params, "✅ Paid!");
          }, (err) => {
            // Cannot pay invoice
            Twitter.sendTextMessage(user_id, "❌ Error paying invoice... Please try again later.");
            __("Could not pay invoice, got following error : ", 9)
            __(err.payment_error, 9);
            end(params, "Error log : " + err.payment_error);
          });
  
        } else {
          /// Amounts not corresponding
          return retry(params, "Your invoice is for " + result.num_satoshis.toString() + " sats, \
  and you can only claim " + amount.toString() + " sats.");
        }
      },
  
      /// ERROR AT GETTING INVOICE DATA
      (err) => {
        //** CANCELLATION (?) **/
        __("events.js@claimRewards:lightning.getInvoiceData : Couldn't get invoice data, got following error : ", 9);
        __(err, 9);
        return end(params, "Could not get invoice data")
      });
  
    } else {
      return retry(params);
    }
  }
  
  function updateRewards(params){
    let {user_id} = params;
    Twitter.sendTextMessage(user_id, "Please, send the new rewards ammounts in the following order : question-writing-random, separated with a space and in sats (e.g. \"150 300 150\").");
    return user.setStatus(user_id, "updating_rewards");
  }
  
  function updatingRewards(params){
    let {message} = params;
  
    if(/^(\d+ \d+ \d+)$/.test(message)) {
      var amounts = message.split(' ');
      var newRewards = {
        question: Number(amounts[0], 10),
        writing: Number(amounts[1], 10),
        random: Number(amounts[2], 10)
      }
      __("Trying to update rewards : ");
      __(newRewards);
  
      lnquiz.updateRewards(newRewards, (err) => {
        if(err) {
          __("events.js@updateRewards : Got error ", 9);
          __(err, 9);
  
          return retry(params);
        }
  
        end(params, "✅ Updated!");
      });
    } else {
      // Not matching pattern
      retry(params);
    }
  }
  
  function receiveSats(params){
    end(params, "You have chosen to receive sats")
  }
  
  function countRewards(params){
    // TODO : Claim rewards here not in lnquiz.js
    lnquiz.countRewards(params.user_id, (amount) => {
      if(amount) {
        Twitter.sendTextMessage(params.user_id, "Please, send an invoice for " + amount + " sats.");
        return user.setStatus(params.user_id, "claim_rewards_" + amount + "_sats");
      } else {
        return end(params, "You have nothing to claim.");
      }
    });
  }
  
  // INTERACTIONS
  
  function end(params, description){
    let {user_id} = params;
  
    user.deleteStatus(user_id);
  
    if(description) Twitter.sendTextMessage(user_id, description)
  
    setTimeout(function(){
      Twitter.sendTextMessage(user_id, "End of action 🙃")
    },1000);
    __(`End of action for ${user_id}`)
  }
  
  
  function retry(params, description){
    let {user_id} = params;
  
    if(description) Twitter.sendTextMessage(user_id, description)
  
    setTimeout(function(){
      Twitter.sendTextMessage(user_id, "❌ Please try again, or send 'Cancel'.");
    }, 1000)
  }

  module.exports = {
    start,
    retry,
    end,
    tryAddWinners,
    addWinners,
    countRewards,
    claimRewards,
    receiveSats,
    generateInvoice,
    generatingInvoice,
    updateRewards,
    updatingRewards
  }