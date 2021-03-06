@results = {}
results = @results

modules = [
    # Angular addons
    "ngRoute",
#    "ngAnimate",
    "ngSanitize",

    # Controller
    "results.controllers.main",

    # Services
    "results.services.resource",
    "results.services.common",
    "results.services.model",
    # Directives
#    "results.directives.calendar",

    # Modules
    "mrKeypress",

    # Greenmine Plugins
    "gmUrls",
    "gmFlash",
    "gmModal",
    "gmStorage",
    "gmConfirm",
    "gmOverlay",
    "i18next",
    "ui.bootstrap",
]

configCallback = ($routeProvider, $locationProvider, $httpProvider, $provide, $compileProvider, $gmUrlsProvider, $sceDelegateProvider)->
    # Activate HTML 5 routing without hash symbol
    # $locationProvider.html5Mode(true)

    $routeProvider.when('/',
        {templateUrl: '/static/views/container.html', controller: "MainController"})

    $routeProvider.when('/:year/:month/:day',
        {templateUrl: '/static/views/container.html', controller: "MainController"})

    $routeProvider.when('/users/:userId',
        {templateUrl: '/static/views/container.html', controller: "UserListController"})

    $routeProvider.when('/goals/:goalId',
        {templateUrl: '/static/views/container.html', controller: "GoalController"})

    $routeProvider.when('/wins/:winId',
        {templateUrl: '/static/views/container.html', controller: "WinListController"})

    $routeProvider.when('/login',
        {templateUrl: '/static/views/login.html', controller:"LoginController"})

    $routeProvider.when('/signup',
        {templateUrl: '/static/views/signup.html', controller:"PublicRegisterController"})

    $routeProvider.otherwise({redirectTo: '/login'})

    apiUrls = {
        "root": "/"
        "login": "/api-token-auth/"
        "signup": "/api-token-register/"
        "logout": "/auth/logout"
#        "weeklywins": "/wins/weekly"
#        "weeklygoals": "/goals/weekly"
        "wins": "/wins"
        "goals": "/goals"
        "users": "/users"
    }

    $gmUrlsProvider.setUrls("api", apiUrls)

    defaultHeaders = {
        "Content-Type": "application/json"
        "Accept-Language": "en"
        "X-Host": window.location.hostname
    }

    #$httpProvider.defaults.cache = true;

    $httpProvider.defaults.headers.delete = defaultHeaders
    $httpProvider.defaults.headers.post = defaultHeaders
    $httpProvider.defaults.headers.put = defaultHeaders
    $httpProvider.defaults.headers.get = {
        "X-Host": window.location.hostname
    }

    authHttpIntercept = ($q, $location) ->
        return (promise) ->
            return promise.then null, (response) ->
                if response.status == 401 or response.status == 0
                    $location.url("/login?next=#{$location.path()}")
                return $q.reject(response)

    $provide.factory("authHttpIntercept", ["$q", "$location", authHttpIntercept])
    $httpProvider.responseInterceptors.push('authHttpIntercept')

    $sceDelegateProvider.resourceUrlWhitelist(['self', 'http://localhost:8000/**'])

    return

init = ($rootScope, $gmStorage, $gmAuth, $gmUrls, $location, config)->
    $rootScope.auth = $gmAuth.getUser()
    $gmUrls.setHost("api", config.host,config.scheme)

    $rootScope.logout = () ->
        $gmStorage.clear()
        $location.url("/login")

    return

module = angular.module('results', modules)
module.config(['$routeProvider', '$locationProvider', '$httpProvider', '$provide', '$compileProvider', '$gmUrlsProvider', '$sceDelegateProvider', configCallback])
module.run(["$rootScope","$gmStorage", "$gmAuth", "$gmUrls", "$location", 'config', init])

angular.module('results.config', []).value('config', {
    host: "localhost:8000"
    scheme: "http"
    defaultLanguage: "en"
    debug: false
})
