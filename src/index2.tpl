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
</head>

<body class="no-skin">
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
          <small><i class="fa fa-windows"></i> 配置管理平台</small></a>
        </a>
      </div>
      <div class="navbar-buttons navbar-header pull-right" role="navigation">
        <ul class="nav ace-nav">
          <li class="light-blue">
            <a data-toggle="dropdown" href="#" class="dropdown-toggle">
              <img class="nav-user-photo" src="http://himg.bdimg.com/sys/portrait/item/{%$userinfo.uc%}.jpg" />
              <span class="user-info"><small>Welcome,</small>{%$userinfo.uname%}</span>
              <i class="ace-icon fa fa-caret-down"></i>
            </a>
            <ul class="user-menu dropdown-menu-right dropdown-menu dropdown-caret dropdown-close">
              <li>
                <a href="#">
                  <i class="ace-icon fa fa-cog"></i> Settings
                </a>
              </li>
              <li>
                <a href="">
                  <i class="ace-icon fa fa-user"></i> Profile
                </a>
              </li>
              <li class="divider"></li>
              <li>
                <a href="#">
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
        <div id="intro" class="current">
          <div class="breadcrumbs">
            <div class="breadcrumbs-content">概述</div>
          </div>
          <div class="col-xs-12">
            <p>配置管理平台是百度手机浏览器统一的配置数据下发平台，旨在灵活实现各种数据分渠道，平台的配置和下发。</p>
            <hr>
            <h6 class="text-primary">系统说明</h6>
            <ol>
              <li>本平台接入百度passport，任何拥有百度账号的用户都可以登录该系统。</li>
              <li>平台内的绝大部分页面需要权限，如果无权限的用户请找管理员申请权限。</li>
              <li>左侧导航为平台的各种分类，每种分类都对应一种指定的数据。</li>
              <li>平台操作按钮：
                <ul>
                  <li>绿色小工具按钮：暂无功能</li>
                  <li>蓝色铅笔状按钮：编辑分类</li>
                  <li>黄色用户群按钮：管理用户</li>
                  <li>红色齿轮组按钮：用户日志</li>
                </ul>
              </li>
              <li>左侧分类的向左的小箭头可以将分类导航缩小为一条，增加右侧空间</li>
              <li>平台内的搜索尚未实现，后续可以补充上来。</li>
            </ol>
            <hr>
            <h6 class="text-primary">注意事项</h6>
            <ol>
              <li>请不要在一级分类添加数据</li>
              <li>新增schema的时候，最顶部的那个table，请不要做操作</li>
              <li>增加schema的时候，请不要重复命名</li>
            </ol>
            <p>以上在后续都会做技术上的屏蔽，但在完成之前，请先遵照以上规定操作！</p>
            <hr>
            <h6 class="text-primary">愿景</h6>
            <p>希望通过这个平台，能够极大的方便我们的工作！</p>
            <hr>
            <h6 class="text-primary">帮助</h6>
            <p>
              如需帮助请参考：
              <a href="http://wiki.babel.baidu.com/twiki/bin/view/Com/CloudOS/%E7%BB%9F%E4%B8%80%E9%85%8D%E7%BD%AE%E5%B9%B3%E5%8F%B0%E6%95%B0%E6%8D%AE%E5%BD%95%E5%85%A5%E6%B5%81%E7%A8%8B">MIS数据录入说明</a>,
            </p>
            <p>
              或者有任何意见反馈，可以联系：
              <a href="mailto:fandonghui@baidu.com">范东辉</a>,
              <a href="mailto:zhangzihang@baidu.com">张子航</a>
            </p>
          </div>
        </div>
        <div id="contentlist" class="hide"></div>
        <div id="content" class="hide"></div>
        <div id="schema" class="hide"></div>
      </div>
    </div>
    <!-- /.main-content -->
    <a href="" id="btn-scroll-up" class="btn-scroll-up btn btn-sm btn-inverse">
      <i class="ace-icon fa fa-angle-double-up icon-only bigger-110"></i>
    </a>
  </div>
  <!-- /.main-container -->
  <script src="{%$resourceloc%}/js/cslib/jquery-2.1.0.min.js"></script>
  <script type="text/javascript">
  if ('ontouchstart' in document.documentElement) document.write("<script src='{%$resourceloc%}/js/cslib/jquery.mobile.custom.min.js'>" + "<" + "/script>");
  </script>
  <script src="{%$resourceloc%}/js/cslib/jquery-ui.widget.min.js"></script>
  <script src="{%$resourceloc%}/js/cslib/underscore-min.js"></script>
  <script src="{%$resourceloc%}/js/cslib/backbone-min.js"></script>
  <script src="{%$resourceloc%}/js/cslib/bootstrap.min.js"></script>
  <script src="{%$resourceloc%}/js/cslib/ace.min.js"></script>
  <script src="{%$resourceloc%}/js/cslib/ace-elements.min.js"></script>
  <script src="{%$resourceloc%}/js/cslib/ace-extra.min.js"></script>
  <script src="{%$resourceloc%}/js/cslib/jquery.datetimepicker.js"></script>
  <script data-main="{%$resourceloc%}/js/csapp/main" src="{%$resourceloc%}/js/cslib/require-2.1.11.min.js"></script>
</body>

</html>
