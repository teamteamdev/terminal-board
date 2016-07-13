from django.conf.urls import url
from . import views

urlpatterns = [
  url(r'^$', views.main, name = 'main'),
  url(r'^auth/?$', views.auth, name = 'auth'),
  url(r'^tasks/?$', views.tasks, name = 'tasks'),
  url(r'^status/?$', views.status, name = 'status'),
  url(r'^scoreboard/?$', views.scoreboard, name = 'scoreboard'),
  url(r'^submit/?$', views.submit_task, name = 'submit_task'),
  url(r'^web100/?$', views.login_web100, name = 'login_web100')
]
