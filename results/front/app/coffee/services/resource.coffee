# Copyright 2013 Andrey Antukh <niwi@niwi.be>
#
# Licensed under the Apache License, Version 2.0 (the "License")
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

ResourceProvider = ($http, $q, $gmStorage, $gmUrls, $model, config) ->
    service = {}
    headers = (disablePagination=true) ->
        data = {}
        token = $gmStorage.get('token')

        data["Authorization"] = "Token #{token}" if token
        data["X-Disable-Pagination"] = "true" if disablePagination

        return data

    queryMany = (name, params, options, urlParams) ->
        defaultHttpParams = {
            method: "GET",
            headers:  headers(),
            url: $gmUrls.api(name, urlParams)
        }
        if not _.isEmpty(params)
            defaultHttpParams.params = params

        httpParams = _.extend({}, defaultHttpParams, options)
        defered = $q.defer()

        promise = $http(httpParams)
        promise.success (data, status) ->
            models = _.map data, (attrs) -> $model.make_model(name, attrs)
            defered.resolve(models)

        promise.error (data, status) ->
            defered.reject(data, status)

        return defered.promise

    queryRaw = (name, id, params, options, cls) ->
        defaultHttpParams = {method: "GET", headers:  headers()}

        if id
            defaultHttpParams.url = "#{$gmUrls.api(name)}/#{id}"
        else
            defaultHttpParams.url = "#{$gmUrls.api(name)}"

        if not _.isEmpty(params)
            defaultHttpParams.params = params

        httpParams =  _.extend({}, defaultHttpParams, options)

        defered = $q.defer()

        promise = $http(httpParams)
        promise.success (data, status) ->
            defered.resolve(data, cls)

        promise.error (data, status) ->
            defered.reject()

        return defered.promise

    queryOne = (name, id, params, options, cls) ->
        defaultHttpParams = {method: "GET", headers:  headers()}

        if id
            defaultHttpParams.url = "#{$gmUrls.api(name)}/#{id}"
        else
            defaultHttpParams.url = "#{$gmUrls.api(name)}"

        if not _.isEmpty(params)
            defaultHttpParams.params = params

        httpParams =  _.extend({}, defaultHttpParams, options)

        defered = $q.defer()

        promise = $http(httpParams)
        promise.success (data, status) ->
            defered.resolve($model.make_model(name, data, cls))

        promise.error (data, status) ->
            defered.reject()

        return defered.promise

    queryManyPaginated = (name, params, options, cls, urlParams) ->
        defaultHttpParams = {
            method: "GET",
            headers: headers(false),
            url: $gmUrls.api(name, urlParams)
        }
        if not _.isEmpty(params)
            defaultHttpParams.params = params

        httpParams =  _.extend({}, defaultHttpParams, options)
        defered = $q.defer()

        promise = $http(httpParams)
        promise.success (data, status, headersFn) ->
            currentHeaders = headersFn()

            result = {}
            result.models = _.map(data, (attrs) -> $model.make_model(name, attrs, cls))
            result.count = parseInt(currentHeaders["x-pagination-count"], 10)
            result.current = parseInt(currentHeaders["x-pagination-current"] or 1, 10)
            result.paginatedBy = parseInt(currentHeaders["x-paginated-by"], 10)

            defered.resolve(result)

        promise.error (data, status) ->
            defered.reject()

        return defered.promise

    # Resource Methods
    service.register = (username, email, password) ->
        defered = $q.defer()

        onSuccess = (data, status) ->
            $gmStorage.set("token", data["auth_token"])
            user = $model.make_model("users", data)
            defered.resolve(user)

        onError = (data, status) ->
            defered.reject(data)

        postData =
            "username": username
            "email": email
            "password": password
            
        promise = $http({method:'POST', url: $gmUrls.api('signup'), data: JSON.stringify(postData)})
        promise.success(onSuccess)
        promise.error(onError)

        return defered.promise

    # Login request
    service.login = (username, password) ->
        defered = $q.defer()

        onSuccess = (data, status) ->
            $gmStorage.set("token", data["token"])
            $gmStorage.set("uid", data["id"])
            user = $model.make_model("users", data)
            defered.resolve(user)

        onError = (data, status) ->
            defered.reject(data)

        postData =
            "username": username
            "password": password

        $http({method:'POST', url: $gmUrls.api('login'), data: JSON.stringify(postData)})
            .success(onSuccess)
            .error(onError)

        return defered.promise


    # Get a user info
    service.getUser = (userId) -> queryOne('users', userId)

    # Get users list
    service.getUsers = -> queryMany('users')

    # Create a win
    service.createWin = (data) ->
        return $model.create("wins", data)

    # Get a win list
    service.getWins = (weekly=false, year=0, month=0, day=0)-> 
        params = {year:year, month:month, day:day, weekly:weekly}
        queryMany('wins',params)

    # Get a win
    service.getWin = (winId) ->
        return queryOne("wins", winId)

    # Get a goal list
    service.getGoals = (weekly=false, year=0, month=0, day=0)-> 
        params = {year:year, month:month, day:day, weekly:weekly}
        queryMany('goals', params)

    # Create a goal
    service.createGoal = (data) ->
        return $model.create("goals", data)
    
    # Get a goal
    service.getGoal = (goalId) ->
        return queryOne("goals", goalId)

    service.postWin = (data, weekly=false)->
        data.weekly = weekly
        return $http(
            method:'POST'
            headers: headers(false),
            url: "#{$gmUrls.api("wins")}"
            data: JSON.stringify(data)
        )

    service.updateGoal = (data)->
        data.weekly = weekly
        return $http(
            method:'PUT'
            headers: headers(false),
            url: "#{$gmUrls.api("goals")}"
            data: JSON.stringify(data)
        )

    service.postGoal = (data, weekly=false)->
        data.weekly = weekly
        return $http(
            method:'POST'
            headers: headers(false),
            url: "#{$gmUrls.api("goals")}"
            data: JSON.stringify(data)
        )

    return service

module = angular.module('results.services.resource', ['results.config'])
module.factory('resource', ['$http', '$q', '$gmStorage', '$gmUrls', '$model', 'config', ResourceProvider])
