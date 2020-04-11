// eslint-disable-next-line no-extend-native
String.prototype.hexEncode = function () { // eslint-disable-line func-names
  let hex; let
    i;
  let result = '';
  for (i = 0; i < this.length; i += 1) {
    hex = this.charCodeAt(i).toString(16);
    result += (`000${hex}`).slice(-4);
  }
  return result;
};

const sleep = async (secs) => new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve(secs);
  }, secs * 1000);
});

const retryAuth = () => {
  $('#sect-auth').removeClass('retract');
  $('body').removeClass('loading');
};

const loadSecureJS = (token) => {
  const script = $('<script></script>');
  $(script).attr('src', `/secure.js?token=${token}`);
  $('head').append(script);
};

const hashPassword = function hashPassword(password) {
  // eslint-disable-next-line no-undef
  const hash = sha256.create();
  hash.update(`1d34caabaa37${password}ead78d1d5753583562b6`);
  return hash.hex();
};

const connect = async function connect() {
  const username = $('#auth-username').val();
  const password = $('#auth-password').val();

  $('body').addClass('loading');


  const nPassword = await hashPassword(password);

  $('#sect-auth').addClass('retract');
  const request = $.post('/login', {
    username, password: nPassword,
  });
  request.then((res) => {
    if (res === '-1') return retryAuth();

    let next = $('#params-next').val();
    next += $('#params-nextParams').val() ? (`/${$('#params-nextParams').val()}`) : '';
    const href = next ? `/view/${next}` : '/index';
    window.location.href = href;
  });
  request.catch((res) => {
    retryAuth();
  });
};

$(() => {
  $('#auth-connect').click(() => connect());
});
