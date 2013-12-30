from django.contrib.auth.models import User
from django.db import models
from model_utils.models import TimeStampedModel
from datetime import date


# Create your models here.
class Category(TimeStampedModel):
    title = models.CharField(max_length=255)
    body = models.CharField(max_length=500, blank=True)
    parent = models.ForeignKey('Goal', related_name="%(app_label)s_%(class)s",
              blank=True, null=True)
    owner = models.ForeignKey(User)


class Goal(TimeStampedModel):
    title = models.CharField(max_length=255)
    body = models.CharField(max_length=500, blank=True)
    date = models.DateField()
    parent = models.ForeignKey('Goal', related_name="%(app_label)s_%(class)s",
              blank=True, null=True)
    tags = models.ManyToManyField(Category)
    monthly = models.BooleanField()
    owner = models.ForeignKey(User)

    def getGoals(self, user, monthly=False, date=False):
        today = date or date.today()
        today = [today, today.replace(day=1)][int(monthly)]
        return Goal.objects.filter(owner=user, monthly=monthly, date=today)

    def save(self):
        if len(self.getGoals(self.owner, monthly=self.monthly)) > 2:
            #TODO: raise errors here
            pass
        else:
            super(Goal,self).save()


class Win(TimeStampedModel):
    title = models.CharField(max_length=255)
    body = models.CharField(max_length=500, blank=True)
    date = models.DateField()
    goal = models.ForeignKey('Goal', related_name='wins', blank=True,
            null=True)
    tags = models.ManyToManyField('Category')
    monthly = models.BooleanField()
    owner = models.ForeignKey(User)

    def getWins(self, user, monthly=False, date=False):
        today = date or date.today()
        today = [today, today.replace(day=1)][int(monthly)]
        return Win.objects.filter(owner=user, monthly=monthly, date=today)

    def save(self):
        if len(self.getWins(self.owner, monthly=self.monthly)) > 2:
            #TODO: raise errors here
            pass
        else:
            super(Win,self).save()

