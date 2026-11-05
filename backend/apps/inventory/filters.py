import django_filters
from apps.inventory.models import Inventory, BodyStyle

from django_filters.filters import BaseInFilter

class CharInFilter(BaseInFilter, django_filters.CharFilter):
    pass


class InventoryFilter(django_filters.FilterSet):
    price_min = django_filters.NumberFilter(field_name="price", lookup_expr='gte')
    price_max = django_filters.NumberFilter(field_name="price", lookup_expr='lte')
    min_price = django_filters.NumberFilter(field_name="price", lookup_expr='gte')
    max_price = django_filters.NumberFilter(field_name="price", lookup_expr='lte')
    price_range = django_filters.CharFilter(method='filter_price_range')

    def filter_price_range(self, queryset, name, value):
        if not value:
            return queryset
        val = str(value).strip().lower()
        if val.startswith('under-'):
            try:
                max_val = float(val.replace('under-', ''))
                return queryset.filter(price__lte=max_val)
            except ValueError:
                return queryset
        if val.endswith('-plus'):
            try:
                min_val = float(val.replace('-plus', ''))
                return queryset.filter(price__gte=min_val)
            except ValueError:
                return queryset
        if '-' in val:
            parts = val.split('-')
            if len(parts) == 2:
                try:
                    p_min = float(parts[0]) if parts[0] else None
                    p_max = float(parts[1]) if parts[1] else None
                    if p_min is not None:
                        queryset = queryset.filter(price__gte=p_min)
                    if p_max is not None:
                        queryset = queryset.filter(price__lte=p_max)
                    return queryset
                except ValueError:
                    return queryset
        return queryset

    brand = django_filters.CharFilter(field_name="brand__name", lookup_expr='iexact')
    model = django_filters.CharFilter(field_name="model__model", lookup_expr='iexact')
    model_name = django_filters.CharFilter(field_name="model_name", lookup_expr='iexact')
    brand_id = django_filters.NumberFilter(field_name="brand_id", lookup_expr='exact')
    model_id = django_filters.NumberFilter(field_name="model_id", lookup_expr='exact')
    color = django_filters.CharFilter(field_name="color", lookup_expr='iexact')
    body_style = django_filters.ModelChoiceFilter(queryset=BodyStyle.objects.all())
    registered = CharInFilter(field_name="registered", lookup_expr='in')
    car_type = CharInFilter(field_name="car_type", lookup_expr='in')
    branch = django_filters.CharFilter(field_name="branch__branch_id", lookup_expr='iexact')
    branch_id = django_filters.NumberFilter(field_name="branch_id", lookup_expr='exact')

    class Meta:
        model = Inventory
        fields = [
            'brand',
            'brand_id',
            'model',
            'model_name',
            'model_id',
            'color',
            'engine_capacity',
            'body_style',
            'registered',
            'inventory_type',
            'car_type',
            'branch',
            'branch_id',
            'price_min',
            'price_max',
            'min_price',
            'max_price',
            'price_range',
        ]
