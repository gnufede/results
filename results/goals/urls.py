from django.conf.urls import patterns, url

urlpatterns = patterns('goals.views',
    url(r'^categories/$', 'category_list'),
    url(r'^wins/$', 'win_list'),
    #url(r'^wins/(?P<pk>[0-9]+)$', 'win_detail'),
    url(r'^wins/weekly/$', 'win_list', kwargs={'weekly':True,}),
    url(r'^wins/new/$', 'win_new'),
#    url(r'^wins/update/$', 'win_update'),
    url(r'^wins/tag/$', 'win_tag'),
    url(r'^goals$', 'goal_list'),
    url(r'^goals/(?P<pk>[0-9]+)$', 'goal_detail'),
    url(r'^goals/weekly/$', 'goal_list', kwargs={'weekly':True,}),
    url(r'^goals/tag/$', 'goal_tag'),
    url(r'^users/me/$', 'myself')
)
