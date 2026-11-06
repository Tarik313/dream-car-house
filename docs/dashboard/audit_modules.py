"""Generate a schema/admin inventory without loading settings or querying a database.
Run: backend/.venv/bin/python docs/dashboard/audit_modules.py
"""
import ast
import inspect
import os
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "backend"))
os.environ.pop("DJANGO_SETTINGS_MODULE", None)
# Extract only app-name literals. Never evaluate settings or load .env files.
tree = ast.parse((ROOT / "backend/core/settings/base.py").read_text())
app_names = []
for node in tree.body:
    if isinstance(node, ast.Assign) and any(isinstance(t, ast.Name) and t.id in {"INSTALLED_APPS", "LOCALE_APPS", "THIRD_PARTY_APPS"} for t in node.targets):
        app_names.extend(ast.literal_eval(node.value))
from django.conf import settings
settings.configure(
    SECRET_KEY="schema-audit-only", INSTALLED_APPS=app_names,
    DATABASES={"default": {"ENGINE": "django.db.backends.dummy"}},
    TEMPLATES=[{"BACKEND": "django.template.backends.django.DjangoTemplates", "APP_DIRS": True}],
    USE_TZ=True, DEFAULT_AUTO_FIELD="django.db.models.BigAutoField",
)
import django
django.setup()
from django.apps import apps
from django.contrib import admin
from django.db.backends.base.base import BaseDatabaseWrapper

def deny_connection(*args, **kwargs):
    raise RuntimeError("Database access forbidden during schema audit")
BaseDatabaseWrapper.ensure_connection = deny_connection

