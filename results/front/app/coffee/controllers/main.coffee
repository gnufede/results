MainController = ($scope, resource, $timeout, $routeParams, $location) ->
    onUserSuccess = (result) ->
        $scope.user = result

    onUserError = (result)->
        $location.url("/login")

    resource.getUser("me").then(onUserSuccess, onUserError)

    $scope.addWinButton = ()->
        $scope.showWinDialog = true

    $scope.closeWinButton = ()->
        $scope.showWinDialog = false

    $scope.addGoalButton = ()->
        $scope.showGoalDialog = true

    $scope.closeGoalButton = ()->
        $scope.showGoalDialog = false

    $scope.$on("new-Win", (data)->
        $scope.showWinDialog = false
    )

    $scope.isFlashWarnVisible = false
    $scope.isFlashErrorVisible = false
    $scope.isFlashSuccessVisible = false

    $scope.$on("flash", (event, data)->
        $scope.isFlashWarnVisible = true if data.type == "warn"
        $scope.isFlashErrorVisible = true if data.type == "error"
        $scope.isFlashSuccessVisible = true if data.type == "success"
        $scope.flashMessage = data.message

        hideFlash = ()->
            $scope.isFlashWarnVisible = false
            $scope.isFlashErrorVisible = false
            $scope.isFlashSuccessVisible = false

        $timeout(hideFlash, 2000)
    )

    $scope.isGoalPlaceHolderVisible = false
    $scope.isWelcomeVisible = false
    return

GoalListController = ($scope, $rootScope, resource) ->
    $scope.addGoal = ()->
        cb = resource.postGoal($scope.goal)
        cb.then (response)->
            $rootScope.goalList.push(response.data)
        $scope.goal = {}
        return

    $scope.goal = {}
    return

ContainerController = ($scope, $rootScope, resource) ->
    $scope.WinName = "First Win"
    resource.getGoals().then (result) ->
        $rootScope.goalList = []
        for goal in result._attrs
            $rootScope.goalList.push(goal)

    return

LoginController = ($scope, $rootScope, $location, $routeParams, resource, $gmAuth) ->
    $rootScope.pageTitle = 'Login'
    $rootScope.pageSection = 'login'

    $scope.form = {}
    $scope.submit = ->
        username = $scope.form.username
        password = $scope.form.password

        $scope.loading = true

        onSuccess = (user) ->
            $gmAuth.setUser(userGoal)
            $rootScope.auth = user
            $location.url("/")

        onError = (data) ->
            $scope.error = true
            $scope.errorMessage = data.detail

        promise = resource.login(username, password)
        promise = promise.then(onSuccess, onError)
        promise.then ->
            $scope.loading = false

    return

UserListController = ($scope, $rootScope, resource) ->
    $scope.user = {}

    return


TooltipController = ($scope, $document)->
    $scope.isTooltipVisible = false
    $scope.showTooltip = ()->
        $scope.isTooltipVisible = !$scope.isTooltipVisible

    $scope.hideTooltip = ()->
        $scope.isTooltipVisible = false


module = angular.module("results.controllers.main", [])
module.controller("MainController", ["$scope","resource", "$timeout", "$routeParams", "$location", MainController])
module.controller("ContainerController", ["$scope", "$rootScope", "resource", ContainerController])
module.controller("TooltipController", ["$scope", "$document", TooltipController])
module.controller("LoginController", ["$scope","$rootScope", "$location", "$routeParams", "resource", "$gmAuth", LoginController])
module.controller("UserListController", ["$scope","$rootScope", "resource", UserListController])
module.controller("GoalListController", ["$scope","$rootScope", "resource", GoalListController])
