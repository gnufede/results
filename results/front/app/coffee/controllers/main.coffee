MainController = ($scope, $rootScope, resource, $timeout, $routeParams, $location) ->
    onUserSuccess = (result) ->
        $scope.user = result
        if $routeParams.year
            $scope.getGoalsAndWins()

    onUserError = (result)->
        $location.url("/login")

    resource.getUser("me").then(onUserSuccess, onUserError)
        
    $rootScope.year =  $routeParams.year or 0
    $rootScope.month = $routeParams.month or 0
    $rootScope.day = $routeParams.day or 0

    $scope.$watch('dt', () ->
        if $scope.dt
            $rootScope.year =  $scope.dt.getFullYear()
            $rootScope.month = $scope.dt.getMonth()+1
            $rootScope.day = $scope.dt.getDate()
            $location.url("/"+$rootScope.year+'/'+$rootScope.month+'/'+$rootScope.day)
        return
    )

    $scope.getGoalsAndWins = () ->
        resource.getGoals(weekly=true, year=$rootScope.year, month=$rootScope.month, day=$rootScope.day).then (result) ->
            $rootScope.weeklyGoalList = result
        resource.getWins(weekly=true, year=$rootScope.year, month=$rootScope.month, day=$rootScope.day).then (result) ->
            $rootScope.weeklyWinList = result
        resource.getGoals(weekly=false, year=$rootScope.year, month=$rootScope.month, day=$rootScope.day).then (result) ->
            $rootScope.goalList = result
        resource.getWins(weekly=false, year=$rootScope.year, month=$rootScope.month, day=$rootScope.day).then (result) ->
            $rootScope.winList = result
        return


    $scope.addWinButton = ()->
        $scope.showWinDialog = true

    $scope.closeWinButton = ()->
        $scope.showWinDialog = false

    $scope.addGoalButton = ()->
        $scope.showGoalDialog = true

    $scope.closeGoalButton = ()->
        $scope.showGoalDialog = false

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

    $scope.today = () ->
        $scope.dt = new Date()
        return

    if $rootScope.year==0
        $scope.today();
    else
        $scope.dt = new Date($rootScope.year+'-'+$rootScope.month+'-'+$rootScope.day)

    $scope.startingDay = 1
    $scope.showWeeks = false
    $scope.toggleWeeks =  () ->
        $scope.showWeeks = ! $scope.showWeeks
        return
    $scope.clear =  () ->
        $scope.dt = null
        return
#    $scope.disabled = (date, mode) -> 
#        ( mode == 'day' && ( date.getDay() == 0 || date.getDay() == 6 ) )
    $scope.open = ($event) ->
        $event.preventDefault()
        $event.stopPropagation()
        return
    $scope.opened = true

    $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'shortDate']
    $scope.format = $scope.formats[1]
    return

GoalController = ($scope, $rootScope, $location, $routeParams, $model, $modal, resource) ->
    $scope.goal = resource.getGoal($routeParams.goalId)
    $scope.showGoalDialog = true

    $scope.updateGoal = (goal) ->
        resource.updateGoal(goal).then ->
            $scope.showGoalDialog = false
        return

    $scope.open = () ->
        modalInstance = $modal.open(
            templateUrl: 'myModalContent.html'
            controller: 'GoalController'
        )


WinListController = ($scope, $rootScope, $location, $model, resource) ->
    $scope.addWin = (weekly=false)->
        $scope.win.date = $rootScope.year+'-'+$rootScope.month+'-'+$rootScope.day
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
                $scope.getGoalsAndWins()

    $scope.weeklyWin = {}
    $scope.win = {}
    return

GoalListController = ($scope, $rootScope, $location, $model, resource) ->
    $scope.addGoal = (weekly=false)->
        $scope.goal.date = $rootScope.year+'-'+$rootScope.month+'-'+$rootScope.day
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
                $scope.getGoalsAndWins()
                #$location.url("/")

    $scope.goal = {}
    $scope.weeklyGoal = {}
    return

PublicRegisterController = ($scope, $rootScope, $location, resource, $gmAuth) ->
    $rootScope.pageTitle = 'Signup'
    $rootScope.pageSection = 'signup'
    $scope.form = {"type": "public"}

    $scope.$watch "site.data.public_register", (value) ->
        if value == false
            $location.url("/login")

    $scope.submit = ->
        username = $scope.form.username
        email = $scope.form.email
        password = $scope.form.password

        $scope.loading = true

        onSuccess = (user) ->
            $location.url("/login")

        onError = (data) ->
            $scope.error = true
            $scope.errorMessage = data.detail

        promise = resource.register(username, email, password)
        promise = promise.then(onSuccess, onError)

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


TooltipController = ($scope, $document)->
    $scope.isTooltipVisible = false
    $scope.showTooltip = ()->
        $scope.isTooltipVisible = !$scope.isTooltipVisible

    $scope.hideTooltip = ()->
        $scope.isTooltipVisible = false


module = angular.module("results.controllers.main", [])
#module.controller("DateCtrl", ["$scope", "$rootScope", "$routeParams", "$location", "resource", DateCtrl])
module.controller("MainController", ["$scope", "$rootScope","resource", "$timeout", "$routeParams", "$location", MainController])
#module.controller("ContainerController", ["$scope", "$rootScope", "$routeParams", "resource", ContainerController])
module.controller("TooltipController", ["$scope", "$document", TooltipController])
module.controller("LoginController", ["$scope","$rootScope", "$location", "$routeParams", "resource", "$gmAuth", LoginController])
module.controller("GoalController", ["$scope","$rootScope","$location", "$routeParams", "$model", "resource", GoalController]) 
module.controller("GoalListController", ["$scope","$rootScope", "$location", "$model", "resource", GoalListController])
module.controller("WinListController", ["$scope","$rootScope", "$location", "$model", "resource", WinListController])
module.controller("PublicRegisterController", ["$scope", "$rootScope", "$location", "resource", "$gmAuth", PublicRegisterController])
