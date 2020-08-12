const moment = require('moment');

const { __ } = require('./logger.js');
const Twitter = require('../Twitter.js');
const { TweetEvent, User } = require('./database/mongoose.js');

const weeklyLeaderboard = () => {
  /*
  const mmtFirst = moment(2, 'HH').utc().subtract(1, 'week').subtract(moment().utc().get('day') - 1, 'days');
  const mmtLast = mmtFirst.clone().add(7, 'days').subtract(1, 'seconds');

  const firstDayOfLastWeek = mmtFirst.toDate();
  const lastDayOfLastWeek = mmtLast.toDate();
  */

  User
    .getWeeklyLeaderboard()
    .then((users) => __(users))
    .catch((err) => __(err, 9));
};

const monthlyLeaderboard = () => {
  /*
  const mmtFirst = moment(2, 'HH').utc().subtract(1, 'month').subtract(moment().utc().get('date') - 1, 'days');
  const mmtLast = mmtFirst.clone().add(1, 'month').subtract(1, 'seconds');

  const firstDayOfLastMonth = mmtFirst.toDate();
  const lastDayOfLastMonth = mmtLast.toDate();
  */

  User
    .getMonthlyLeaderboard()
    .then((users) => __(users))
    .catch((err) => __(err, 9));
};

module.exports = {
  weeklyLeaderboard,
  monthlyLeaderboard,
};
