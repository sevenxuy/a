define(function(require, exports, module) {
  'use strict';
  var _util = require('cs.util'),
    notify = require('cs.plugin.notify'),
    autosize = require('../lib/autosize.min');

  $.widget('cs.module', {
    options: {
      userinfo: '/ucms/cms/userinfo',
      // schemagetlist: '../../datacms/schemagetlist.json',
      schemagetlist: '/ucms/cms/schemagetlist',
      // dataget: '../../datacms/dataget.json', //for test
      dataget: '/ucms/cms/dataget',
      datadelete: '/ucms/cms/datadelete',
      dataupdate: '/ucms/cms/dataupdate',
      dataadd: '/ucms/cms/dataadd',
      dataapply: '/ucms/cms/dataapply',
      datarefuse: '/ucms/cms/datarefuse',
      datapass: '/ucms/cms/datapass',
      datapublish: '/ucms/cms/datapublish',
      // uploadfile: '../../datacms/uploadfile.json',
      uploadfile: '/ucms/cms/uploadfile',
      schema_content: [],
      schema_map: {}
    },
    _create: function(opt) {
      this.getUserinfo(opt);
      this._bindEvents();
      this.element.data('widgetCreated', true);
    },
    getUserinfo: function(opt) {
      _.extend(this.options, opt);
      var self = this,
        options = this.options;
      $.ajax({
        url: options.userinfo
      }).done(function(data) {
        var use_acl = data.data.use_acl;
        if (use_acl && (!_.isEmpty(use_acl))) {
          options.role = use_acl.role;
          if (use_acl.module_acl && (use_acl.module_acl != 'null')) {
            options.role_current = $.parseJSON(use_acl.module_acl)[options.m_code];
          }
          self.render(opt);
        }
      });
    },
    render: function(opt) {
      // _.extend(this.options, opt);
      var self = this,
        options = this.options;
      $.ajax({
        url: options.dataget,
        data: {
          m_code: options.m_code,
          parent_id: options.parent_id
        }
      }).done(function(data) {
        if (!data.errno) {
          self.element.append(self._createModuleElem(data.data));
        } else {
          notify({
            text: data.error
          });
        }
      });
      if (this.element.hasClass('hide')) {
        this.element.removeClass('hide').addClass('current');
      }
    },
    reRender: function(opt) {
      this.element.addClass('hide').empty();
      this.getUserinfo(opt);
      this.element.removeClass('hide').addClass('current');
    },
    _createModuleElem: function(data) {
      var self = this,
        options = this.options,
        h = [],
        lists = data.data,
        schema_content = options.schema_content = $.parseJSON(data.schema_content);
      options.schema_code = data.schema_code;
      options.m_code = data.m_code;
      options.parent_id = data.parent_id;
      if (schema_content && (!_.isNull(schema_content)) && (!_.isEmpty(schema_content))) {
        h.push('<div class="breadcrumbs">');
        h.push('<div class="breadcrumbs-content" data-rel="tooltip">Module Data</div>');
        h.push('<div class="table-tool">');
        h.push('<button class="btn btn-mini btn-success data-add"><i class="fa fa-plus"></i> 新增</button>');
        h.push('</div>');
        h.push('</div>');
        h.push('<div class="col-xs-12">');
        //data && schema_content
        h.push('<table class="table table-bordered"><thead class="thin-border-bottom"><tr><th>id</th>');
        _.each(schema_content, function(schema_item, schema_index) {
          h.push('<th>' + schema_item.desc + '</th>');
          switch (schema_item.type) {
            case 'select':
              options['select_' + schema_item.key] = self._getSelectData(schema_item.regx);
              options['select_' + schema_item.key + '_elem'] = self._createSelectElem(schema_item.regx);
              break;
          }
        });
        h.push('<th>schema code</th><th>status</th>');
        if (options.parent_id == 0) {
          h.push('<th>last updated</th>')
        }
        h.push('<th>操作</th></tr></thead><tbody></div>');
        _.each(lists, function(item, index) {
          h.push('<tr data-id=' + item.id + ' data-data="' + item.data + '">');
          h.push(self._createItemInnerElem(item));
          h.push('</tr>')
        });
        h.push('</tbody></table>');
      } else {
        h.push('<div class="breadcrumbs">');
        h.push('<div class="breadcrumbs-content" data-rel="tooltip">Module Data</div>');
        h.push('<div class="table-tool">');
        h.push('<button class="btn btn-mini btn-success data-add hide"><i class="fa fa-plus"></i> 新增</button>');
        h.push('</div>');
        h.push('</div>');
        h.push('<div class="col-xs-12">');
        //only show schema add on page
        h.push('<div>请选择Schema : <span id="data-schema"></span><a class="btn btn-link schema-save">确定</a></div>');
        self._getSchemaListData();
        h.push('</div>');
      }
      return h.join('');
    },
    _getSchemaListData: function() {
      var self = this,
        options = this.options;
      $.ajax({
        url: options.schemagetlist,
        data: {
          m_code: options.m_code
        }
      }).done(function(data) {
        if (!data.errno) {
          self.element.find('#data-schema').append(self._createSchemaSelectElem(data.data));
        } else {
          notify({
            text: response.error
          });
        }
      }).fail(function(response) {});
    },
    _createSchemaSelectElem: function(data) {
      var options = this.options,
        h = [];
      h.push('<select>');
      _.each(data, function(item, index) {
        options.schema_map[item.schema_code] = item.schema_content;
        h.push('<option value="' + item.schema_code + '">' + item.schema_name + ' : ' + item.schema_code + '</option>');
      });
      h.push('</select>');
      return h.join('');
    },
    _createBlankElem: function() {
      var self = this,
        options = this.options,
        schema_content = options.schema_content,
        h = [];
      h.push('<div class="breadcrumbs">');
      h.push('<div class="breadcrumbs-content" data-rel="tooltip">Module Data</div>');
      h.push('<div class="table-tool">');
      h.push('<button class="btn btn-mini btn-success data-add"><i class="fa fa-plus"></i> 新增</button>');
      h.push('</div>');
      h.push('</div>');
      h.push('<div class="col-xs-12">');
      h.push('<table class="table table-bordered"><thead class="thin-border-bottom"><tr><th>id</th>');
      _.each(schema_content, function(schema_item, schema_index) {
        h.push('<th>' + schema_item.desc + '</th>');
        switch (schema_item.type) {
          case 'select':
            options['select_' + schema_item.key] = self._getSelectData(schema_item.regx);
            options['select_' + schema_item.key + '_elem'] = self._createSelectElem(schema_item.regx);
            break;
        }
      });
      h.push('<th>schema code</th><th>status</th>');
      h.push('<th>操作</th></tr></thead><tbody>');
      h.push('</tbody></table>');
      h.push('</div>');
      return h.join('');
    },
    _createItemInnerElem: function(item) {
      var self = this,
        options = this.options,
        schema_content = options.schema_content,
        schema_code = options.schema_code,
        h = [],
        itemdata = $.parseJSON(item.data);

      h.push('<td>' + item.id + '</td>');
      _.each(schema_content, function(schema_item, schema_index) {
        if (schema_item.key === 'ukey') {
          h.push('<td class="uneditable" data-key="' + schema_item.key + '" data-type="' + schema_item.type + '" data-value="' + (itemdata[schema_item.key] || '') + '">' + (itemdata[schema_item.key] || '') + '</td>')
        } else {
          h.push('<td class="editable" data-key="' + schema_item.key + '" data-type="' + schema_item.type + '" data-value="' + (itemdata[schema_item.key] || '') + '">');
          switch (schema_item.type) {
            case 'select':
              h.push('<span>' + options['select_' + schema_item.key][itemdata[schema_item.key]] + '</span>');
              break;
            case 'image':
              h.push('<a href="' + (itemdata[schema_item.key] || '') + '"><img class="snapshot" src="' + (itemdata[schema_item.key] || '') + '" /><br/><span>' + (itemdata[schema_item.key] || '') + '</span></a>');
              break;
            case 'link':
              h.push('<a href="' + (itemdata[schema_item.key] || '') + '"><span>' + (itemdata[schema_item.key] || '') + '</span></a>');
              break;
            case 'boolean':
              if (itemdata[schema_item.key] == '1') {
                h.push('<span>YES</span>');
              } else {
                h.push('<span>NO</span>');
              }
              break;
            case 'time':
            default:
              h.push('<span>' + (itemdata[schema_item.key] || '') + '</span>');
          }
          h.push('</td>');
        }
      });
      h.push('<td>' + schema_code + '</td><td>' + self.getStatusFace(item.status) + '</td>');
      if (options.parent_id == '0') {
        h.push('<td>' + item.update_time + '</td>');
      }
      h.push('<td>');
      h.push('<a class="btn btn-link data-edit">编辑</a>');
      h.push('<a class="btn btn-link data-save hide">保存</a>');
      h.push('<a class="btn btn-link data-expand">展开</a>');
      h.push('<a class="btn btn-link data-del">删除</a>');
      if (item.status == '0') {
        h.push('<a class="btn btn-link data-audit" data-id="' + item.id + '">提交审核</a>');
      }

      if (((options.role == '1') && (options.role_current == '3')) || (options.role == '5') || (options.role == '9')) {
        if (item.status == '6') {
          h.push('<a class="btn btn-link data-reject" data-id="' + item.id + '">审核拒绝</a>');
          h.push('<a class="btn btn-link data-permit" data-id="' + item.id + '">审核通过</a>');
        }
        if (item.status == '3') {
          h.push('<a class="btn btn-link data-publish" data-id="' + item.id + '">发布</a>');
        }
      }

      h.push('</td>');
      return h.join('');
    },
    _bindEvents: function() {
      this._on(this.element, {
        'click button.data-add': this._dataAddElem,
        'click a.data-audit': this._dataAudit,
        'click a.data-reject': this._dataReject,
        'click a.data-permit': this._dataPermit,
        'click a.data-publish': this._dataPublish,
        'click a.data-del': this._dataDel,
        'click a.data-edit': this._dataEdit,
        'click a.data-save': this._dataSave,
        'click a.data-expand': this._dataExpand,
        'change textarea': this._rowpink,
        'change select': this._rowpink,
        'change input': this._rowpink,
        'change input[type=file]': this._uploadImage,
        'click a.schema-save': this._schemaSave
      });
    },
    _dataAudit: function() {
      this._dataOprate('dataapply');
    },
    _dataReject: function(event) {
      this._dataOprate('datarefuse');
    },
    _dataPermit: function(event) {
      this._dataOprate('datapass');
    },
    _dataPublish: function(event) {
      this._dataOprate('datapublish');
    },
    _dataOprate: function(urltag) {
      var options = this.options,
        id = $(event.target).attr('data-id');
      $.ajax({
        url: options[urltag],
        data: {
          m_code: options.m_code,
          id: id
        }
      }).done(function(response) {
        if (!response.errno) {
          window.location.reload();
        } else {
          notify({
            text: '提交失败'
          });
        }
      }).fail(function(response) {});
      return false;
    },
    _schemaSave: function(event) {
      var options = this.options;
      options.schema_code = $('#data-schema').find('select').val();
      options.schema_content = $.parseJSON(options.schema_map[options.schema_code]);
      this.element.addClass('hide').empty();
      this.element.append(this._createBlankElem());
      this.element.removeClass('hide');
      return false;
    },
    _dataAddElem: function() {
      var self = this,
        options = this.options,
        h = [];
      h.push('<tr><td></td>');
      _.each(options.schema_content, function(schema_item, schema_index) {
        h.push('<td class="editable" data-key="' + schema_item.key + '" data-type="' + schema_item.type + '" data-value=""><span></span>');
        switch (schema_item.type) {
          case 'select':
            h.push(options['select_' + schema_item.key + '_elem']);
            break;
          case 'image':
            h.push('<a href=""><img class="snapshot"/><br><span></span></a><textarea></textarea><input type="file" accept="image/*" />');
            break;
          case 'boolean':
            h.push('<input type="checkbox" class="ace ace-switch ace-switch-2"><span class="lbl middle"></span>');
            break;
          case 'time':
            h.push('<input class="datetimepicker" type="text" />');
            break;
          case 'link':
          case 'text':
            h.push('<textarea></textarea>');
        }
        h.push('</td>');
      });
      h.push('<td>' + options.schema_code + '</td><td>' + self.getStatusFace('0') + '</td>');
      if (options.parent_id == 0) {
        h.push('<td></td>');
      }
      h.push('<td>');
      h.push('<a class="btn btn-link data-edit hide">编辑</a>');
      h.push('<a class="btn btn-link data-save">保存</a>');
      h.push('<a class="btn btn-link data-expand">展开</a>');
      h.push('<a class="btn btn-link data-del">删除</a>');
      h.push('<a class="btn btn-link data-audit hide">提交审核</a>');
      h.push('</td></tr>');
      $('#module').find('tbody').prepend(h.join(''));
      $('textarea').each(function() {
        autosize($(this));
      });
      $('input.datetimepicker').datetimepicker({
        format: 'Y-m-d H:i:s'
      });
      return false;
    },
    _dataDel: function(event) {
      var $tr = $(event.target).closest('tr'),
        id = $tr.attr('data-id'),
        options = this.options;
      if (!!id) {
        //delete existing item
        $.ajax({
          url: options.datadelete,
          data: {
            m_code: options.m_code,
            id: id
          }
        }).done(function(response) {
          if (!response.errno) {
            $tr.remove();
            notify({
              text: '删除成功。'
            });
          } else {
            notify({
              text: '删除失败，请稍后再试。'
            });
          }
        }).fail(function() {
          notify({
            text: '删除失败，请稍后再试。'
          });
        });
      } else {
        //delete new item which is not saved
        $tr.remove();
      }
      return false;
    },
    _dataEdit: function(event) {
      var options = this.options,
        $editlink = $(event.target),
        $savelink = $editlink.parent().find('a.data-save'),
        $editable = $editlink.closest('tr').find('td.editable');
      $editlink.addClass('hide');
      $savelink.removeClass('hide');
      $editable.each(function() {
        var $span = $(this).find('span');
        $span.addClass('hide');
        switch ($(this).attr('data-type')) {
          case 'select':
            $(this).append(options['select_' + $(this).attr('data-key') + '_elem']);
            $(this).find('option[value=' + $(this).attr('data-value') + ']').attr({
              'selected': 'selected'
            });
            break;
          case 'image':
            $(this).append('<textarea style="background: #fff">' + $span.text() + '</textarea><input type="file" accept="image/*" />');
            break;
          case 'link':
            $(this).append('<textarea style="background: #fff">' + $span.text() + '</textarea>');
            break;
          case 'boolean':
            if ($span.text() == 'YES') {
              $(this).append('<input type="checkbox" checked="checked" class="ace ace-switch ace-switch-2"><span class="lbl middle"></span>');
            } else {
              $(this).append('<input type="checkbox" class="ace ace-switch ace-switch-2"><span class="lbl middle"></span>');
            }
            break;
          case 'time':
            $(this).append('<input class="datetimepicker" type="text" value="' + $span.text() + '"/>');
            break;
          case 'text':
            $(this).append('<textarea style="background: #fff">' + $span.text() + '</textarea>');
            break;
        }
        $('textarea').each(function() {
          autosize($(this));
        });
        $('input.datetimepicker').datetimepicker({
          format: 'Y-m-d H:i:s'
        });
      });
      return false;
    },
    _dataSave: function(event) {
      var self = this,
        options = this.options,
        $updatelink = $(event.target),
        $editlink = $updatelink.parent().find('a.data-edit'),
        $tr = $updatelink.closest('tr'),
        id = $tr.attr('data-id'),
        data = {},
        dataStr,
        $editable = $tr.find('td.editable'),
        reqdata;

      //save without change, only manipute DOM, no request
      if (!$tr.hasClass('row-pink')) {
        if (!!id) {
          //for existing item
          $editable.each(function() {
            switch ($(this).attr('data-type')) {
              case 'select':
                $(this).find('select').remove();
                $(this).find('span').removeClass('hide');
                break;
              case 'image':
                $(this).find('textarea').remove();
                $(this).find('input').remove();
                $(this).find('span').removeClass('hide');
                break;
              case 'boolean':
              case 'time':
                $(this).find('input').remove();
                $(this).find('span').removeClass('hide');
                break;
              case 'link':
              case 'text':
                $(this).find('textarea').remove();
                $(this).find('span').removeClass('hide');
                break;
            }
          });
          $updatelink.addClass('hide');
          $editlink.removeClass('hide');
        } else {
          //for empty new add item
          notify({
            text: '请确认输入。'
          });
          return false;
        }
        return false;
      }

      //get new data
      $editable.each(function() {
        switch ($(this).attr('data-type')) {
          case 'select':
            data[$(this).attr('data-key')] = $(this).find('select').val();
            break;
          case 'boolean':
            if ($(this).find('input').is(':checked')) {
              data[$(this).attr('data-key')] = '1';
            } else {
              data[$(this).attr('data-key')] = '0';
            }
            break;
          case 'time':
            data[$(this).attr('data-key')] = $(this).find('input').val();
            break;
          case 'image':
          case 'link':
          case 'text':
            data[$(this).attr('data-key')] = $(this).find('textarea').val().trim();
            break;
        }
      });

      $tr.find('td.uneditable').each(function() {
        data[$(this).attr('data-key')] = $(this).attr('data-value');
      });

      if ((options.parent_id == '0') && (!id) && (!data['ukey'])) {
        notify({
          text: '请确认输入“唯一标识号”。'
        });
        return false;
      }

      dataStr = JSON.stringify(data);
      //no request if data strin is the same.
      if (dataStr == $tr.attr('data-data')) {
        return false;
      }
      if (!!id) {
        //update existing item: send save request only when data string has been changed.
        reqdata = {
          m_code: options.m_code,
          id: id,
          data: dataStr
        };
        this._updateDataReq($tr, options.dataupdate, reqdata);
      } else {
        //add new item
        reqdata = {
          m_code: options.m_code,
          data: dataStr,
          parent_id: options.parent_id,
          schema_code: options.schema_code
        };
        this._updateDataReq($tr, options.dataadd, reqdata);
      }
      return false;
    },
    _updateDataReq: function($tr, requrl, reqdata) {
      var self = this;
      $.ajax({
        url: requrl,
        data: reqdata
      }).done(function(response) {
        if (!response.errno) {
          var item = response.data;
          if (!_.isEmpty(item)) {
            $tr.removeClass('row-pink').empty().append(self._createItemInnerElem(item));
            $tr.attr({
              'data-id': item.id,
              'data-data': item.data
            });
          }
        } else {
          notify({
            text: response.error
          });
        }
      }).fail(function() {
        notify({
          text: '保存失败，请稍后再试。'
        });
      });
    },
    _dataExpand: function(event) {
      var options = this.options,
        parent_id = $(event.target).closest('tr').attr('data-id'),
        router = new Backbone.Router;
      router.navigate(options.m_code + '/module/' + parent_id, {
        trigger: true
      });
      return false;
    },
    _rowpink: function(event) {
      var $row = $(event.target).closest('tr');
      if (!$row.hasClass('row-pink')) {
        $row.addClass('row-pink');
      }
      return false;
    },
    _uploadImage: function(event) {
      var options = this.options,
        data = new FormData(),
        $td = $(event.target).parent();
      data.append('file', event.target.files[0]);
      $.ajax({
        url: options.uploadfile,
        data: data,
        cache: false,
        contentType: false,
        processData: false,
        type: 'POST'
      }).done(function(data) {
        var newsrc = data.data;
        $td.find('a').attr({
          href: newsrc
        });
        $td.find('img').attr({
          src: newsrc
        });
        $td.find('textarea').val(newsrc).trigger('change');
        autosize($td.find('textarea'));
      }).fail(function() {});
      return false;
    },
    //option sequence does matter.
    _createSelectElem: function(regx) {
      var h = [],
        regx = regx.split('|');
      h.push('<select>');
      _.each(regx, function(item, index) {
        var item = item.split(':');
        h.push('<option value="' + item[1] + '">' + item[0] + '</option>');
      });
      h.push('</select>');
      return h.join('');
    },
    //for select to get data by key, while option sequence does not matter.
    _getSelectData: function(regx) {
      var regx = regx.split('|'),
        data = {};
      _.each(regx, function(item, index) {
        var item = item.split(':');
        data[item[1]] = item[0];
      });
      return data;
    },
    getStatusFace: function(status) {
      switch (status) {
        case '0':
          return '未评审';
          break;
        case '1':
          return '屏蔽';
          break;
        case '2':
          return '审核拒绝';
          break;
        case '3':
          return '审核通过';
          break;
        case '4':
          return '发布屏蔽';
          break;
        case '5':
          return '发布成功';
          break;
        case '6':
          return '审核中';
          break;
        case '9':
          return '已删除';
          break;
      }
    }
  });
  module.exports = $.cs.module;
});
