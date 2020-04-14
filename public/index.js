const popupShowing = false;

$(async () => {
  const defView = $('#params-view').val();
  const viewParams = $('#params-viewParams').val() || null;
  if (defView) {
    loadView(defView, viewParams);
  } else {
    showIndex();
  }

  $('.whitebox[open-view]').click(loadViewOnClick);
  $('.whitebox[oops]').click(() => {
    const p = new Popup({
      title: 'You shall not pass!',
      content: 'This feature is not yet implemented in the MVP version.',
      buttons: [
        {
          text: 'Ok',
          onclick: (pop) => pop.destroy(),
        },
      ],
    });
  });

  window.onpopstate = function (ev) {
    const { state } = ev;
    if (state.view === 'index') return showIndex();
    loadView(state.view, state.params);
  };
});

// GLOBAL
sleep = async (secs) => new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve(secs);
  }, secs * 1000);
});

const transition = async function transition(from, to) {
  return new Promise(async (resolve, reject) => {
    $(from).removeClass('reveal');
    $(to).removeClass('hideEffect');
    await sleep(0.01);
    $(from).addClass('hideEffect');
    await sleep(1);
    $(from).addClass('dis-none');

    $(to).removeClass('dis-none');
    await sleep(0.1);
    $(to).addClass('reveal');

    resolve(to);
  });
};

let loadViewOnClick = async function (ev) {
  const viewName = $(this).attr('open-view');
  const params = $(this).attr('view-args') || null;
  await loadView(viewName, params);
};

let loadView = async function (viewName, params) {
  $('body').addClass('loading');
  const url = `/views/${viewName}.html`;

  const request = $('#sect-view').load(url, async (res, status) => {
    // ANIM
    if (status === 'error') return showIndex();
    $('body').removeClass('loading');
    await transition('', '#sect-view');
    onViewLoaded(params);
  });

  const newJS = $('<script></script>', { id: 'view-js', src: `/views/js/${viewName}.js` });
  $('#view-js').replaceWith(newJS);
  await transition('#sect-index .whitebox', '');
  $('#sect-index').addClass('dis-none');

  let paramsString = '';
  if (params) paramsString = `/${btoa(params)}`;
  history.pushState({ view: viewName, params }, viewName, `/view/${viewName}${paramsString}`);
};

let showIndex = async () => {
  transition('#sect-view', '#sect-index .whitebox');
  $('#sect-index').removeClass('dis-none');
  history.pushState({ view: 'index', params: '' }, 'Cryptodidacte - admin', '/index');
};


const reloadView = function () {
  onViewLoaded(JSON.stringify(viewDetails.query));
};
