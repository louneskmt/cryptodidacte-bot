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

  /* ****************************************************************
  * ************************** FUNCTIONS ************************** *
  **************************************************************** */

  let receivedData;
  let keyOrder;

  const selectElementRow = function (ev) {
    if (mode === 'edit') return editEntry.call(this, ev);

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
    if (mode === 'add') {
      setFooterTools(`
            <span class="--icon" click-role="addElement">playlist_add</span>
            <span class="--icon" click-role="cancelEdit">clear</span>
            <span class="--icon" click-role="sendNewElements">save</span>
        `);
    }
    if (mode === 'view') {
      $('#data-table').removeClass('data-edit');
      setFooterTools(`
            <span class="--icon" click-role="addElement">playlist_add</span>
            <span class="--icon" click-role="deleteElements">delete</span>
            <span class="--icon" click-role="startEdit">edit</span>
        `);
    }
    if (mode === 'edit') {
      $('#data-table').addClass('data-edit');
      setFooterTools(`
            <span class="--icon" click-role="cancelEdit">clear</span>
            <span class="--icon" click-role="sendEdit">save</span>
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
  };

  let reallyDeleteElements = function (ids) {
    if (ids.length === 0) return;
    const req = $.post(`/api/db/${viewDetails.query.collection}/remove/`, {
      idList: ids,
    }, (data) => {
      reloadView();
    });
    req.fail((err) => console.log(err));
  };

  const sendNewElements = function (ev) {
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


  const editEntry = async function (ev) {
    const self = this;

    if (isEditing) {
      return new Popup({
        title: 'Save?',
        content: 'Do you want to save your edit?',
        buttons: [
          {
            text: 'Cancel',
            onclick: (pop) => pop.destroy(),
          }, {
            text: 'Discard',
            onclick(pop) { pop.destroy(); reallyCancel(); isEditing = false; setMode('edit'); editEntry.call(self, ev); },
          }, {
            text: 'Save',
            classes: '--button-fill',
            onclick() {
              this.destroy();
              reallyDeleteElements(ids);
            },
          },
        ],
      });
    }
    isEditing = true;

    const tr = $(this).parent();
    await sleep(0.1);
    $(tr).addClass('--tr-editing');

    const newEl = $('<tr class="data-table-newElement" form-entry entry-type="tableRow"><td class="--icon">error_outline</td></tr>');

    for (const desc of viewDetails.schemaDescription) {
      const i = viewDetails.schemaDescription.indexOf(desc);
      const value = $($(tr).find('td')[i + 1]).text();
      const { field } = desc;
      $(newEl).append(`
            <td><input entry-name="${field}" placeholder="${value}" class="--input-in-table" contentEditable/></td>
        `);
    }

    $(newEl).insertAfter(tr);
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

  const reallyCancel = function () {
    $('#data-table tr[form-entry]').remove();
    setMode('view');
  };

  const formatValue = function (desc, value) {
    if (typeof value === 'undefined') return null;

    switch (desc.type) {
      case 'string':
        return value;

      case 'boolean':
        if (desc.values) return value ? desc.values.true : desc.values.false;
        return (value ? 'Yes' : 'No');

      case 'date': {
        const date = new Date(value);
        return `${date.getFullYear().toString().padStart(4, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
      }

      case 'number':
        return value.toString();

      default:
        return null;
    }
  };

  /* ****************************************************************
  * ************************ LOADING VIEW ************************* *
  **************************************************************** */

  $.post(`/api/db/${query.collection}/get`, query.filter, (data) => {
    const { queryResponse, schemaDescription } = data;
    viewDetails.schemaDescription = schemaDescription;


    // Add table head row
    const headTarget = $('.data-thead table tr');
    $(headTarget).html(`
            <th id="data-table-checkall" class="--icon"></th>
        `);
    for (const key of schemaDescription) {
      $(headTarget).append(`<th>${key.title}</th>`);
    }

    for (const entry of queryResponse) {
      const tr = $(`
                <tr class="--anim-swipeEnter" mongo-id="${entry._id}" >
                    <td class="data-table-check"></td>
                </tr>
            `);

      for (const desc of schemaDescription) {
        $(tr).append(`<td>${formatValue(desc, entry[desc.field]) || '<span class="--na-value">?</span>'}</td>`);
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

  const startEdit = function () {
    setMode('edit');
  };

  const sendEdit = function () {
    const el = $('#data-table tr[form-entry]');
    if ($(el).get().length > 1) {
      return console.error('More than one entry to edit. Aborting...');
    }

    const id = $(el).attr('mongo-id');
    const data = {};
    $(el).find('input[entry-name]').each((ix, child) => {
      const key = $(child).attr('entry-name');
      const val = $(child).val();

      if (val.length <= 0 || !val) return true;
      data[key] = val;
    });

    const req = $.post('/db/updateById/', {
      collection: viewDetails.query.collection,
      query: data,
    }, () => {
      reloadView();
    });
    req.fail((err) => {
      console.error(err);
    });
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
    console.log(this);
    const role = $(this).attr('click-role');
    if (Object.prototype.hasOwnProperty.call(roleMap, role)) {
      roleMap[role].call(this);
    }
  });

  setMode('view');
};
