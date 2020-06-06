/* eslint-disable no-unused-vars */

const fs = require('fs');
const path = require('path');
const { CronJob } = require('cron');

const { __ } = require('./logger.js');
const { User } = require('./database/mongoose.js');

const tempDirectory = path.join(__dirname, '../assets/temp');

const emptyTempDir = () => {
  fs.readdir(tempDirectory, (errReading, files) => {
    if (errReading) {
      __(`Error deleting temp directory (${tempDirectory}) : ${errReading}`, 9);
      throw errReading;
    }

    for (const file of files) {
      fs.unlink(path.join(tempDirectory, file), (errDeleting) => {
        if (errDeleting) {
          __(`Error deleting file (${file}) : ${errDeleting}`, 9);
          throw errDeleting;
        }
      });
    }

    __('Temp directory have been successfully deleted');
  });
};

// Each day
const dailyTask = new CronJob('00 00 00 * * *', (() => {
  emptyTempDir();
  User.resetDailyPoints().then(() => __('Daily points have been successfully reset'));
}), null, true, 'UTC');

// Each Monday at midnight
const weeklyTask = new CronJob('00 00 00 * * 1', (() => {
  User.resetWeeklyPoints().then(() => __('Weekly  points have been successfully reset'));
}), null, true, 'UTC');

// Each month (at midnight on the first day)
const monthlyTask = new CronJob('00 00 00 1 * *', (() => {
  User.resetMonthlyPoints().then(() => __('Monthly points have been successfully reset'));
}), null, true, 'UTC');
