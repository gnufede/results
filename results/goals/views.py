from django.shortcuts import render

# Create your views here.
from django.http import HttpResponse
from rest_framework import status
from rest_framework.renderers import JSONRenderer
from rest_framework.parsers import JSONParser
from goals.models import Category, Goal, Win
from goals.serializers import CategorySerializer, GoalSerializer,\
        WinSerializer, UserSerializer
from django.contrib.auth.models import User

from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from rest_framework.decorators import api_view, authentication_classes,\
            permission_classes

from datetime import date

class JSONResponse(HttpResponse):
    """
    An HttpResponse that renders its content into JSON.
    """
    def __init__(self, data, **kwargs):
        content = JSONRenderer().render(data)
        kwargs['content_type'] = 'application/json'
        super(JSONResponse, self).__init__(content, **kwargs)

@api_view(['GET'])
@authentication_classes((TokenAuthentication,))
@permission_classes((IsAuthenticated,))
def myself(request):
    user_info = User.objects.get(pk=request.user.id)
    user_serializer = UserSerializer(user_info, many=False)
    return JSONResponse(user_serializer.data)

@api_view(['GET', 'POST'])
@authentication_classes((TokenAuthentication,))
@permission_classes((IsAuthenticated,))
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

@api_view(['GET'])
@authentication_classes((TokenAuthentication,))
@permission_classes((IsAuthenticated,))
def win_list(request, weekly=False):
    """
    List current wins.
    """
    if request.method == 'GET':
        user = request.user.id
        wins = Win.getWins(user=user, weekly=weekly)
        serializer = WinSerializer(wins, many=True)
        return JSONResponse(serializer.data)


@api_view(['POST'])
@authentication_classes((TokenAuthentication,))
@permission_classes((IsAuthenticated,))
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


@api_view(['POST'])
@authentication_classes((TokenAuthentication,))
@permission_classes((IsAuthenticated,))
def win_new(request):
    """
    New or update win.
    """
    if request.method in ('POST', 'PUT'):
        data = JSONParser().parse(request)
        data['owner'] = request.user.id
        print(data)
        if 'id' in data:
            win = Win.objects.get(pk=data['id'])
            if win.owner.id != request.user.id:
                msg = 'You can only modify a win if you are the owner'
                return JSONResponse(msg, status=403)
            else:
                serializer = WinSerializer(win, data=data, partial=True)
        else:
            data['date'] = date.today().isoformat()
            serializer = WinSerializer(data=data, partial=True)
        if serializer and serializer.is_valid():
            serializer.save()
            return JSONResponse(serializer.data, status=201)
        return JSONResponse(serializer.errors, status=400)


@api_view(['GET', 'POST'])
@authentication_classes((TokenAuthentication,))
@permission_classes((IsAuthenticated,))
def goal_list(request, weekly=False):
    """
    List current goals, or create a new one
    """
    if request.method == 'GET':
        user = request.user.id
        goals = Goal.getGoals(user=user, weekly=weekly)
        serializer = GoalSerializer(goals, many=True)
        return JSONResponse(serializer.data)

    elif request.method == 'POST':
        data = JSONParser().parse(request)
        data['owner'] = request.user.id
        data['date'] = date.today().isoformat()
        serializer = GoalSerializer(data=data, partial=True)
        if serializer and serializer.is_valid():
            serializer.save()
            return JSONResponse(serializer.data, status=status.HTTP_201_CREATED)

    return JSONResponse(serializer.errors, status=400)



@api_view(['GET', 'PUT', 'DELETE'])
@authentication_classes((TokenAuthentication,))
@permission_classes((IsAuthenticated,))
def goal_detail(request, pk):
    """
    Retrieve, update or delete goal.
    """
    try:
        goal = Goal.objects.get(pk=pk)
        if goal.owner != request.user:
            return Response(status=status.HTTP_403_FORBIDDEN)
    except Goal.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = GoalSerializer(goal)
        return Response(serializer.data)

    elif request.method == 'PUT':
        data = JSONParser().parse(request)
        data['owner'] = request.user.id
        serializer = GoalSerializer(goal, data=data, partial=True)
        if serializer and serializer.is_valid():
            serializer.save()
            return JSONResponse(serializer.data, status=201)

    elif request.method == 'DELETE':
        goal.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    return JSONResponse(serializer.errors, status=400)

@api_view(['POST'])
@authentication_classes((TokenAuthentication,))
@permission_classes((IsAuthenticated,))
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