# Public paths below are relative to /api/v1/. Management paths are future plans,
# relative to /api/v1/dashboard/; no business handler is implemented in phase 1.
plans = {
 "inventory.Inventory": ("GET inventory/, featured/, detail/<slug>/, detail/<slug>/related/, filters/ (all under inventory/); legacy detail/<id>/ paths declared", "inventory/; inventory/<id>/", "/workspace/inventory"),
 "inventory.InventoryImage": ("Nested in inventory/detail/<slug>/", "inventory/<id>/images/; inventory/<id>/images/<image_id>/", "/workspace/inventory/[id]/images"),
 "inventory.Brand": ("GET inventory/brands/; inventory/brands/<id>/seo/; inventory/filters/", "brands/; brands/<id>/", "/workspace/brands"),
 "inventory.ModelGeneration": ("GET inventory/generations/; inventory/filters/", "model-generations/; model-generations/<id>/", "/workspace/model-generations"),
 "inventory.BodyStyle": ("GET inventory/body-style/; inventory/filters/", "body-styles/; body-styles/<id>/", "/workspace/body-styles"),
 "inventory.Stock": ("GET inventory/stocks/", "stocks/; stocks/<id>/", "/workspace/stocks"),
 "inventory.InventoryQuote": ("POST inventory/quote/", "quotes/; quotes/<id>/", "/workspace/enquiries/quotes"),
 "home.Slider": ("GET home/slider/ (last record)", "sliders/; sliders/<id>/", "/workspace/content/sliders"),
 "home.SocialMedia": ("GET home/sm/ (last record)", "social-media/; social-media/<id>/", "/workspace/content/social-media"),
 "home.SellCar": ("POST home/sell-car/", "sell-car-enquiries/; sell-car-enquiries/<id>/", "/workspace/enquiries/sell-car"),
 "home.SellYourCarImages": ("Upload through POST home/sell-car/ images field; no standalone route", "sell-car-enquiries/<id>/images/; .../<image_id>/", "/workspace/enquiries/sell-car/[id]/images"),
 "home.PeopleTalkAboutUs": ("GET home/people-talk/", "social-features/; social-features/<id>/", "/workspace/content/social-features"),
 "home.Subscriber": ("POST home/subscribers/", "subscribers/; subscribers/<id>/", "/workspace/enquiries/subscribers"),
 "home.SalesRepresentative": ("GET home/sales-representative/", "sales-representatives/; sales-representatives/<id>/", "/workspace/content/sales-representatives"),
 "home.ContactMessage": ("POST home/contact/", "contact-messages/; contact-messages/<id>/", "/workspace/enquiries/contact"),
 "home.SiteSettings": ("GET site-config/settings/; home/settings/", "site-settings/", "/workspace/site-settings"),
 "home.ShowroomBranch": ("GET site-config/branches/; home/branches/", "branches/; branches/<id>/", "/workspace/branches"),
 "home.PreferenceSection": ("GET home/preference-section/", "preference-section/", "/workspace/content/preferences"),
 "home.PreferenceCategory": ("Nested in GET home/preference-section/", "preference-categories/; preference-categories/<id>/", "/workspace/content/preferences"),
 "home.ConsultationSection": ("GET home/consultation/", "consultation/", "/workspace/content/consultation"),
 "home.ExperienceSection": ("GET home/experience/", "experience/", "/workspace/content/experience"),
 "home.ExperiencePillar": ("Nested in GET home/experience/", "experience-pillars/; experience-pillars/<id>/", "/workspace/content/experience"),
 "home.VisualChroniclesSection": ("GET home/visual-chronicles/", "visual-chronicles/", "/workspace/content/visual-chronicles"),
 "home.VisualChroniclesItem": ("Nested in GET home/visual-chronicles/", "visual-chronicles/items/; visual-chronicles/items/<id>/", "/workspace/content/visual-chronicles"),
 "home.VipSanctuarySection": ("GET home/vip-sanctuary/", "vip-sanctuary/", "/workspace/content/vip-sanctuary"),
 "home.IdempotencyKey": ("Internal persistent idempotency store for POST home/contact/", "Internal idempotency enforcement", "/workspace/enquiries/contact"),
 "seo_config.SEOConfig": ("GET site-config/seo/<page>/", "page-seo/; page-seo/<page>/", "/workspace/seo/pages"),
 "seo_config.CategoryPageSEO": ("GET site-config/category-seo/<page>/", "category-seo/; category-seo/<page>/", "/workspace/seo/categories"),
 "auth.User": ("None", "users/; users/<id>/", "/workspace/users"),
 "auth.Group": ("None", "groups/; groups/<id>/", "/workspace/groups"),
 "auth.Permission": ("None", "permissions/", "/workspace/groups"),
}
lines = ["# Module matrix", "", "Generated from actual Django model metadata and admin registrations with a dummy database and blocked connections. No customer rows are read. See `audit_modules.py` to regenerate. Baseline: fd8d42d; foundation adds dashboard_api with no models.", "", "## Installed applications", "", *[f"- `{name}`" for name in app_names], "", "Development additionally installs `django_extensions` and `drf_yasg`; neither adds business models. Production adds no apps. `base.BaseModel` is abstract and `base` is not installed. SimpleJWT is installed, but authtoken and token_blacklist are not. Packages in requirements are not automatically installed Django apps.", "", "## Coverage and endpoint plan", "", "All listed business management endpoints are **planned, not implemented**. Every business row is source/schema verified, but CRUD, authorization, database and browser verification remain pending. GET collection/detail requires active staff plus `view_<model>`; POST requires `add_<model>`; PATCH requires `change_<model>`; DELETE requires `delete_<model>`, each under the listed app label. These are proposed per-model checks, not existing dashboard authorization. No bulk actions planned. Enquiry creation remains public through existing contracts; dashboard creation is not planned. Nested image operations additionally require parent access/change permission. User/group administration remains Django-admin-only for this phase.", "", "| Model | Public endpoint | Required management endpoints / operations | Planned dashboard route | Permissions | Implementation / verification |", "|---|---|---|---|---|---|"]
models = sorted(apps.get_models(), key=lambda model: model._meta.label)
for model in models:
 label = model._meta.label
 if label in plans:
  public, api, route = plans[label]
  operations = "GET/POST/PATCH/DELETE"
  if label in {"inventory.InventoryQuote", "home.SellCar", "home.ContactMessage", "home.Subscriber"}: operations = "GET/PATCH/DELETE; no create"
  elif label in {"home.SiteSettings", "home.PreferenceSection", "home.ConsultationSection", "home.ExperienceSection", "home.VisualChroniclesSection", "home.VipSanctuarySection"}: operations = "GET/PATCH; singleton"
  elif label == "auth.Permission": operations = "GET; read-only"
  permission = f"active staff + {model._meta.app_label}.{{view,add,change,delete}}_{model._meta.model_name} by operation"
  if label in {"inventory.InventoryImage", "home.SellYourCarImages"}: permission += "; parent access/change"
  state = "Deferred / schema and source verified; runtime CRUD unverified"
 else:
  public, api, route = "None", "None planned; retain Django internal/admin ownership", "None"
  operations = ""
  permission = "Existing Django permissions; no dashboard access"
  state = "Excluded / schema verified"
 lines.append(f"| `{label}` | {public} | {api} ({operations}) | `{route}` | {permission} | {state} |")
