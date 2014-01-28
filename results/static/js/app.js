(function() {
  var configCallback, init, module, modules, results;

  this.results = {};

  results = this.results;

  modules = ["ngRoute", "ngSanitize", "results.controllers.main", "results.services.resource", "results.services.common", "results.services.model", "mrKeypress", "gmUrls", "gmFlash", "gmModal", "gmStorage", "gmConfirm", "gmOverlay", "i18next", "ui.bootstrap"];

  configCallback = function($routeProvider, $locationProvider, $httpProvider, $provide, $compileProvider, $gmUrlsProvider, $sceDelegateProvider) {
    var apiUrls, authHttpIntercept, defaultHeaders;
    $routeProvider.when('/', {
      templateUrl: '/static/views/container.html',
      controller: "MainController"
    });
    $routeProvider.when('/:year/:month/:day', {
      templateUrl: '/static/views/container.html',
      controller: "MainController"
    });
    $routeProvider.when('/users/:userId', {
      templateUrl: '/static/views/container.html',
      controller: "UserListController"
    });
    $routeProvider.when('/goals/:goalId', {
      templateUrl: '/static/views/container.html',
      controller: "GoalListController"
    });
    $routeProvider.when('/wins/:winId', {
      templateUrl: '/static/views/container.html',
      controller: "WinListController"
    });
    $routeProvider.when('/login', {
      templateUrl: '/static/views/login.html',
      controller: "LoginController"
    });
    $routeProvider.when('/signup', {
      templateUrl: '/static/views/signup.html',
      controller: "PublicRegisterController"
    });
    $routeProvider.otherwise({
      redirectTo: '/login'
    });
    apiUrls = {
      "root": "/",
      "login": "/api-token-auth/",
      "signup": "/api-token-register/",
      "logout": "/auth/logout",
      "wins": "/wins",
      "goals": "/goals",
      "users": "/users"
    };
    $gmUrlsProvider.setUrls("api", apiUrls);
    defaultHeaders = {
      "Content-Type": "application/json",
      "Accept-Language": "en",
      "X-Host": window.location.hostname
    };
    $httpProvider.defaults.headers["delete"] = defaultHeaders;
    $httpProvider.defaults.headers.post = defaultHeaders;
    $httpProvider.defaults.headers.put = defaultHeaders;
    $httpProvider.defaults.headers.get = {
      "X-Host": window.location.hostname
    };
    authHttpIntercept = function($q, $location) {
      return function(promise) {
        return promise.then(null, function(response) {
          if (response.status === 401 || response.status === 0) {
            $location.url("/login?next=" + ($location.path()));
          }
          return $q.reject(response);
        });
      };
    };
    $provide.factory("authHttpIntercept", ["$q", "$location", authHttpIntercept]);
    $httpProvider.responseInterceptors.push('authHttpIntercept');
    $sceDelegateProvider.resourceUrlWhitelist(['self', 'http://localhost:8000/**']);
  };

  init = function($rootScope, $gmStorage, $gmAuth, $gmUrls, $location, config) {
    $rootScope.auth = $gmAuth.getUser();
    $gmUrls.setHost("api", config.host, config.scheme);
    $rootScope.logout = function() {
      $gmStorage.clear();
      return $location.url("/login");
    };
  };

  module = angular.module('results', modules);

  module.config(['$routeProvider', '$locationProvider', '$httpProvider', '$provide', '$compileProvider', '$gmUrlsProvider', '$sceDelegateProvider', configCallback]);

  module.run(["$rootScope", "$gmStorage", "$gmAuth", "$gmUrls", "$location", 'config', init]);

  angular.module('results.config', []).value('config', {
    host: "localhost:8000",
    scheme: "http",
    defaultLanguage: "en",
    debug: false
  });

}).call(this);

(function() {
  var LoginController, PublicRegisterController, module;

  LoginController = function($scope, $rootScope, $location, $routeParams, rs, $gmAuth, $i18next) {
    $rootScope.pageTitle = $i18next.t('login.login-title');
    $rootScope.pageSection = 'login';
    $scope.form = {};
    $scope.submit = function() {
      var email, onError, onSuccess, password, promise;
      email = $scope.form.email;
      password = $scope.form.password;
      $scope.loading = true;
      onSuccess = function(user) {
        $gmAuth.setUser(user);
        $rootScope.auth = user;
        if ($routeParams['next']) {
          return $location.url($routeParams['next']);
        } else {
          return $location.url("/");
        }
      };
      onError = function(data) {
        $scope.error = true;
        return $scope.errorMessage = data.detail;
      };
      promise = rs.login(email, password);
      promise = promise.then(onSuccess, onError);
      return promise.then(function() {
        return $scope.loading = false;
      });
    };
  };

  PublicRegisterController = function($scope, $rootScope, $location, rs, $data, $gmAuth, $i18next) {
    $rootScope.pageTitle = $i18next.t('register.register');
    $rootScope.pageSection = 'signup';
    $scope.form = {
      "type": "public"
    };
    $scope.$watch("site.data.public_register", function(value) {
      if (value === false) {
        return $location.url("/login");
      }
    });
    $scope.submit = function() {
      var email, onError, onSuccess, password, promise, userame;
      userame = $scope.form.username;
      email = $scope.form.email;
      password = $scope.form.password;
      $scope.loading = true;
      onSuccess = function(user) {
        return $location.url("/login");
      };
      onError = function(data) {
        $scope.error = true;
        return $scope.errorMessage = data.detail;
      };
      promise = rs.register(username, email, password);
      return promise = promise.then(onSuccess, onError);
    };
  };

  module = angular.module("results.controllers.auth", []);

  module.controller("LoginController", ['$scope', '$rootScope', '$location', '$routeParams', 'resource', '$gmAuth', '$i18next', LoginController]);

  module.controller("PublicRegisterController", ["$scope", "$rootScope", "$location", "resource", "$data", "$gmAuth", "$i18next", PublicRegisterController]);

}).call(this);

