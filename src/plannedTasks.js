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

const resetDailyPoints = () => {
  User.resetLimit();
  __('Daily points have been successfully reset');
};

const dailyTask = new CronJob('00 00 00 * * *', (() => {
  emptyTempDir();
  resetDailyPoints();
}), null, true, 'UTC');
