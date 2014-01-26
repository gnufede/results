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

WinListController = ($scope, $rootScope, $location, $model, resource) ->
    $scope.addWin = (weekly=false)->
        cb = resource.postWin($scope.win, weekly)
        cb.then (response)->
            new_win = $model.make_model("wins",response.data)
            if weekly
                $rootScope.weeklyWinList.push(new_win)
            else
                $rootScope.winList.push(new_win)
        $scope.win = {}
        return

    $scope.deleteWin = (win) ->
        win.remove().then ->
                $location.url("/")


    $scope.weeklyWin = {}
    $scope.win = {}
    return

GoalListController = ($scope, $rootScope, $location, $model, resource) ->
    $scope.addGoal = (weekly=false)->
        cb = resource.postGoal($scope.goal, weekly)
        cb.then (response)->
            new_goal = $model.make_model("goals",response.data)
            if weekly
                $rootScope.weeklyGoalList.push(new_goal)
            else
                $rootScope.goalList.push(new_goal)
        $scope.goal = {}
        return

    $scope.deleteGoal = (goal) ->
        goal.remove().then ->
                $location.url("/")

    $scope.goal = {}
    $scope.weeklyGoal = {}
    return

ContainerController = ($scope, $rootScope, $routeParams, resource) ->
    year =  $routeParams.year or 0;
    month = $routeParams.month or 0;
    day = $routeParams.day or 0;

    resource.getGoals(weekly=true, year=year, month=month, day=day).then (result) ->
        $rootScope.weeklyGoalList = result
    resource.getWins(weekly=true, year=year, month=month, day=day).then (result) ->
        $rootScope.weeklyWinList = result
    resource.getGoals(weekly=false, year=year, month=month, day=day).then (result) ->
        $rootScope.goalList = result
    resource.getWins(weekly=false, year=year, month=month, day=day).then (result) ->
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
module.controller("ContainerController", ["$scope", "$rootScope", "$routeParams", "resource", ContainerController])
module.controller("TooltipController", ["$scope", "$document", TooltipController])
module.controller("LoginController", ["$scope","$rootScope", "$location", "$routeParams", "resource", "$gmAuth", LoginController])
module.controller("UserListController", ["$scope","$rootScope", "resource", UserListController])
module.controller("GoalListController", ["$scope","$rootScope", "$location", "$model", "resource", GoalListController])
module.controller("WinListController", ["$scope","$rootScope", "$location", "$model", "resource", WinListController])