(function() {
  var GoalListController, LoginController, MainController, PublicRegisterController, TooltipController, WinListController, module;

  MainController = function($scope, $rootScope, resource, $timeout, $routeParams, $location) {
    var onUserError, onUserSuccess;
    onUserSuccess = function(result) {
      $scope.user = result;
      if ($routeParams.year) {
        return $scope.getGoalsAndWins();
      }
    };
    onUserError = function(result) {
      return $location.url("/login");
    };
    resource.getUser("me").then(onUserSuccess, onUserError);
    $rootScope.year = $routeParams.year || 0;
    $rootScope.month = $routeParams.month || 0;
    $rootScope.day = $routeParams.day || 0;
    $scope.$watch('dt', function() {
      if ($scope.dt) {
        $rootScope.year = $scope.dt.getFullYear();
        $rootScope.month = $scope.dt.getMonth() + 1;
        $rootScope.day = $scope.dt.getDate();
        $location.url("/" + $rootScope.year + '/' + $rootScope.month + '/' + $rootScope.day);
      }
    });
    $scope.getGoalsAndWins = function() {
      var day, month, weekly, year;
      resource.getGoals(weekly = true, year = $rootScope.year, month = $rootScope.month, day = $rootScope.day).then(function(result) {
        return $rootScope.weeklyGoalList = result;
      });
      resource.getWins(weekly = true, year = $rootScope.year, month = $rootScope.month, day = $rootScope.day).then(function(result) {
        return $rootScope.weeklyWinList = result;
      });
      resource.getGoals(weekly = false, year = $rootScope.year, month = $rootScope.month, day = $rootScope.day).then(function(result) {
        return $rootScope.goalList = result;
      });
      resource.getWins(weekly = false, year = $rootScope.year, month = $rootScope.month, day = $rootScope.day).then(function(result) {
        return $rootScope.winList = result;
      });
    };
    $scope.addWinButton = function() {
      return $scope.showWinDialog = true;
    };
    $scope.closeWinButton = function() {
      return $scope.showWinDialog = false;
    };
    $scope.addGoalButton = function() {
      return $scope.showGoalDialog = true;
    };
    $scope.closeGoalButton = function() {
      return $scope.showGoalDialog = false;
    };
    $scope.isFlashWarnVisible = false;
    $scope.isFlashErrorVisible = false;
    $scope.isFlashSuccessVisible = false;
    $scope.$on("flash", function(event, data) {
      var hideFlash;
      if (data.type === "warn") {
        $scope.isFlashWarnVisible = true;
      }
      if (data.type === "error") {
        $scope.isFlashErrorVisible = true;
      }
      if (data.type === "success") {
        $scope.isFlashSuccessVisible = true;
      }
      $scope.flashMessage = data.message;
      hideFlash = function() {
        $scope.isFlashWarnVisible = false;
        $scope.isFlashErrorVisible = false;
        return $scope.isFlashSuccessVisible = false;
      };
      return $timeout(hideFlash, 2000);
    });
    $scope.today = function() {
      $scope.dt = new Date();
    };
    if ($rootScope.year === 0) {
      $scope.today();
    } else {
      $scope.dt = new Date($rootScope.year + '-' + $rootScope.month + '-' + $rootScope.day);
    }
    $scope.showWeeks = false;
    $scope.toggleWeeks = function() {
      $scope.showWeeks = !$scope.showWeeks;
    };
    $scope.clear = function() {
      $scope.dt = null;
    };
    $scope.open = function($event) {
      $event.preventDefault();
      $event.stopPropagation();
    };
    $scope.opened = true;
    $scope.dateOptions = {
      'year-format': "'yy'",
      'starting-day': 1
    };
    $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'shortDate'];
    $scope.format = $scope.formats[1];
  };

  WinListController = function($scope, $rootScope, $location, $model, resource) {
    $scope.addWin = function(weekly) {
      var cb;
      if (weekly == null) {
        weekly = false;
      }
      $scope.win.date = $rootScope.year + '-' + $rootScope.month + '-' + $rootScope.day;
      cb = resource.postWin($scope.win, weekly);
      cb.then(function(response) {
        var new_win;
        new_win = $model.make_model("wins", response.data);
        if (weekly) {
          return $rootScope.weeklyWinList.push(new_win);
        } else {
          return $rootScope.winList.push(new_win);
        }
      });
      $scope.win = {};
    };
    $scope.deleteWin = function(win) {
      return win.remove().then(function() {
        return $scope.getGoalsAndWins();
      });
    };
    $scope.weeklyWin = {};
    $scope.win = {};
  };

  GoalListController = function($scope, $rootScope, $location, $model, resource) {
    $scope.addGoal = function(weekly) {
      var cb;
      if (weekly == null) {
        weekly = false;
      }
      $scope.goal.date = $rootScope.year + '-' + $rootScope.month + '-' + $rootScope.day;
      cb = resource.postGoal($scope.goal, weekly);
      cb.then(function(response) {
        var new_goal;
        new_goal = $model.make_model("goals", response.data);
        if (weekly) {
          return $rootScope.weeklyGoalList.push(new_goal);
        } else {
          return $rootScope.goalList.push(new_goal);
        }
      });
      $scope.goal = {};
    };
    $scope.deleteGoal = function(goal) {
      return goal.remove().then(function() {
        return $scope.getGoalsAndWins();
      });
    };
    $scope.goal = {};
    $scope.weeklyGoal = {};
  };

  PublicRegisterController = function($scope, $rootScope, $location, resource, $gmAuth) {
    $rootScope.pageTitle = 'Signup';
    $rootScope.pageSection = 'signup';
    $scope.form = {
      "type": "public"
    };
    $scope.$watch("site.data.public_register", function(value) {
      if (value === false) {
        return $location.url("/login");
      }
    });
    $scope.submit = function() {
      var email, onError, onSuccess, password, promise, username;
      username = $scope.form.username;
      email = $scope.form.email;
      password = $scope.form.password;
      $scope.loading = true;
      onSuccess = function(user) {
        return $location.url("/login");
      };
      onError = function(data) {
        $scope.error = true;
        return $scope.errorMessage = data.detail;
      };
      promise = resource.register(username, email, password);
      return promise = promise.then(onSuccess, onError);
    };
  };

  LoginController = function($scope, $rootScope, $location, $routeParams, resource, $gmAuth) {
    $rootScope.pageTitle = 'Login';
    $rootScope.pageSection = 'login';
    $scope.form = {};
    $scope.submit = function() {
      var onError, onSuccess, password, promise, username;
      username = $scope.form.username;
      password = $scope.form.password;
      $scope.loading = true;
      onSuccess = function(user) {
        $gmAuth.setUser(user);
        $rootScope.auth = user;
        return $location.url("/");
      };
      onError = function(data) {
        $scope.error = true;
        return $scope.errorMessage = data.detail;
      };
      promise = resource.login(username, password);
      promise = promise.then(onSuccess, onError);
      return promise.then(function() {
        return $scope.loading = false;
      });
    };
  };

  TooltipController = function($scope, $document) {
    $scope.isTooltipVisible = false;
    $scope.showTooltip = function() {
      return $scope.isTooltipVisible = !$scope.isTooltipVisible;
    };
    return $scope.hideTooltip = function() {
      return $scope.isTooltipVisible = false;
    };
  };

  module = angular.module("results.controllers.main", []);

  module.controller("MainController", ["$scope", "$rootScope", "resource", "$timeout", "$routeParams", "$location", MainController]);

  module.controller("TooltipController", ["$scope", "$document", TooltipController]);

  module.controller("LoginController", ["$scope", "$rootScope", "$location", "$routeParams", "resource", "$gmAuth", LoginController]);

  module.controller("GoalListController", ["$scope", "$rootScope", "$location", "$model", "resource", GoalListController]);

  module.controller("WinListController", ["$scope", "$rootScope", "$location", "$model", "resource", WinListController]);

  module.controller("PublicRegisterController", ["$scope", "$rootScope", "$location", "resource", "$gmAuth", PublicRegisterController]);

}).call(this);

