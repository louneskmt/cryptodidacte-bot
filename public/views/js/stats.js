viewDetails = {};
onViewLoaded = async function (params) {
  /* ****************************************************************
  * ************************ DECLARING VIEW ************************ *
  **************************************************************** */

  let mode = null;
  let isEditing = false;
  const obj = JSON.parse(params);
  const {
    collection,
    filter = {},
    title,
  } = obj;

  const query = {
    collection,
    filter,
  };

  const hideKeys = obj.hideKeys || ['_id'];

  viewDetails.query = query;
  $('.sect-data-header h1').text(title || 'Database');

  $('#data-table tbody').html('');
  $('body').addClass('loading');

  let setFooterTools = async function (html) {
    $('.sect-data-footer .footer-cont').addClass('--anim-swipeExit reveal --anim-fill');
    await sleep(0.5);
    $('.sect-data-footer .footer-cont').removeClass('--anim-swipeExit');
    $('.sect-data-footer .footer-cont').html(html);
    $('.sect-data-footer .footer-cont').addClass('--anim-swipeEnter reveal');
  };

  /* ****************************************************************
  * *********************** EVENT LISTENERS ************************ *
  **************************************************************** */

  const roleMap = {
    showIndex,
    addElement,
    sendNewElements,
    deleteElements,
    cancelEdit,
    startEdit,
    sendEdit,
  };

  $('*[click-role=showIndex]').click(showIndex);
  $('footer').off('click');
  $('footer').on('click', '*[click-role]', function (ev) {
    const role = $(this).attr('click-role');
    if (Object.prototype.hasOwnProperty.call(roleMap, role)) {
      roleMap[role].call(this);
    }
  });

  setMode('view');
};
