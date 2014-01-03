# -*- coding: utf-8 -*-
from django.conf.urls import *
from django.core.urlresolvers import reverse_lazy

from django.contrib.auth.views import *
from django.contrib.auth.forms import AuthenticationForm

urlpatterns = patterns(
    '',

    url(r'^logout/$', logout_then_login, name='logout'),
    url(r'^login/$', login,
        kwargs={
            'template_name': 'auth/login.html',
            'authentication_form': AuthenticationForm,
            },
        name='login'),

    url(r'^password-change/$', password_change,
        kwargs={
            'template_name': 'auth/password_change.html',
            },
        name='password_change'),
    url(r'^password-change/ok/$', password_change_done,
        kwargs={
            'template_name': 'auth/password_change_done.html',
            },
        ),

    url(r'^password-reset/$', password_reset,
        kwargs={
            'template_name': 'auth/password_reset.html',
            'email_template_name': 'auth/password_reset_email.html',
            },
        name='password_reset'),
    url(r'^password-reset-confirm/(?P<uidb36>[0-9A-Za-z]{1,13})-(?P<token>[0-9A-Za-z]{1,13}-[0-9A-Za-z]{1,20})/$',
        password_reset_confirm,
        kwargs={
            'post_reset_redirect': reverse_lazy('login'),
            'template_name': 'auth/password_reset_confirm.html',
        },
        name='password_reset_confirm'),
    url(r'^password-reset/ok/$', password_reset_done,
        kwargs={
            'template_name': 'auth/password_reset_done.html',
            },
        ),
)
