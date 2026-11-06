from rest_framework.permissions import BasePermission


class IsActiveStaff(BasePermission):
    """
    Allows access only to active staff members.
    Fails closed if unauthenticated, inactive, or not staff.
    """
    message = "Active staff access required."
    code = "FORBIDDEN"

    def has_permission(self, request, view):
        user = getattr(request, "user", None)
        return bool(user and user.is_authenticated and user.is_active and user.is_staff)


class DashboardModelPermission(BasePermission):
    """
    Strictly checks Django model permissions on GET, POST, PUT, PATCH, DELETE.
    GET / HEAD / OPTIONS -> app_label.view_<model>
    POST -> app_label.add_<model>
    PUT / PATCH -> app_label.change_<model>
    DELETE -> app_label.delete_<model>
    """
    perms_map = {
        "GET": ["%(app_label)s.view_%(model_name)s"],
        "OPTIONS": ["%(app_label)s.view_%(model_name)s"],
        "HEAD": ["%(app_label)s.view_%(model_name)s"],
        "POST": ["%(app_label)s.add_%(model_name)s"],
        "PUT": ["%(app_label)s.change_%(model_name)s"],
        "PATCH": ["%(app_label)s.change_%(model_name)s"],
        "DELETE": ["%(app_label)s.delete_%(model_name)s"],
    }

    def get_required_permissions(self, method, model_cls):
        app_label = model_cls._meta.app_label
        model_name = model_cls._meta.model_name
        kwargs = {"app_label": app_label, "model_name": model_name}
        if method not in self.perms_map:
            return []
        return [perm % kwargs for perm in self.perms_map[method]]

    def has_permission(self, request, view):
        user = getattr(request, "user", None)
        if not (user and user.is_authenticated and user.is_active and user.is_staff):
            return False

        # Superusers bypass model permissions in Django's ModelBackend
        if getattr(user, "is_superuser", False):
            return True

        model_cls = getattr(view, "model", None)
        if model_cls is None:
            queryset = getattr(view, "queryset", None)
            if queryset is not None:
                model_cls = queryset.model

        if model_cls is None:
            # If no model is bound to the view, view must specify required_permissions
            req_perms = getattr(view, "required_permissions", None)
            if req_perms is None:
                return False
            return all(user.has_perm(perm) for perm in req_perms)

        required = self.get_required_permissions(request.method, model_cls)
        return all(user.has_perm(perm) for perm in required)
