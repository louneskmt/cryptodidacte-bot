viewDetails = {};
onViewLoaded = async function (params) {
  let mode = null;
  const obj = JSON.parse(params);
  const selectElementRow = function (ev) {
    $(this).parents('tr').toggleClass('selected');
    checkIfAllSelected();
  };

  const selectAllTabEl = function (ev) {
    $(this).toggleClass('selected');

    if ($(this).hasClass('selected')) {
      $('#data-table').children('tbody').children('tr').each(async (ix, el) => {
        await sleep(ix * 0.05);
        $(el).addClass('selected');
      });
    } else {
      $('#data-table').children('tbody').children('tr').each(async (ix, el) => {
        await sleep(ix * 0.05);
        $(el).removeClass('selected');
      });
    }
  };

  let checkIfAllSelected = function () {
    const total = $('#data-table tr').get().length;
    const selected = $('#data-table tr.selected').get().length;

    if (total === selected)$('#data-table-checkall').addClass('selected');
    else $('#data-table-checkall').removeClass('selected');
  };

  const updateTableRows = () => {
    $('#data-table tr:first-child td').each((ix, el) => {
      if (ix === 0) return true;
      const width = $(el).width();

      $(`.data-thead tr th:nth-child(${ix + 1})`).css({
        width,
      });
    });

    $('.data-table-check').click(selectElementRow);
    $('#data-table-checkall').click(selectAllTabEl);
  };

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

  let receivedData;
  let keyOrder;
  $.post('/db/get', query, (data) => {
    receivedData = data;

    keyOrder = obj.keyOrder || [];

    const headTarget = $('.data-thead table tr');
    $(headTarget).html(`
            <th id="data-table-checkall" class="--icon"></th>
        `);
    if (keyOrder.length === 0) {
      for (const key in data[0]) {
        if (!hideKeys.includes(key)) keyOrder.push(key);
      }
    }

    for (const key of keyOrder) {
      $(headTarget).append(`<th>${key}</th>`);
    }

    for (const entry of data) {
      const tr = $(`
                <tr class="--anim-swipeEnter" mongo-id="${entry._id}" >
                    <td class="data-table-check"></td>
                </tr>
            `);

      for (const key of keyOrder) {
        if (Object.prototype.hasOwnProperty.call(entry, key)) {
          $(tr).append(`<td>${entry[key]}</td>`);
        }
      }

      $('#data-table tbody').append(tr);
    }

    $('#data-table tr').each(async (ix, el) => {
      await sleep(ix * 0.1);
      $(el).addClass('reveal');
    });

    $('body').removeClass('loading');
    updateTableRows();
  });

  const addElement = function () {
    const newEl = $('<tr class="data-table-newElement" form-entry entry-type="tableRow"><td class="--icon">error_outline</td></tr>');
    for (const key of keyOrder) {
      $(newEl).append(`
                <td><input entry-name="${key}" placeholder="${key}" class="--input-in-table" contentEditable/></td>
            `);
    }

    $('#data-table tbody').prepend(newEl);
    setMode('edit');
  };

  let setMode = function (newMode) {
    if (newMode === mode) return false;
    mode = newMode;
    if (mode === 'edit') {
      setFooterTools(`
                <span class="--icon" click-role="addElement">playlist_add</span>
                <span class="--icon" click-role="cancelEdit">clear</span>
                <span class="--icon" click-role="sendNewElements">save</span>
            `);
    }
    if (mode === 'view') {
      setFooterTools(`
                <span class="--icon" click-role="addElement">playlist_add</span>
                <span class="--icon" click-role="deleteElements">delete</span>
                <span class="--icon" click-role="edit">edit</span>
            `);
    }
  };

  let setFooterTools = async function (html) {
    $('.sect-data-footer .footer-cont').addClass('--anim-swipeExit reveal --anim-fill');
    await sleep(0.5);
    $('.sect-data-footer .footer-cont').removeClass('--anim-swipeExit');
    $('.sect-data-footer .footer-cont').html(html);
    $('.sect-data-footer .footer-cont').addClass('--anim-swipeEnter reveal');
  };


  const doAction = function () {
    setMode('view');
  };

  const deleteElements = function () {
    const ids = [];
    $('#data-table .selected[mongo-id]').each(function (ix, el) {
      ids.push($(this).attr('mongo-id'));
    });

    if (ids.length === 0) return;

    const p = new Popup({
      title: 'Delete?',
      content: `You are about to delete ${ids.length} entries`,
      buttons: [
        {
          text: 'Cancel',
          onclick: (pop) => pop.destroy(),
        }, {
          text: 'Delete',
          classes: '--button-fill',
          onclick() {
            this.destroy();
            reallyDeleteElements(ids);
          },
        },
      ],
    });
    p.show();
  };

  let reallyDeleteElements = function (ids) {
    if (ids.length === 0) return;
    const req = $.post('/db/removeAllById', {
      collection: viewDetails.query.collection,
      idList: ids,
    }, (data) => {
      reloadView();
    });
    req.fail((err) => console.log(err));
  };

  sendNewElements = function (ev) {
    const data = [];

    $('#data-table tr[form-entry]').each((ix, el) => {
      const entry = {};
      $(el).find('*[entry-name]').each((iy, child) => {
        const key = $(child).attr('entry-name');
        const val = $(child).val();

        if (val.length <= 0) return true; // continue;
        entry[key] = val;
      });

      if (Object.keys(entry).length > 0) data.push(entry);
    });

    setMode('view');
    if (data.length <= 0) return;

    const req = $.post('/db/insert', {
      collection: viewDetails.query.collection,
      entry: data,
    }, () => {
      reloadView();
    });
    req.fail((err) => {
      console.log(err);
    });
  };

  const cancelEdit = function () {
    // TODO : Modal to confirm
    const p = new Popup({
      title: 'Cancel?',
      content: 'All non-saved changes will be definitely lost. ',
      buttons: [
        {
          text: 'Return',
          onclick: (pop) => pop.destroy(),
        }, {
          text: 'Discard',
          classes: '--button-fill',
          onclick() {
            this.destroy();
            reallyCancel();
          },
        },
      ],
    });
  };

  let reallyCancel = function () {
    $('#data-table tr[form-entry]').remove();
    setMode('view');
  };

  $('*[click-role=showIndex]').click(showIndex);
  $('footer').off('click');
  $('footer').on('click', '*[click-role=addElement]', addElement);
  $('footer').on('click', '*[click-role=sendNewElements]', sendNewElements);
  $('footer').on('click', '*[click-role=deleteElements]', deleteElements);
  $('footer').on('click', '*[click-role=cancelEdit]', cancelEdit);
  setMode('view');
};
