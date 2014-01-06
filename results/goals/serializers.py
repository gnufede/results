from rest_framework import serializers
from .models import *
from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email')

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ('id', 'title', 'body', 'parent', 'owner')

class GoalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Goal
        fields = ('id', 'title', 'body', 'date', 'parent', 'tags', 'weekly',
                  'owner')
        depth = 1

class WinSerializer(serializers.ModelSerializer):
    class Meta:
        model = Win
        fields = ('id', 'title', 'body', 'date', 'goal', 'tags', 'weekly')
        #          'owner')
        depth = 1
