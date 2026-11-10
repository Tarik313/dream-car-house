from __future__ import absolute_import, unicode_literals
import os
from celery import Celery

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.production')

app = Celery('core')

# Use django.conf:settings so Celery reads CELERY_* variables from active Django settings
app.config_from_object('django.conf:settings', namespace='CELERY')

# This will auto-discover tasks from all installed Django apps
app.autodiscover_tasks()


if __name__ == '__main__':
    app.start()
