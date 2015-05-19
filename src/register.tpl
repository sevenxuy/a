<!DOCTYPE html>
<html lang="en">

<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
  <meta charset="utf-8">
  <title>Blank Page - Ace Admin</title>
  <meta name="description" content="">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
  <link rel="stylesheet" href="{%$resourceloc%}/css/bootstrap.min.css">
  <link rel="stylesheet" href="{%$resourceloc%}/css/font-awesome.min.css">
  <link rel="stylesheet" href="{%$resourceloc%}/css/ace.min.css">
  <link rel="stylesheet" href="{%$resourceloc%}/css/cs.css">
  <style>
  body {
    height: 100%;
    position: fixed;
    top: 0px;
    left: 0px;
    right: 0px;
    bottom: 0px;
    display: box;
    display: -webkit-box;
    box-align: center;
    -webkit-box-align: center;
    box-pack: center;
    -webkit-box-pack: center;
    background: #438eb9;
    color: #fff;
  }
  .alert{
    width: 280px;
    word-break: break-all;
  }
  
  .headline {
    text-align: center;
    font-size: 30px;
    margin-bottom: 20px;
  }
  </style>
</head>
<body>
<div>
  <div id="tip" class="hide"></div>
  <div class="headline">
    <i class="fa fa-windows fa-4"></i> CMS平台权限申请
  </div>
  <div class="row">
    <label>真实姓名</label>
    <input type="text" id="real_name" placeholder="（必填）">
  </div>
  <div class="row">
    <label>公司邮箱</label>
    <input type="text" id="email">
  </div>
  <div class="row">
    <label>部门</label>
    <input type="text" id="department">
  </div>
  <div class="row">
    <label>权限级别</label>
    <select class="reg-level" id="regLevel">
      <option selected="selected" disabled="disabled">选择权限级别（必填）</option>
      <option value="module级权限">module级权限</option>
      <option value="平台最高权限">平台最高权限</option>
    </select>
  </div>
  <div id="regModuleBox" class="hide">
    <div id="regModule"></div>
    <div class="row">
      <label for=""></label><span class="reg-add" id="regAdd"><i class="fa fa-plus-circle"></i> 新增Module权限</span></div>
  </div>
  <div class="reg-submit" id="regSubmit">提交</div>
</div>
  <script src="{%$resourceloc%}/js/lib/jquery-2.1.0.min.js"></script>
  <script>
  var regpage = {
    options: {
      userapply: '/ucms/cms/userapply',
      i: 0,
      userinfo: {%$userinfo%},
      modulelist: {%$modulelist%}
    },
    init: function() {
      this.render();
      this._bindEvents();
    },
    render: function() {
      var options = this.options,
        list = options.modulelist,
        h = [];
      for (var i = 0, j = list.length; i < j; i++) {
        h.push('<option value="' + list[i]['m_name'] + '">' + list[i]['m_name'] + '</option>');
      }
      options.moduleElem = h.join('');
      this._createrRegModuleItemElem(options);

      $('#email').val(options.userinfo.secureemail);
    },
    _createrRegModuleItemElem: function(options) {
      var self = this,
        h = [];
      options.i = options.i + 1;
      h.push('<div class="row reg-moduleitem"><label for=""></label>');
      h.push('<select class="reg-module">');
      h.push('<option selected="selected" disabled="disabled">选择Module</option>');
      h.push(options.moduleElem);
      h.push('</select>');
      h.push('<span>');
      h.push('<div class="radio"><label><input name="regAcl_' + options.i + '" type="radio" class="ace" value="编辑"><span class="lbl">编辑</span></label></div>');
      h.push('<div class="radio"><label><input name="regAcl_' + options.i + '" type="radio" class="ace" value="管理"><span class="lbl">管理</span></label></div>');
      h.push('</span>');
      h.push('<span class="reg-del"><i class="fa fa-times-circle"></i></span>');
      h.push('</div>');
      $('#regModule').append(h.join(''));
      $('span.reg-del').on('click', function(event) {
        self._delModuleItemElem(event);
      });
    },
    _bindEvents: function() {
      var self = this,
        options = this.options;
      $('#regLevel').on('change', this._changeLevel);
      $('#regAdd').on('click', function(event) {
        self._createrRegModuleItemElem(options);
      });
      $('#regSubmit').on('click', function(event) {
        self._submit(options);
      });
    },
    _changeLevel: function(event) {
      var level = $(event.target).val();
      if (level == 'module级权限') {
        $('#regModuleBox').removeClass('hide');
      } else {
        $('#regModuleBox').addClass('hide');
      }
      return false;
    },
    _delModuleItemElem: function(event) {
      $(event.target).parent().parent().remove();
      return false;
    },
    _submit: function(options) {
      var real_name = $('#real_name').val().trim(),
        email = $('#email').val().trim(),
        role = $('#regLevel').val(),
        department = $('#department').val().trim(),
        remark = {},
        module_acl = {};
      remark.role = role;

      $('div.reg-moduleitem').each(function() {
        var module = $(this).find('select.reg-module').val(),
          acl = $(this).find('input[name^=regAcl_]:checked').val();
        module_acl[module] = acl;
      });

      remark.module_acl = module_acl;

      if((role=="module级权限") && JSON.stringify(module_acl)=='{}'){
        $('#tip').empty().append('<div class="alert alert-danger">请确认输入真实姓名和权限级别。</div>').removeClass('hide');
        return false;
      }

      if (real_name && role) {
        $.ajax({
          url: options.userapply,
          data: {
            real_name: real_name,
            department: department,
            email: email,
            remark: JSON.stringify(remark)
          }
        }).done(function(response) {
          if(!response.errno){
            $('#tip').empty().append('<div class="alert alert-success">已提交成功，等待审核</div>').removeClass('hide');
          }else{
            $('#tip').empty().append('<div class="alert alert-danger">'+response.error+'</div>').removeClass('hide');
          }
        }).fail(function(response) {});
      } else {
         $('#tip').empty().append('<div class="alert alert-danger">请确认输入真实姓名和权限级别。</div>').removeClass('hide');
        return false;
      }
      return false;
    }
  };
  regpage.init();
  </script>
</body>

</html>
