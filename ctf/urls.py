from django.conf.urls import url, include
from django.contrib import admin
from .admin import *

urlpatterns = [
  url(r'^admin/', admin.site.urls),
  url(r'^', include('system.urls'), name = 'system')
]