lines += ["", "## Complete field, relation and admin inventory", "", "Fields below include implicit IDs and inherited timestamps. Reverse relations are listed separately. Django's inherited `delete_selected` is available to eligible admin users unless overridden; there are no project-defined custom actions. Field choices/defaults are schema metadata, not customer values."]
for model in models:
 label=model._meta.label
 lines += ["", f"### {label}", "", f"Table: `{model._meta.db_table}`. Source: `{inspect.getfile(model).replace(str(ROOT) + '/', '')}`.", "", "| Field | Type | Constraints / relation |", "|---|---|---|"]
 for field in model._meta.fields + model._meta.many_to_many:
  constraints=[]
  for attr in ("primary_key", "unique", "null", "blank", "db_index"):
   if getattr(field,attr,False):constraints.append(attr)
  if not field.editable:constraints.append("read-only")
  for attr in ("max_length", "max_digits", "decimal_places"):
   value=getattr(field,attr,None)
   if value is not None:constraints.append(f"{attr}={value}")
  if field.has_default():
   default = field.default
   constraints.append("default=" + (getattr(default, "__name__", "callable") if callable(default) else repr(default)))
  if field.choices:constraints.append("choices=" + ", ".join(str(k) for k,_ in field.flatchoices))
  if field.is_relation:
   constraints.append("→ " + field.related_model._meta.label)
   if getattr(field.remote_field,"on_delete",None):constraints.append("on_delete="+field.remote_field.on_delete.__name__)
   if field.remote_field.related_name:constraints.append("related_name="+field.remote_field.related_name)
  lines.append(f"| `{field.name}` | {field.get_internal_type()} | {'; '.join(constraints)} |")
 reverse=[f"`{r.get_accessor_name()}` ← `{r.related_model._meta.label}.{r.field.name}`" for r in model._meta.related_objects]
 lines += ["", "Reverse relations: " + ("; ".join(reverse) or "none") + "."]
 registered=admin.site._registry.get(model)
 if registered:
  lines += ["", f"Registered admin: `{type(registered).__name__}`."]
  for attr in ("list_display", "list_display_links", "list_filter", "search_fields", "readonly_fields", "ordering", "date_hierarchy", "fieldsets", "actions"):
   value=getattr(registered,attr,None)
   if value:lines.append(f"- `{attr}`: `{value!r}`")
  lines.append(f"- Form: `{registered.form.__module__}.{registered.form.__name__}`; inherited bulk action: `delete_selected`.")
  for inline in registered.inlines:
   lines += [f"- Inline `{inline.__name__}` → `{inline.model._meta.label}`; type `{inline.__bases__[0].__name__}`; extra={inline.extra}; fields={inline.fields!r}; readonly={inline.readonly_fields!r}; ordering={inline.ordering!r}."]
 else:lines += ["", "Not registered independently in admin."]
 lines += ["", "Model methods defined here: " + ", ".join(f"`{n}`" for n,v in model.__dict__.items() if callable(v) and not n.startswith("__")) + "."]
lines += ["", "## Admin and serializer behavior requiring preservation", "", "- InventoryAdminForm makes slug optional and checks supplied slug uniqueness excluding the current row. General and SEO fieldsets; image preview is read-only, preview JavaScript enabled. `model_name` exists on the model but is omitted from InventoryAdmin fieldsets. InventoryImage is inline-only, ordered, with editable caption/alt/order and a read-only preview.", "- SellCar has a stacked SellYourCarImages inline (extra=0); image model has no standalone admin. Other registered business models use standard ModelAdmin forms. No project custom actions or custom save_model overrides found.", "- Built-in UserAdmin includes password hashing/change forms and permission/group handling; GroupAdmin manages permission M2M. Do not replace these with generic serializers. Permission, ContentType, Session and LogEntry are internal models, not new business modules.", "- Public inventory serializers flatten brand/model/body style names and replace numeric price with Sold or Pre-Order; these are not suitable management write serializers. Detail schema JSON is generated unless schema_override is set. Images use OptimizedImageSerializerMixin; Stock returns its raw URL.", "- ContactMessageSerializer exposes `enquiry` mapped to model `message`, sanitizes text with bleach, checks phone syntax, and requires email for EMAIL contact. Preserve that public alias. SellCarSerializer sanitizes name; image validation/save runs after parent save and is not wrapped in an explicit transaction. Public image mixin accepts JPEG/PNG, while model extension validators also allow WebP. SubscriberSerializer defines validate_name although Subscriber has only email; it is not called for that model. These discrepancies are recorded, not changed.", "- Slider.image is labelled Video and has no file-extension validator. Brand has status but no visibility field or stored slug. SEO page keys are unique. Legacy BYD SEO choice remains although public /byd-cars redirects to /cars/brand/byd.", "", "Foundation endpoint: `GET /api/v1/dashboard/access/` is implemented and always denied with 403. No business-model endpoint is enabled. See API_CONTRACT.md and PROGRESS.md for verified boundary tests."]
(ROOT / "docs/dashboard/MODULE_MATRIX.md").write_text("\n".join(lines)+"\n")
print(f"Wrote {len(models)} models; {len(admin.site._registry)} admin registrations; {len(plans)} business module plans. No database access.")