(function() {
  var SimpleConfirmProvider, module;

  SimpleConfirmProvider = function($rootScope, $q, $window) {
    var service;
    service = {};
    service.confirm = function(message) {
      var defered;
      defered = $q.defer();
      _.defer(function() {
        var res;
        res = $window.confirm(message);
        if (res) {
          defered.resolve();
        } else {
          defered.reject();
        }
        return $rootScope.$apply();
      });
      return defered.promise;
    };
    return service;
  };

  module = angular.module('gmConfirm', []);

  module.factory('$confirm', ["$rootScope", "$q", "$window", SimpleConfirmProvider]);

}).call(this);

(function() {
  var FlashMessagesDirective, FlashMessagesProvider, module;

  FlashMessagesProvider = function($rootScope, $q, $window) {
    var service;
    service = {};
    service.info = function(message, scrollUp) {
      return $rootScope.$broadcast("flash:new", true, message, scrollUp);
    };
    service.error = function(message, scrollUp) {
      return $rootScope.$broadcast("flash:new", false, message, scrollUp);
    };
    return service;
  };

  FlashMessagesDirective = function() {
    return {
      compile: function(element, attrs) {
        var template;
        template = "<div class=\"flash-message-success hidden\"><p class=\"msg\"></p></div>\n<div class=\"flash-message-fail hidden\"><p class=\"msg\"></p></div>";
        element.html(template);
        return this.link;
      },
      link: function(scope, elm, attrs) {
        var element;
        element = angular.element(elm);
        return scope.$on("flash:new", function(ctx, success, message, scrollUp) {
          if (success) {
            element.find(".flash-message-success p").text(message);
            element.find(".flash-message-success").fadeIn().delay(2000).fadeOut();
          } else {
            element.find(".flash-message-fail p").text(message);
            element.find(".flash-message-fail").fadeIn().delay(2000).fadeOut();
          }
          if (scrollUp == null) {
            scrollUp = true;
          }
          if (scrollUp) {
            return angular.element("html, body").animate({
              scrollTop: 0
            }, "slow");
          }
        });
      }
    };
  };

  module = angular.module('gmFlash', []);

  module.factory('$gmFlash', ["$rootScope", "$q", "$window", FlashMessagesProvider]);

  module.directive('gmFlashMessages', FlashMessagesDirective);

}).call(this);

