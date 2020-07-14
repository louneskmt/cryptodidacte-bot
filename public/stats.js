window.chartColors = {
  red: 'rgb(255, 99, 132)',
  orange: 'rgb(255, 159, 64)',
  yellow: 'rgb(255, 205, 86)',
  green: 'rgb(75, 192, 192)',
  blue: 'rgb(54, 162, 235)',
  purple: 'rgb(153, 102, 255)',
  grey: 'rgb(201, 203, 207)',
};

Chart.plugins.unregister(ChartDataLabels);

let users;
let tweets;

const requestUsers = $.post('/api/db/users/get', {}, (res) => {
  if (res === '-1') return console.log('Error while fetching Users collection.');
  console.log(res);
  users = res.body.queryResponse;
});
requestUsers.fail((err) => console.log('Error while fetching Users collection : ', err));

const requestTweets = $.post('/api/db/tweets/get', {}, (res) => {
  if (res === '-1') return console.log('Error while fetching TweetEvents collection.');
  console.log(res);
  tweets = res.body.queryResponse;
});
requestTweets.fail((err) => console.log('Error while fetching TweetEvents collection : ', err));

$(document).ready(() => {
  console.log('Ready!');

  displayDayDistribChart($('#dayChart'));
  displayHourDistribChart($('#hourChart'));
  displayEventTypeChart($('#eventTypeChart'));
});

const displayDayDistribChart = (ctx) => {
  const tweetsDates = tweets.map((tweet) => new Date(Number(tweet.timestamp)));
  const tweetsDays = tweetsDates.map((date) => date.getDay());

  const perDay = [];
  for (let i = 0; i < 7; i += 1) {
    // Monday = 0, Sunday = 6
    const dayNumber = (i === 0) ? 6 : i - 1;
    perDay[dayNumber] = tweetsDays.filter((e) => e === i).length;
  }

  const dayDistrib = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'],
      datasets: [{
        label: 'Nombre d\'interactions par jour du 06 Juin au 06 Juillet',
        data: perDay,
        borderWidth: 1,
      }],
    },
    options: {
      scales: {
        yAxes: [{
          ticks: {
            beginAtZero: true,
          },
        }],
      },
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Nombre d\'interactions par jour du 06 Juin au 06 Juillet',
      },
    },
  });
};

const displayHourDistribChart = (ctx) => {
  const tweetsDates = tweets.map((tweet) => new Date(Number(tweet.timestamp)));
  const tweetsHours = tweetsDates.map((date) => date.getHours());

  const perHour = [];
  const hours = [];
  for (let i = 0; i < 24; i += 1) {
    perHour[i] = tweetsHours.filter((e) => e === i).length;
    hours[i] = `${i}h à ${i === 23 ? 0 : i + 1}h`;
  }

  const hourDistrib = new Chart(ctx, {
    type: 'horizontalBar',
    data: {
      labels: hours,
      datasets: [{
        label: 'Nombre d\'interactions selon l\'heure du 06 Juin au 06 Juillet',
        data: perHour,
        borderWidth: 1,
      }],
    },
    options: {
      scales: {
        yAxes: [{
          ticks: {
            beginAtZero: true,
          },
        }],
      },
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Nombre d\'interactions selon l\'heure du 06 Juin au 06 Juillet',
      },
    },
  });
};

const displayEventTypeChart = (ctx) => {
  const tweetsType = tweets.map((tweet) => tweet.eventType.capitalize());

  console.log(tweetsType);

  const eventTypes = [...new Set(tweetsType)];
  console.log(eventTypes);

  const perEventTypes = [];
  eventTypes.forEach((eventType) => {
    perEventTypes.push(tweetsType.filter((type) => type === eventType).length);
  });

  console.log(perEventTypes);

  const eventTypesDistrib = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: eventTypes,
      datasets: [{
        label: 'Nombre d\'évènements selon le type du 06 Juin au 06 Juillet',
        data: perEventTypes,
        borderWidth: 1,
        backgroundColor: [
          window.chartColors.red,
          window.chartColors.orange,
          window.chartColors.yellow,
          window.chartColors.green,
        ],
      }],
    },
    plugins: [ChartDataLabels],
    options: {
      plugins: {
        datalabels: {
          formatter(value, context) {
            return `${Math.round((value * 100) / context.dataset.data.reduce((a, b) => a + b, 0))}%`;
          },
        },
      },
      legend: {
        position: 'bottom',
      },
      title: {
        display: true,
        text: 'Nombre d\'évènements en fonction du type d\'interaction',
      },
      animation: {
        animateScale: true,
        animateRotate: true,
      },
      circumference: Math.PI,
      rotation: -Math.PI,
    },
  });
};


// eslint-disable-next-line no-extend-native
String.prototype.capitalize = function () {
  return this.charAt(0).toUpperCase() + this.slice(1);
};
