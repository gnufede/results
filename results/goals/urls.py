from django.conf.urls import patterns, url

urlpatterns = patterns('goals.views',
    url(r'^categories/$', 'category_list'),
    url(r'^wins/$', 'win_list'),
    url(r'^wins/new/$', 'win_new'),
    url(r'^goals/$', 'goal_list'),
    url(r'^goals/weekly/$', 'goal_list', kwargs={'weekly':True,}),
    url(r'^goals/new/$', 'goal_new')
)