(function() {
  var I18NextDirective, I18NextProvider, I18NextTranslateFilter, module;

  I18NextDirective = function($parse, $rootScope) {
    return {
      restrict: "A",
      link: function(scope, elm, attrs) {
        var evaluateTranslation, t;
        t = $rootScope.translate;
        evaluateTranslation = function() {
          var element, ns, value, _i, _len, _ref, _ref1, _results;
          element = angular.element(elm);
          _ref = attrs.i18next.split(",");
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            value = _ref[_i];
            if (value.indexOf(":") === -1) {
              _results.push(element.html(t(value)));
            } else {
              _ref1 = value.split(":"), ns = _ref1[0], value = _ref1[1];
              _results.push(element.attr(ns, t(value)));
            }
          }
          return _results;
        };
        evaluateTranslation();
        return $rootScope.$on("i18next:changeLang", function() {
          return evaluateTranslation();
        });
      }
    };
  };

  I18NextProvider = function($rootScope, $q) {
    var service;
    i18n.addPostProcessor("lodashTemplate", function(value, key, options) {
      var template;
      template = _.template(value);
      return template(options.scope);
    });
    service = {};
    service.defaultOptions = {
      postProcess: "lodashTemplate",
      fallbackLng: "en",
      useLocalStorage: false,
      localStorageExpirationTime: 60 * 60 * 24 * 1000,
      ns: 'app',
      resGetPath: 'locales/__lng__/__ns__.json',
      getAsync: false
    };
    service.setLang = function(lang) {
      var options;
      $rootScope.currentLang = lang;
      options = _.clone(service.defaultOptions, true);
      return i18n.setLng(lang, options, function() {
        return $rootScope.$broadcast("i18next:changeLang");
      });
    };
    service.getCurrentLang = function() {
      return $rootScope.currentLang;
    };
    service.translate = function(key, options) {
      return $rootScope.t(key, options);
    };
    service.t = service.translate;
    service.initialize = function(async, defaultLang) {
      var defer, onI18nextInit, options;
      if (async == null) {
        async = false;
      }
      if (defaultLang == null) {
        defaultLang = "en";
      }
      options = _.clone(service.defaultOptions, true);
      options.lng = $rootScope.currentLang = defaultLang;
      if (async) {
        options.getAsync = true;
        defer = $q.defer();
        onI18nextInit = function(t) {
          $rootScope.$apply(function() {
            $rootScope.translate = t;
            $rootScope.t = t;
            defer.resolve(t);
            return $rootScope.$broadcast("i18next:loadComplete", t);
          });
          return defer.promise;
        };
        return i18n.init(options, onI18nextInit);
      } else {
        i18n.init(options);
        $rootScope.translate = i18n.t;
        $rootScope.t = i18n.t;
        return $rootScope.$broadcast("i18next:loadComplete", i18n.t);
      }
    };
    return service;
  };

  I18NextTranslateFilter = function($i18next) {
    return function(key, options) {
      return $i18next.t(key, options);
    };
  };

  module = angular.module('i18next', []);

  module.factory("$i18next", ['$rootScope', '$q', I18NextProvider]);

  module.directive('i18next', ['$parse', '$rootScope', I18NextDirective]);

  module.filter('i18next', ['$i18next', I18NextTranslateFilter]);

}).call(this);

