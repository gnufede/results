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

    # Modules
    "mrKeypress",

    # Greenmine Plugins
    "gmUrls",
    "gmFlash",
    "gmModal",
    "gmStorage",
    "gmConfirm",
    "gmOverlay",
    "i18next"
]

configCallback = ($routeProvider, $locationProvider, $httpProvider, $provide, $compileProvider, $gmUrlsProvider, $sceDelegateProvider)->
    # Activate HTML 5 routing without hash symbol
    # $locationProvider.html5Mode(true)

    $routeProvider.when('/',
        {templateUrl: '/static/views/container.html', controller: "ContainerController"})

    $routeProvider.when('/users/:userId',
        {templateUrl: '/static/views/container.html', controller: "UserListController"})

    $routeProvider.when('/goals/:goalId',
        {templateUrl: '/static/views/container.html', controller: "GoalController"})

    $routeProvider.when('/wins/:winId',
        {templateUrl: '/static/views/container.html', controller: "WinController"})

    $routeProvider.when('/login',
        {templateUrl: '/static/views/login.html', controller:"LoginController"})

    apiUrls = {
        "root": "/"
        "login": "/api-token-auth/"
        "logout": "/auth/logout"
        "weeklywins": "/wins/weekly/"
        "weeklygoals": "/goals/weekly/"
        "wins": "/wins/"
        "goals": "/goals/"
        "users": "/users"
    }

    $gmUrlsProvider.setUrls("api", apiUrls)

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
