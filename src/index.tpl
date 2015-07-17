<!DOCTYPE html>
<html lang="en">

<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
  <meta charset="utf-8">
  <title>CMS平台</title>
  <meta name="description" content="">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
  <link rel="stylesheet" href="{%$resourceloc%}/css/jquery-ui.min.css">
  <link rel="stylesheet" href="{%$resourceloc%}/css/bootstrap.min.css">
  <link rel="stylesheet" href="{%$resourceloc%}/css/font-awesome.min.css">
  <link rel="stylesheet" href="{%$resourceloc%}/css/ace.min.css">
  <link rel="stylesheet" href="{%$resourceloc%}/css/jquery.datetimepicker.css">
  <link rel="stylesheet" href="{%$resourceloc%}/css/cs.css">
</head>

<body class="no-skin" data-role={%$role%} data-module_acl={%$module_acl%}>
  <div id="navbar" class="navbar navbar-fixed-top">
    <script type="text/javascript">
    try {
      ace.settings.check('navbar', 'fixed')
    } catch (e) {}
    </script>
    <div class="navbar-container" id="navbar-container">
      <button type="button" class="navbar-toggle menu-toggler pull-left" id="menu-toggler" data-target="#sidebar">
        <span class="sr-only">Toggle sidebar</span>
        <span class="icon-bar"></span>
        <span class="icon-bar"></span>
        <span class="icon-bar"></span>
      </button>
      <div class="navbar-header pull-left">
        <a href="" class="navbar-brand">
          <small><i class="fa fa-windows"></i> CMS平台</small></a>
        </a>
      </div>
      <div class="navbar-buttons navbar-header pull-right" role="navigation">
        <ul class="nav ace-nav" id="navToolbar">
          <li class="light-blue">
            <a data-toggle="dropdown" href="#" class="dropdown-toggle">
              <img class="nav-user-photo" src="http://himg.bdimg.com/sys/portrait/item/{%$userinfo.uc%}.jpg" />
              <span class="user-info"><small>Welcome,</small>{%$userinfo.uname%}</span>
              <i class="ace-icon fa fa-caret-down"></i>
            </a>
            <ul class="user-menu dropdown-menu-right dropdown-menu dropdown-caret dropdown-close">
              <li>
                <a id="userlogout">
                  <i class="ace-icon fa fa-power-off"></i> Logout
                </a>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
    <!-- /.navbar-container -->
  </div>
  <div class="main-container" id="main-container">
    <script type="text/javascript">
    try {
      ace.settings.check('main-container', 'fixed')
    } catch (e) {}
    </script>
    <div id="sidebar" class="sidebar responsive" data-sidebar="true" data-sidebar-scroll="true" data-sidebar-hover="true">
      <script type="text/javascript">
      try {
        ace.settings.check('sidebar', 'fixed')
      } catch (e) {}
      </script>
      <ul class="nav nav-list" id="nav-list"></ul>
      <!-- /.nav-list -->
    </div>
    <div class="main-content">
      <div class="main-content-inner" id="mainContainer">
        <div id="intro" class="cms-page current">
          <div class="breadcrumbs"><div class="breadcrumbs-content">概述</div></div>
          <div class="col-xs-12">
            <p>CMS平台是百度浏览器数据下发平台，支持行级别的数据存储，灵活的schema定义从而有效得支持业务的通用型。</p>
            <hr>
            <h5 class="blue">系统说明</h5>
            <ol>
            <li>本平台接入百度passport，任何拥有百度账号的用户都可以登录该系统。</li>
            <li>平台内的绝大部分页面需要权限，如果无权限的用户请找管理员申请权限。</li>
            <li>左侧导航为平台的各种接入的module
            <ul>
              <li>每个module中支持扩展的schema池。</li>
              <li>schema池中可以新增schema，在录入数据的时候可以指定该新增的schema。</li>
              <li>schema一旦创建，而且被数据使用，不能随意删除，但是支持对schema字段的扩展。</li>
              <li>modue data 可以结合schema池中的定义的schema来灵活得定义每层展开的数据结构。</li>
            </ul>
            </li>
            <li>左侧module的向左的小箭头可以将分类导航缩小为一条，增加右侧空间.</li>
            </ol>
            <hr>
            <h5 class="blue">愿景</h5>
            <p>希望通过这个平台，能够极大的方便我们的工作！</p>
            <hr>
            <h5 class="blue">帮助</h5>
            <p>权限申请，可以联系对应的平台管理员</p>
            <p>有任何意见反馈，可以联系：<a href="mailto:zhangzihang@baidu.com">张子航</a></p>
            <p>有任何技术反馈，可以联系：<a href="mailto:huajie@baidu.com">华杰</a>，<a href="mailto:xuying07@baidu.com">徐莹</a></p>
          </div>
        </div>
        <div id="module" class="cms-page hide"></div>
        <div id="schema" class="cms-page hide"></div>
        <div id="schemaedit" class="cms-page hide"></div>
        <div id="modulelist" class="cms-page hide"></div>
        <div id="userlist" class="cms-page hide"></div>
        <div id="log" class="cms-page hide"></div>
      </div>
    </div>
    <!-- /.main-content -->
    <a href="" id="btn-scroll-up" class="btn-scroll-up btn btn-sm btn-inverse">
      <i class="ace-icon fa fa-angle-double-up icon-only bigger-110"></i>
    </a>
  </div>
  <!-- /.main-container -->
  <script src="{%$resourceloc%}/js/lib/jquery-2.1.0.min.js"></script>
  <script type="text/javascript">
  if ('ontouchstart' in document.documentElement) document.write("<script src='{%$resourceloc%}/js/lib/jquery.mobile.custom.min.js'>" + "<" + "/script>");
  </script>
  <script src="{%$resourceloc%}/js/lib/jquery-ui.min.js"></script>
  <script src="{%$resourceloc%}/js/lib/jquery.ui.touch-punch.min.js"></script>
  <script src="{%$resourceloc%}/js/lib/underscore-min.js"></script>
  <script src="{%$resourceloc%}/js/lib/backbone-min.js"></script>
  <script src="{%$resourceloc%}/js/lib/bootstrap.min.js"></script>
  <script src="{%$resourceloc%}/js/lib/ace.min.js"></script>
  <script src="{%$resourceloc%}/js/lib/ace-elements.min.js"></script>
  <script src="{%$resourceloc%}/js/lib/ace-extra.min.js"></script>
  <script src="{%$resourceloc%}/js/lib/jquery.datetimepicker.js"></script>
  <script data-main="{%$resourceloc%}/js/app/main" src="{%$resourceloc%}/js/lib/require-2.1.11.min.js"></script>
  <script type="text/javascript">
  var router = new Backbone.Router;
  router.navigate('modulelist', {
    trigger: true
  });

  if({%$role%} == '5' || {%$role%} == '9'){
    $('#navToolbar').prepend('<li class="grey"><a href="#modulelist/">Module管理</a></li><li class="purple"><a href="#userlist/1">User管理</a></li><li class="green"><a href="#log/1">Log</a></li>');
  }

  $('#userlogout').on('click', function(event){
    $.ajax({
      url: '{%$resourceloc%}/userlogout',
      crossDomain: true,
      dataType: 'jsonp',
    }).always(function(){
      window.location.href=window.location.href;
    });
  });

  </script>
</body>

</html>