(function() {
  var CreateCallback, NgComaDirective, NgEnterDirective, NgSpaceDirective, module;

  CreateCallback = function(keypress) {
    var doDirective;
    doDirective = function(scope, element, attrs) {
      var onKeyPress;
      onKeyPress = function(event) {
        if (event.which === keypress) {
          scope.$apply(function() {
            return scope.$eval(attrs.ngEnter);
          });
          return event.preventDefault();
        }
      };
      return element.bind("keydown keypress", onKeyPress);
    };
    return doDirective;
  };

  NgEnterDirective = function() {
    return CreateCallback(13);
  };

  NgSpaceDirective = function() {
    return CreateCallback(32);
  };

  NgComaDirective = function() {
    return CreateCallback(188);
  };

  module = angular.module('mrKeypress', []);

  module.directive('ngEnter', NgEnterDirective);

  module.directive('ngSpace', NgSpaceDirective);

  module.directive('ngComa', NgComaDirective);

}).call(this);

(function() {
  var ModalRegisterDirective, ModalServiceFactory, module;

  ModalServiceFactory = function($rootScope, $q, $log) {
    var modals, service;
    modals = {};
    service = {};
    service.register = function(name, domId) {
      $log.debug("registering modal: " + name);
      return modals[name] = domId;
    };
    service.open = function(name, ctx) {
      var ctrl, defered, dom, scp;
      dom = angular.element("#" + modals[name]);
      $(dom.find('.modal')).css({
        'top': $(document).scrollTop() + 15
      });
      defered = $q.defer();
      ctrl = dom.controller();
      scp = dom.scope();
      ctrl.initialize(defered, ctx);
      return defered.promise;
    };
    service.close = function(name) {
      var ctrl, dom;
      dom = angular.element("#" + modals[name]);
      ctrl = dom.controller();
      return ctrl["delete"]();
    };
    return service;
  };

  ModalRegisterDirective = function($rootScope, $modal) {
    return function(scope, element, attrs) {
      var domId, name;
      name = attrs.gmModal;
      domId = _.uniqueId("gm-modal-");
      element.attr("id", domId);
      return $modal.register(name, domId);
    };
  };

  module = angular.module("gmModal", []);

  module.factory("$modal", ["$rootScope", "$q", "$log", ModalServiceFactory]);

  module.directive("gmModal", ["$rootScope", "$modal", ModalRegisterDirective]);

}).call(this);

(function() {
  var OverlayProvider, module;

  OverlayProvider = function($rootScope, $q, $log) {
    var OverlayService;
    OverlayService = (function() {
      function OverlayService() {
        this.el = angular.element("<div />", {
          "class": "overlay"
        });
        this.defered = $q.defer();
        _.bindAll(this);
      }

      OverlayService.prototype.close = function() {
        $log.debug("OverlayService.close");
        this.el.off();
        return this.el.remove();
      };

      OverlayService.prototype.open = function() {
        var body, self;
        $log.debug("OverlayService.open");
        self = this;
        this.el.on("click", function(event) {
          return $rootScope.$apply(function() {
            self.close();
            return self.defered.resolve();
          });
        });
        body = angular.element("body");
        body.append(this.el);
        return this.defered.promise;
      };

      return OverlayService;

    })();
    return function() {
      return new OverlayService();
    };
  };

  module = angular.module("gmOverlay", []);

  module.factory('$gmOverlay', ["$rootScope", "$q", "$log", OverlayProvider]);

}).call(this);

(function() {
  var StorageProvider, module;

  StorageProvider = function($rootScope) {
    var service;
    service = {};
    service.get = function(key, _default) {
      var serializedValue;
      serializedValue = localStorage.getItem(key);
      if (serializedValue === null) {
        return _default || null;
      }
      return JSON.parse(serializedValue);
    };
    service.set = function(key, val) {
      if (_.isObject(key)) {
        return _.each(key, function(val, key) {
          return service.set(key, val);
        });
      } else {
        return localStorage.setItem(key, JSON.stringify(val));
      }
    };
    service.remove = function(key) {
      return localStorage.removeItem(key);
    };
    service.clear = function() {
      return localStorage.clear();
    };
    return service;
  };

  module = angular.module('gmStorage', []);

  module.factory('$gmStorage', ['$rootScope', StorageProvider]);

}).call(this);

(function() {
  var UrlsProvider, format, module;

  format = function(fmt, obj) {
    obj = _.clone(obj);
    return fmt.replace(/%s/g, function(match) {
      return String(obj.shift());
    });
  };

  UrlsProvider = function() {
    var data, service, setHost, setUrls;
    data = {
      urls: {},
      host: {},
      scheme: {}
    };
    setHost = function(ns, host, scheme) {
      data.host[ns] = host;
      return data.scheme[ns] = scheme;
    };
    setUrls = function(ns, urls) {
      if (_.toArray(arguments).length !== 2) {
        throw Error("wrong arguments to setUrls");
      }
      data.urls[ns] = urls;
      return service[ns] = function() {
        var args, name, url;
        if (_.toArray(arguments).length < 1) {
          throw Error("wrong arguments");
        }
        args = _.toArray(arguments);
        name = args.slice(0, 1)[0];
        url = format(data.urls[ns][name], args.slice(1));
        if (data.host[ns]) {
          return format("%s://%s%s", [data.scheme[ns], data.host[ns], url]);
        }
        return url;
      };
    };
    service = {};
    service.data = data;
    service.setUrls = setUrls;
    service.setHost = setHost;
    this.setUrls = setUrls;
    this.setHost = setHost;
    this.$get = function() {
      return service;
    };
  };

  module = angular.module("gmUrls", []);

  module.provider('$gmUrls', UrlsProvider);

}).call(this);

