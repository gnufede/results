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

WinListController = ($scope, $rootScope, resource) ->
    $scope.addWin = ()->
        cb = resource.postWin($scope.win)
        cb.then (response)->
            new_win = $model.make_model("wins",response.data)
            $rootScope.winList.push(new_win)
        $scope.win = {}
        return

    $scope.deleteWin = (win) ->
        win.remove().then ->
                $location.url("/")

    $scope.addWeeklyWin = ()->
        cb = resource.postWeeklyWin($scope.weeklyWin)
        cb.then (response)->
            $rootScope.weeklyWinList.push(response.data)
        $scope.weeklyWin = {}
        return

    $scope.weeklyWin = {}
    $scope.win = {}
    return

GoalListController = ($scope, $rootScope, $location, $model, resource) ->
    $scope.addGoal = ()->
        cb = resource.postGoal($scope.goal)
        cb.then (response)->
            new_goal = $model.make_model("goals",response.data)
            $rootScope.goalList.push(new_goal)
        $scope.goal = {}
        return

    $scope.deleteGoal = (goal) ->
        goal.remove().then ->
                $location.url("/")

    $scope.addWeeklyGoal = ()->
        cb = resource.postWeeklyGoal($scope.weeklyGoal)
        cb.then (response)->
            $rootScope.weeklyGoalList.push(response.data)
        $scope.weeklyGoal = {}
        return

    $scope.goal = {}
    $scope.weeklyGoal = {}
    return

ContainerController = ($scope, $rootScope, resource) ->
    resource.getWeeklyGoals().then (result) ->
        $rootScope.weeklyGoalList = result
    resource.getWeeklyWins().then (result) ->
        $rootScope.weeklyWinList = result
    resource.getGoals().then (result) ->
        $rootScope.goalList = result
    resource.getWins().then (result) ->
        $rootScope.winList = result
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
            $gmAuth.setUser(user)
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
module.controller("GoalListController", ["$scope","$rootScope", "$location", "$model", "resource", GoalListController])
module.controller("WinListController", ["$scope","$rootScope", "resource", WinListController])
