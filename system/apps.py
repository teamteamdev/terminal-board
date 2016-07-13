import os

from django.apps import AppConfig

from ctf.settings import *


class SystemConfig(AppConfig):
  name = 'system'
  verbose_name = open(os.path.join(BASE_DIR, 'ctf', 'eventname'), 'r').read().strip()
