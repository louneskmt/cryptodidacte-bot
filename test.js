var Twitter = require('./src/Twit');

Twitter.Twitter.post('account_activity/all/dev/webhooks.json?url=https%3A%2F%2Flouneskmt.com%2Fwebhook%2Ftwitter', function(err, body, res) {
  console.log(body)
})
