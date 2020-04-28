const { User } = require('../src/database/mongoose.js');

User
  .find({})
  .then((users) => {
    users.forEach((user) => {
      user.points = user.balance;
      user
        .save()
        .then((result) => {
          console.log(`${result.username} points set to ${result.points}.`);
        });
    });
  });
