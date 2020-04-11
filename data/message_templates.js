const messageTemplates = {
  global: {
    end: {
      text: 'End of action 🙃',
    },
    retry: {
      text: "❌ Please try again, or send 'Cancel'.",
    },
    error: {
      text: 'Sorry, something went wrong',
    },
    done: {
      text: '✅ Done!',
    },
  },
  lnquiz: {
    notify(reward) {
      return {
        text: `🥳 You have been added as a new LNQuiz winner ! You can now claim ${reward} sats, by sending 'Start' and choosing option '🎁 Claim rewards' !`,
      };
    },
    confirmAddition(winners) {
      return {
        text: `✅ You successfully added this three winners : \n\n🏁 @${winners[0].username}\n✍️ @${winners[1].username}\n🎲 @${winners[2].username}`,
      };
    },
    badAmount(amount, expectedAmount) {
      return {
        text: `Your invoice is for ${amount} sats. Please generate an invoice for ${expectedAmount} sats.`,
      };
    },
    currentRewards(rewards) {
      return {
        text: `Current #LNQuiz Rewards :\n\n🏁 ${rewards.question} sats\n✍️ ${rewards.writing} sats \n🎲 ${rewards.random} sats`,
      };
    },
    askForInvoice(amount) {
      return {
        text: `Please, send an invoice for ${amount} sats.`,
      };
    },
    askForWinners: {
      text: '➡️ Please, send the new winners in the following order : 🏁 Question - ✍️ Writing - 🎲 Random.',
    },
    askForRewards: {
      text: '➡️ Please, send the new rewards amount in the following order : 🏁 Question - ✍️ Writing - 🎲 Random, separated with a space and in sats (e.g. "150 300 150").',
    },
    retry: {
      text: "You didn't enter three winners.",
    },
    wip: {
      text: 'Paying invoice...',
    },
    paid: {
      text: '✅ Paid!',
    },
    error: {
      text: '❌ Error paying invoice or getting invoice data... Please try again later.',
    },
    nothing: {
      text: 'You have nothing to claim.',
    },
  },
  tip: {
    wip: {
      text: 'Generating invoice...',
    },
    error: {
      text: '❌ Error generating invoice... Please try later.',
    },
    thanks: {
      text: '🙏 Thanks a lot for supporting our work ! See you soon !',
    },
  },
  menu: {
    admin: {
      text: '👋 Hey, admin ! What do you want to do ? 🤔',
      quick_reply: {
        type: 'options',
        options: [
          {
            label: '🏅 Add new #LNQuiz winners',
            description: 'Set Twitter accounts as winners',
            metadata: 'add_winners',
          },
          {
            label: 'ℹ️ Get #LNQuiz Rewards info',
            description: 'See the current rewards amounts',
            metadata: 'get_rewards_info',
          },
          {
            label: '🔄 Update #LNQuiz Rewards',
            description: 'Set new rewards amounts',
            metadata: 'update_rewards',
          },
          {
            label: '💸 Send CDT',
            description: 'Send CDT to an ETH address or Twitter account',
            metadata: 'send_cdt',
          },
          {
            label: 'Refill Lightning node',
            description: 'Generate an invoice to refill LN node',
            metadata: 'refill_node',
          },
        ],
      },
    },
    standard: {
      text: '👋 Hey ! What do you want to do ?',
      quick_reply: {
        type: 'options',
        options: [
          {
            label: '🎁 Claim rewards',
            description: 'Claim #LNQuiz rewards if you won',
            metadata: 'claim_rewards',
          },
          {
            label: '💸 Tip Cryptodidacte',
            description: 'Generate an LN invoice to tip Cryptodidacte',
            metadata: 'generate_invoice',
          },
        ],
      },
    },
  },
};

module.exports = messageTemplates;
