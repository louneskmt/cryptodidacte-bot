viewDetails = {};
onViewLoaded = async function (params) {
  /* ****************************************************************
  * ************************ DECLARING VIEW ************************ *
  **************************************************************** */

  JSON.parse(params);

  $('.sect-data-header h1').text('Statistics');

  $('body').removeClass('loading');

  $('.selector').click(function () {
    const way = this.id.replace('-selector', '');
    console.log('click', way);

    const children = $('.stats-container > main').children('.intent');
    const selectedIndex = $('.stats-container > main').find('.selected').index();
    console.log(selectedIndex);

    let nextIndex;
    if (way === 'right') nextIndex = (selectedIndex + 1 >= children.length) ? 0 : selectedIndex + 1;
    else if (way === 'left') nextIndex = (selectedIndex - 1 < 0) ? 2 : selectedIndex - 1;

    console.log('next', nextIndex);
    children.eq(selectedIndex).removeClass('selected');
    children.eq(nextIndex).addClass('selected');
  });


  const setFooterTools = async function (html) {
    $('.sect-data-footer .footer-cont').addClass('--anim-swipeExit reveal --anim-fill');
    await sleep(0.5);
    $('.sect-data-footer .footer-cont').removeClass('--anim-swipeExit');
    $('.sect-data-footer .footer-cont').html(html);
    $('.sect-data-footer .footer-cont').addClass('--anim-swipeEnter reveal');
  };

  /* ****************************************************************
  * *********************** EVENT LISTENERS ************************ *
  **************************************************************** */

  const roleMap = {};

  $('*[click-role=showIndex]').click(showIndex);
  $('footer').off('click');
  $('footer').on('click', '*[click-role]', function (ev) {
    const role = $(this).attr('click-role');
    if (Object.prototype.hasOwnProperty.call(roleMap, role)) {
      roleMap[role].call(this);
    }
  });
};
