from django.contrib.auth import get_user_model
from django.contrib.auth.models import User
from django.core.exceptions import PermissionDenied
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver

from model_utils.models import TimeStampedModel
from datetime import date

from rest_framework.authtoken.models import Token


@receiver(post_save, sender=get_user_model())
def create_auth_token(sender, instance=None, created=False, **kwargs):
    if created:
        token = Token.objects.create(user=instance)
        print(token.key)


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
    weekly = models.BooleanField(default=False)
    owner = models.ForeignKey(User)

    def __unicode__(self):
        return ', '.join((str(x) for x in
                (self.owner, self.title, self.date, self.weekly)))

    def __str__(self):
        return self.__unicode__()

    def getGoals(user, weekly=False, day=False):
        today = day or date.today()
        sunday = date.fromordinal(today.toordinal()-today.isoweekday())
        today = [today, sunday][int(weekly or 0)]
        if user:
            return Goal.objects.filter(owner=user, weekly=weekly, date=today)
        else:
            return []

    def save(self):
        goals = Goal.getGoals(user=self.owner, weekly=self.weekly)
        if len(goals) > 2:
            if self.id not in [goal.id for goal in goals]:
                raise PermissionDenied()
        else:
            if self.weekly:
                sunday = date.fromordinal(self.date.toordinal()-
                                        self.date.isoweekday())
                self.date = sunday
            super(Goal,self).save()


class Win(TimeStampedModel):
    title = models.CharField(max_length=255)
    body = models.CharField(max_length=500, blank=True)
    date = models.DateField()
    goal = models.ForeignKey('Goal', related_name='wins', blank=True,
            null=True)
    tags = models.ManyToManyField('Category')
    weekly = models.BooleanField(default=False)
    owner = models.ForeignKey(User)

    def __unicode__(self):
        return ', '.join((str(x) for x in
                (self.owner, self.title, self.date, self.weekly)))

    def __str__(self):
        return self.__unicode__()

    def getWins(user, weekly=False, day=False):
        today = day or date.today()
        friday = date.fromordinal((today.toordinal()-today.isoweekday())+5)
        today = [today, friday][int(weekly or 0)]
        return Win.objects.filter(owner=user, weekly=weekly, date=today)

    def save(self):
        self.date = self.date or date.today()
        wins = Win.getWins(user=self.owner, weekly=self.weekly)
        if len(wins) > 2:
            if self.id not in [win.id for win in wins]:
                raise PermissionDenied()
        else:
            if self.weekly:
                friday = date.fromordinal((self.date.toordinal()-
                                    self.date.isoweekday())+5)
                self.date = friday
            super(Win,self).save()

