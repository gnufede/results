from rest_framework import serializers
from .models import *

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ('id', 'title', 'body', 'parent', 'owner')

class GoalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Goal
        fields = ('id', 'title', 'body', 'date', 'parent', 'tags', 'weekly',
                  'owner')

class WinSerializer(serializers.ModelSerializer):
    class Meta:
        model = Win
        fields = ('id', 'title', 'body', 'date', 'goal', 'tags', 'weekly',
                  'owner')
