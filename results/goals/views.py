from django.shortcuts import render

# Create your views here.
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.renderers import JSONRenderer
from rest_framework.parsers import JSONParser
from goals.models import Category, Goal, Win
from goals.serializers import CategorySerializer, GoalSerializer, WinSerializer
from django.contrib.auth.models import User

from datetime import date

class JSONResponse(HttpResponse):
    """
    An HttpResponse that renders its content into JSON.
    """
    def __init__(self, data, **kwargs):
        content = JSONRenderer().render(data)
        kwargs['content_type'] = 'application/json'
        super(JSONResponse, self).__init__(content, **kwargs)


@csrf_exempt
def category_list(request):
    """
    List all categories, or create a new category.
    """
    if request.method == 'GET':
        categories = Category.objects.filter(owner=request.user)
        serializer = CategorySerializer(categories, many=True)
        return JSONResponse(serializer.data)

    elif request.method == 'POST':
        data = JSONParser().parse(request)
        data['owner'] = request.user.id
        serializer = CategorySerializer(data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return JSONResponse(serializer.data, status=201)
        return JSONResponse(serializer.errors, status=400)

@csrf_exempt
def win_list(request, weekly=False):
    """
    List current wins.
    """
    if request.method == 'GET':
        user = request.user.id
        wins = Win.getWins(user=user, weekly=weekly)
        serializer = WinSerializer(wins, many=True)
        return JSONResponse(serializer.data)


@csrf_exempt
def win_tag(request):
    """
    Tag win.
    """
    if request.method == 'POST':
        data = JSONParser().parse(request)
        win = Win.objects.get(pk=int(data['win']))
        category = Category.objects.get(pk=int(data['category']))
        if win.owner.id == request.user.id == category.owner.id:
            win.tags.add(category)
            win.save()
            serializer = WinSerializer(win, many=False)
            return JSONResponse(serializer.data, status=201)
        return JSONResponse(win.errors, status=400)


@csrf_exempt
def win_new(request):
    """
    New or update win.
    """
    if request.method in ('POST', 'PUT'):
        data = JSONParser().parse(request)
        data['owner'] = request.user.id
        if 'id' in data:
            win = Win.objects.get(pk=data['id'])
            if win.owner.id != request.user.id:
                return JSONResponse(serializer.errors, status=502)
                #return forbidden!
            else:
                serializer = WinSerializer(win, data=data, partial=True)
        else:
            data['date'] = date.today().isoformat()
            serializer = WinSerializer(data=data, partial=True)
        if serializer and serializer.is_valid():
            serializer.save()
            return JSONResponse(serializer.data, status=201)
        return JSONResponse(serializer.errors, status=400)


@csrf_exempt
def goal_list(request, weekly=False):
    """
    List current goals.
    """
    if request.method == 'GET':
        user = request.user.id
        goals = Goal.getGoals(user=user, weekly=weekly)
        serializer = GoalSerializer(goals, many=True)
        return JSONResponse(serializer.data)


@csrf_exempt
def goal_new(request):
    """
    New goal or update.
    """
    if request.method in ('POST', 'PUT'):
        data = JSONParser().parse(request)
        data['owner'] = request.user.id
        if 'id' in data:
            goal = Goal.objects.get(pk=data['id'])
            if goal.owner.id != request.user.id:
                return JSONResponse(serializer.errors, status=502)
                #return forbidden!
            else:
                serializer = GoalSerializer(goal, data=data, partial=True)
        else:
            data['date'] = date.today().isoformat()
            serializer = GoalSerializer(data=data, partial=True)
        if serializer and serializer.is_valid():
            serializer.save()
            return JSONResponse(serializer.data, status=201)
        return JSONResponse(serializer.errors, status=400)

@csrf_exempt
def goal_tag(request):
    """
    Tag goal.
    """
    if request.method == 'POST':
        data = JSONParser().parse(request)
        goal = Goal.objects.get(pk=int(data['goal']))
        category = Category.objects.get(pk=int(data['category']))
        if goal.owner.id == request.user.id == category.owner.id:
            goal.tags.add(category)
            goal.save()
            serializer = GoalSerializer(goal, many=False)
            return JSONResponse(serializer.data, status=201)
        return JSONResponse(goal.errors, status=400)

