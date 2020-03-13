var Twitter = require('./src/Twit');

Twitter.Twitter.post('account_activity/all/dev/webhooks.json?url=https%3a%2f%2flouneskmt.com%2fwebhook%2ftwitter', function(err, body, res) {
  console.log(body)
})
