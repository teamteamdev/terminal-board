import os, sys
from django.core.wsgi import get_wsgi_application

sys.path.append("/ctf")
os.environ["DJANGO_SETTINGS_MODULE"] = "ctf.settings"

application = get_wsgi_application()
