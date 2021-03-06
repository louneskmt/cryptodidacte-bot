/* eslint-disable prefer-arrow-callback */
const assert = require('assert');
const should = require('should');

const {
  db, TweetEvent, User, LNQuizReward,
} = require('../src/database/mongoose.js');


before(async function () {
  await User.deleteMany({});
  await TweetEvent.deleteMany({});
});

describe('should save without error', function () {
  it('user1', (done) => {
    const user1 = new User({
      _id: '123456',
      username: 'user1',
    });
    user1.save(done);
  });
  it('user2', function (done) {
    const user2 = new User({
      _id: '654321',
      username: 'user2',
    });
    user2.save(done);
  });
  it('event1', function (done) {
    const event1 = new TweetEvent({
      user: '123456',
      eventType: 'RETWEET',
      tweetId: '1234',
      targetTweetId: '4321',
      date: Date.now(),
    });
    event1.save(done);
  });
  it('event2', function (done) {
    const event2 = new TweetEvent({
      user: '654321',
      eventType: 'FAvorite',
      tweetId: '21',
      targetTweetId: '12',
      date: Date.now(),
    });
    event2.save(done);
  });
  it('event3', function (done) {
    const event3 = new TweetEvent({
      user: '123456',
      eventType: 'quote',
      tweetId: '123',
      targetTweetId: '321',
      date: Date.now(),
    });
    event3.save(done);
  });
});

describe('User Model', function () {
  describe('should have a valid id', function () {
    it('user1', async function () {
      const user1 = await User.findByUserId('123456');
      user1.should.have.property('_id', '123456');
    });
  });

  describe('should be linked to valid events', function () {
    it('user1', async function () {
      const events = await TweetEvent.findByUserId('123456');
      await User.updateOne({ _id: '123456' }, { $addToSet: { events: events[0]._id } });
      const user = await User.findByUserId('123456');
      const pop = await user.populateEvents();
    });
  });

  describe('random tests', function () {
    it('first', function () {
      User
        .findByUserId('123456')
        .then(async (user) => {
          user.balance += 20;
          user.save(async () => {
            const user2 = await User.findByUserId('123456');
            console.log(user2);
          });
        });
    });
  });
});

describe('TweetEvent Model', function () {
  describe('user property should be link to user entry', function () {
    it('event1', async function () {
      const events = await TweetEvent.findByUserId('123456');
      for (const event of events) {
        event.user.should.have.property('_id', '123456');
      }
    });

    it('event2', async function () {
      const events = await TweetEvent.findByUserId('654321');
      for (const event of events) {
        event.user.should.have.property('_id', '654321');
      }
    });

    it('events should not be link to invalid user', async function () {
      const events = await TweetEvent.findByUserId('123456');
      for (const event of events) {
        event.user.should.not.have.property('_id', '654321');
      }
    });
  });
});

describe('LNQuizReward', function () {
  it('#loadUIDescription', function () {
    console.log(LNQuizReward.loadUIDescription().test);
  });
});
