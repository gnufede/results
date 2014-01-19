from django.conf.urls import patterns, include, url
from django.views.generic import TemplateView
from django.contrib.auth.views import *

# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    url(r'^$', TemplateView.as_view(template_name='index.html')),

    url(r'^', include('goals.urls')),
    url(r'^api-token-auth/', 'rest_framework.authtoken.views.obtain_auth_token'),
    # Examples:
    # url(r'^$', 'results.views.home', name='home'),
    # url(r'^results/', include('results.foo.urls')),

    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    url(r'^admin/', include(admin.site.urls)),
)
