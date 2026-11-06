import os
import mimetypes
from django.conf import settings

# Ensure proper MIME types for modern image formats on Windows
mimetypes.add_type("image/webp", ".webp")
mimetypes.add_type("image/avif", ".avif")
from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from django.conf.urls.static import static

# DCH Admin Branding
admin.site.site_header = "DCH Administration"
admin.site.site_title = "DCH Admin Portal"
admin.site.index_title = "DCH Dashboard"

def root_status_view(request):
    return JsonResponse({
        "status": "online",
        "service": "DCH API Backend",
        "admin_panel": "/admin/",
        "api_v1": "/api/v1/",
        "frontend_website": "http://localhost:3002/",
    })

urlpatterns = [
    path('', root_status_view, name='root-status'),
    path('admin/', admin.site.urls),
    path('api/v1/', include('apis.urls')),
]

from django.contrib.staticfiles.urls import staticfiles_urlpatterns
urlpatterns += staticfiles_urlpatterns()
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
urlpatterns += static('/media/temp/', document_root=os.path.join(settings.MEDIA_ROOT, 'temp'))
