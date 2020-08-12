const leaderboard = require('../tasks/leaderboard.js');

async function testCommand(params, args = []) {
  leaderboard.weeklyLeaderboard();
  leaderboard.monthlyLeaderboard();
}

module.exports = testCommand;
