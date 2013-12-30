from django.conf.urls import patterns, url

urlpatterns = patterns('goals.views',
    url(r'^categories/$', 'category_list'),
)
