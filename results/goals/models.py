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
    weekly = models.BooleanField()
    owner = models.ForeignKey(User)

    def getGoals(user, weekly=False, day=False):
        today = day or date.today()
        sunday = date.fromordinal(today.toordinal()-today.isoweekday())
        today = [today, sunday][int(weekly)]
        if user:
            return Goal.objects.filter(owner=user, weekly=weekly, date=today)
        else:
            return []

    def save(self):
        if len(self.getGoals(self.owner, weekly=self.weekly)) > 2:
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
    weekly = models.BooleanField()
    owner = models.ForeignKey(User)

    def getWins(user, weekly=False, day=False):
        today = day or date.today()
        sunday = date.fromordinal((today.toordinal()-today.isoweekday())+5)
        today = [today, sunday][int(weekly)]
        return Win.objects.filter(owner=user, weekly=weekly, date=today)

    def save(self):
        if len(self.getWins(self.owner, weekly=self.weekly)) > 2:
            #TODO: raise errors here
            pass
        else:
            super(Win,self).save()

