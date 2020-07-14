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

$(document).ready(() => {
  console.log('Ready!');

  let displayPercentages = false;
  const tweetId = $('#params-id').val();
  $('#title').text(`Cryptodidacte Tweet Stats - ${tweetId}`);

  buildCharts();

  $('#button-percentages').on('click', () => {
    displayPercentages = !displayPercentages;
  });

  const requestTweetInfo = $.post('/api/twitter/tweets/show', { tweetId }, (data) => {
    console.log(data);
  });

  const requestEvents = $.post('/api/db/tweetevents/get', { filter: { targetTweetId: tweetId } }, (res) => {
    if (res === '-1') return console.log('Error while fetching TweetEvents collection.');
    events = res.queryResponse;

    updateCharts(events);
  });

  requestTweetInfo.fail((err) => console.log('Error while fetching tweet info : ', err));
  requestEvents.fail((err) => console.log('Error while fetching TweetEvents collection : ', err));

  $.when(requestTweetInfo, requestEvents).done(() => console.log('Done!'));
});

const updateCharts = (events) => {
  const eventsType = events.map((event) => event.eventType.capitalize());
  const eventTypes = [...new Set(eventsType)];
  const perEventTypes = [];
  eventTypes.forEach((eventType) => {
    perEventTypes.push(eventsType.filter((type) => type === eventType).length);
  });

  window.eventTypesDistrib.data.datasets[0].data = perEventTypes;
  window.eventTypesDistrib.data.labels = eventTypes;
  window.eventTypesDistrib.update();
};

const buildCharts = () => {
  window.eventTypesDistrib = new Chart($('#eventTypeChart'), {
    type: 'doughnut',
    data: {
      labels: [],
      datasets: [{
        label: 'Nombre d\'évènements',
        data: [],
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