(function() {
  var AuthProvider, module;

  AuthProvider = function($rootScope, $gmStorage, $model) {
    var service;
    service = {};
    service.getUser = function() {
      var userData;
      userData = $gmStorage.get('userInfo');
      if (userData) {
        $rootScope.$broadcast('i18n:change', userData.default_language);
        return $model.make_model("users", userData);
      }
      return null;
    };
    service.setUser = function(user) {
      $rootScope.$broadcast('i18n:change', user.default_language);
      return $gmStorage.set("userInfo", user.getAttrs());
    };
    return service;
  };

  module = angular.module('results.services.common', []);

  module.factory("$gmAuth", ["$rootScope", "$gmStorage", "$model", AuthProvider]);

}).call(this);

(function() {
  var ModelProvider, module,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  ModelProvider = function($q, $http, $gmUrls, $gmStorage) {
    var Model, headers, service;
    headers = function() {
      var token;
      token = $gmStorage.get('token');
      if (token) {
        return {
          "Authorization": "Token " + token
        };
      }
      return {};
    };
    Model = (function() {
      function Model(name, data, dataTypes) {
        this._attrs = data;
        this._name = name;
        this._dataTypes = dataTypes;
        this.setAttrs(data);
        this.initialize();
      }

      Model.prototype.applyCasts = function() {
        var attrName, castMethod, castName, _ref, _results;
        _ref = this._dataTypes;
        _results = [];
        for (attrName in _ref) {
          castName = _ref[attrName];
          castMethod = service.casts[castName];
          if (!castMethod) {
            continue;
          }
          _results.push(this._attrs[attrName] = castMethod(this._attrs[attrName]));
        }
        return _results;
      };

      Model.prototype.getIdAttrName = function() {
        return "id";
      };

      Model.prototype.getUrl = function() {
        return "" + ($gmUrls.api(this._name)) + "/" + (this.getAttrs()[this.getIdAttrName()]);
      };

      Model.prototype.getAttrs = function(patch) {
        if (patch == null) {
          patch = false;
        }
        if (patch) {
          return _.extend({}, this._modifiedAttrs);
        }
        return _.extend({}, this._attrs, this._modifiedAttrs);
      };

      Model.prototype.setAttrs = function(attrs) {
        this._attrs = attrs;
        this._modifiedAttrs = {};
        this.applyCasts();
        return this._isModified = false;
      };

      Model.prototype.setAttr = function(name, value) {
        this._modifiedAttrs[name] = value;
        return this._isModified = true;
      };

      Model.prototype.initialize = function() {
        var getter, self, setter;
        self = this;
        getter = function(name) {
          return function() {
            if (name.substr(0, 2) === "__") {
              return self[name];
            }
            if (__indexOf.call(_.keys(self._modifiedAttrs), name) < 0) {
              return self._attrs[name];
            }
            return self._modifiedAttrs[name];
          };
        };
        setter = function(name) {
          return function(value) {
            if (name.substr(0, 2) === "__") {
              self[name] = value;
              return;
            }
            if (self._attrs[name] !== value) {
              self._modifiedAttrs[name] = value;
              self._isModified = true;
            } else {
              delete self._modifiedAttrs[name];
            }
          };
        };
        return _.each(this._attrs, function(value, name) {
          var options;
          options = {
            get: getter(name),
            set: setter(name),
            enumerable: true,
            configurable: true
          };
          return Object.defineProperty(self, name, options);
        });
      };

      Model.prototype.serialize = function() {
        var data;
        data = {
          "data": _.clone(this._attrs),
          "name": this._name
        };
        return JSON.stringify(data);
      };

      Model.prototype.isModified = function() {
        return this._isModified;
      };

      Model.prototype.markSaved = function() {
        this._isModified = false;
        this._attrs = this.getAttrs();
        return this._modifiedAttrs = {};
      };

      Model.prototype.revert = function() {
        this._modifiedAttrs = {};
        return this._isModified = false;
      };

      Model.prototype.remove = function() {
        var defered, params, promise, self;
        defered = $q.defer();
        self = this;
        params = {
          method: "DELETE",
          url: this.getUrl(),
          headers: headers()
        };
        promise = $http(params);
        promise.success(function(data, status) {
          return defered.resolve(self);
        });
        promise.error(function(data, status) {
          return defered.reject(self);
        });
        return defered.promise;
      };

      Model.prototype.save = function(patch, extraParams) {
        var defered, params, promise, self;
        if (patch == null) {
          patch = false;
        }
        self = this;
        defered = $q.defer();
        if (!this.isModified() && patch) {
          defered.resolve(self);
          return defered.promise;
        }
        params = {
          url: this.getUrl(),
          headers: headers()
        };
        if (patch) {
          params.method = "PATCH";
        } else {
          params.method = "PUT";
        }
        params.data = JSON.stringify(this.getAttrs(patch));
        params = _.extend({}, params, extraParams);
        promise = $http(params);
        promise.success(function(data, status) {
          self._isModified = false;
          self._attrs = _.extend(self.getAttrs(), data);
          self._modifiedAttrs = {};
          self.applyCasts();
          return defered.resolve(self);
        });
        promise.error(function(data, status) {
          return defered.reject(data);
        });
        return defered.promise;
      };

      Model.prototype.refresh = function() {
        var defered, params, promise, self;
        defered = $q.defer();
        self = this;
        params = {
          method: "GET",
          url: this.getUrl(),
          headers: headers()
        };
        promise = $http(params);
        promise.success(function(data, status) {
          self._modifiedAttrs = {};
          self._attrs = data;
          self._isModified = false;
          self.applyCasts();
          return defered.resolve(self);
        });
        promise.error(function(data, status) {
          return defered.reject([data, status]);
        });
        return defered.promise;
      };

      Model.desSerialize = function(sdata) {
        var ddata, model;
        ddata = JSON.parse(sdata);
        model = new Model(ddata.url, ddata.data);
        return model;
      };

      return Model;

    })();
    service = {};
    service.make_model = function(name, data, cls, dataTypes) {
      if (cls == null) {
        cls = Model;
      }
      if (dataTypes == null) {
        dataTypes = {};
      }
      return new cls(name, data, dataTypes);
    };
    service.create = function(name, data, cls, dataTypes) {
      var defered, params, promise;
      if (cls == null) {
        cls = Model;
      }
      if (dataTypes == null) {
        dataTypes = {};
      }
      defered = $q.defer();
      params = {
        method: "POST",
        url: $gmUrls.api(name),
        headers: headers(),
        data: JSON.stringify(data)
      };
      promise = $http(params);
      promise.success(function(_data, _status) {
        return defered.resolve(service.make_model(name, _data, cls, dataTypes));
      });
      promise.error(function(data, status) {
        return defered.reject(data);
      });
      return defered.promise;
    };
    service.cls = Model;
    service.casts = {
      int: function(value) {
        return parseInt(value, 10);
      },
      float: function(value) {
        return parseFloat(value, 10);
      }
    };
    return service;
  };

  module = angular.module('results.services.model', []);

  module.factory('$model', ['$q', '$http', '$gmUrls', '$gmStorage', ModelProvider]);

}).call(this);

