from django.shortcuts import render

# Create your views here.
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.renderers import JSONRenderer
from rest_framework.parsers import JSONParser
from goals.models import Category, Goal
from goals.serializers import CategorySerializer, GoalSerializer
from django.contrib.auth.models import User

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
        serializer = CategorySerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return JSONResponse(serializer.data, status=201)
        return JSONResponse(serializer.errors, status=400)

@csrf_exempt
def goal_list(request):
    """
    List current goals.
    """
    if request.method == 'GET':
        user = User.objects.get(username=str(request.user))
        goals = Goal.getGoals(user=user)
        serializer = GoalSerializer(goals, many=True)
        return JSONResponse(serializer.data)