(function() {
  var ResourceProvider, module;

  ResourceProvider = function($http, $q, $gmStorage, $gmUrls, $model, config) {
    var headers, queryMany, queryManyPaginated, queryOne, queryRaw, service;
    service = {};
    headers = function(disablePagination) {
      var data, token;
      if (disablePagination == null) {
        disablePagination = true;
      }
      data = {};
      token = $gmStorage.get('token');
      if (token) {
        data["Authorization"] = "Token " + token;
      }
      if (disablePagination) {
        data["X-Disable-Pagination"] = "true";
      }
      return data;
    };
    queryMany = function(name, params, options, urlParams) {
      var defaultHttpParams, defered, httpParams, promise;
      defaultHttpParams = {
        method: "GET",
        headers: headers(),
        url: $gmUrls.api(name, urlParams)
      };
      if (!_.isEmpty(params)) {
        defaultHttpParams.params = params;
      }
      httpParams = _.extend({}, defaultHttpParams, options);
      defered = $q.defer();
      promise = $http(httpParams);
      promise.success(function(data, status) {
        var models;
        models = _.map(data, function(attrs) {
          return $model.make_model(name, attrs);
        });
        return defered.resolve(models);
      });
      promise.error(function(data, status) {
        return defered.reject(data, status);
      });
      return defered.promise;
    };
    queryRaw = function(name, id, params, options, cls) {
      var defaultHttpParams, defered, httpParams, promise;
      defaultHttpParams = {
        method: "GET",
        headers: headers()
      };
      if (id) {
        defaultHttpParams.url = "" + ($gmUrls.api(name)) + "/" + id;
      } else {
        defaultHttpParams.url = "" + ($gmUrls.api(name));
      }
      if (!_.isEmpty(params)) {
        defaultHttpParams.params = params;
      }
      httpParams = _.extend({}, defaultHttpParams, options);
      defered = $q.defer();
      promise = $http(httpParams);
      promise.success(function(data, status) {
        return defered.resolve(data, cls);
      });
      promise.error(function(data, status) {
        return defered.reject();
      });
      return defered.promise;
    };
    queryOne = function(name, id, params, options, cls) {
      var defaultHttpParams, defered, httpParams, promise;
      defaultHttpParams = {
        method: "GET",
        headers: headers()
      };
      if (id) {
        defaultHttpParams.url = "" + ($gmUrls.api(name)) + "/" + id;
      } else {
        defaultHttpParams.url = "" + ($gmUrls.api(name));
      }
      if (!_.isEmpty(params)) {
        defaultHttpParams.params = params;
      }
      httpParams = _.extend({}, defaultHttpParams, options);
      defered = $q.defer();
      promise = $http(httpParams);
      promise.success(function(data, status) {
        return defered.resolve($model.make_model(name, data, cls));
      });
      promise.error(function(data, status) {
        return defered.reject();
      });
      return defered.promise;
    };
    queryManyPaginated = function(name, params, options, cls, urlParams) {
      var defaultHttpParams, defered, httpParams, promise;
      defaultHttpParams = {
        method: "GET",
        headers: headers(false),
        url: $gmUrls.api(name, urlParams)
      };
      if (!_.isEmpty(params)) {
        defaultHttpParams.params = params;
      }
      httpParams = _.extend({}, defaultHttpParams, options);
      defered = $q.defer();
      promise = $http(httpParams);
      promise.success(function(data, status, headersFn) {
        var currentHeaders, result;
        currentHeaders = headersFn();
        result = {};
        result.models = _.map(data, function(attrs) {
          return $model.make_model(name, attrs, cls);
        });
        result.count = parseInt(currentHeaders["x-pagination-count"], 10);
        result.current = parseInt(currentHeaders["x-pagination-current"] || 1, 10);
        result.paginatedBy = parseInt(currentHeaders["x-paginated-by"], 10);
        return defered.resolve(result);
      });
      promise.error(function(data, status) {
        return defered.reject();
      });
      return defered.promise;
    };
    service.register = function(username, email, password) {
      var defered, onError, onSuccess, postData, promise;
      defered = $q.defer();
      onSuccess = function(data, status) {
        var user;
        $gmStorage.set("token", data["auth_token"]);
        user = $model.make_model("users", data);
        return defered.resolve(user);
      };
      onError = function(data, status) {
        return defered.reject(data);
      };
      postData = {
        "username": username,
        "email": email,
        "password": password
      };
      promise = $http({
        method: 'POST',
        url: $gmUrls.api('signup'),
        data: JSON.stringify(postData)
      });
      promise.success(onSuccess);
      promise.error(onError);
      return defered.promise;
    };
    service.login = function(username, password) {
      var defered, onError, onSuccess, postData;
      defered = $q.defer();
      onSuccess = function(data, status) {
        var user;
        $gmStorage.set("token", data["token"]);
        $gmStorage.set("uid", data["id"]);
        user = $model.make_model("users", data);
        return defered.resolve(user);
      };
      onError = function(data, status) {
        return defered.reject(data);
      };
      postData = {
        "username": username,
        "password": password
      };
      $http({
        method: 'POST',
        url: $gmUrls.api('login'),
        data: JSON.stringify(postData)
      }).success(onSuccess).error(onError);
      return defered.promise;
    };
    service.getUser = function(userId) {
      return queryOne('users', userId);
    };
    service.getUsers = function() {
      return queryMany('users');
    };
    service.createWin = function(data) {
      return $model.create("wins", data);
    };
    service.getWins = function(weekly, year, month, day) {
      var params;
      if (weekly == null) {
        weekly = false;
      }
      if (year == null) {
        year = 0;
      }
      if (month == null) {
        month = 0;
      }
      if (day == null) {
        day = 0;
      }
      params = {
        year: year,
        month: month,
        day: day,
        weekly: weekly
      };
      return queryMany('wins', params);
    };
    service.getWin = function(winId) {
      return queryOne("wins", winId);
    };
    service.getGoals = function(weekly, year, month, day) {
      var params;
      if (weekly == null) {
        weekly = false;
      }
      if (year == null) {
        year = 0;
      }
      if (month == null) {
        month = 0;
      }
      if (day == null) {
        day = 0;
      }
      params = {
        year: year,
        month: month,
        day: day,
        weekly: weekly
      };
      return queryMany('goals', params);
    };
    service.createGoal = function(data) {
      return $model.create("goals", data);
    };
    service.getGoal = function(goalId) {
      return queryOne("goals", goalId);
    };
    service.postWin = function(data, weekly) {
      if (weekly == null) {
        weekly = false;
      }
      data.weekly = weekly;
      return $http({
        method: 'POST',
        headers: headers(false),
        url: "" + ($gmUrls.api("wins")),
        data: JSON.stringify(data)
      });
    };
    service.postGoal = function(data, weekly) {
      if (weekly == null) {
        weekly = false;
      }
      data.weekly = weekly;
      return $http({
        method: 'POST',
        headers: headers(false),
        url: "" + ($gmUrls.api("goals")),
        data: JSON.stringify(data)
      });
    };
    return service;
  };

  module = angular.module('results.services.resource', ['results.config']);

  module.factory('resource', ['$http', '$q', '$gmStorage', '$gmUrls', '$model', 'config', ResourceProvider]);

}).call(this);
