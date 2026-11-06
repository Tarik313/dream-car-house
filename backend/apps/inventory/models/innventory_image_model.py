from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import FileExtensionValidator
from django.db.models import Max

from core.utils import images_path_dir


class InventoryImage(models.Model):
    inventory = models.ForeignKey(
        'inventory.Inventory',
        on_delete=models.CASCADE,
        related_name='inventory_images',
        verbose_name=_("Inventory")
    )
    caption = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        verbose_name=_("Caption")
    )
    image = models.FileField(
        upload_to=images_path_dir,
        max_length=500,
        validators=[FileExtensionValidator(
            ['jpg', 'jpeg', 'png', 'webp']
        )],
        help_text=_("jpg, jpeg, png, webp"),
        verbose_name=_("Image")
    )
    alt_text = models.CharField(
        max_length=200,
        blank=True,
        verbose_name=_("Alt Text")
    )
    tag = models.CharField(
        max_length=50,
        blank=True,
        default='',
        verbose_name=_("Photo Tag / Perspective"),
        help_text=_("e.g. EXTERIOR, PROFILE, COCKPIT, INTERIOR, WHEELS, REAR")
    )
    order = models.PositiveIntegerField(
        default=0,
        verbose_name=_("Display Order")
    )

    def save(self, *args, **kwargs):
        if self.inventory_id and not self.pk and (self.order is None or self.order == 0):
            max_order = (
                InventoryImage.objects
                .filter(inventory_id=self.inventory_id)
                .aggregate(max_order=Max('order'))
                .get('max_order')
            )
            self.order = (max_order or 0) + 1

        if not self.alt_text and self.inventory_id:
            try:
                inv = self.inventory
                year = inv.year or ''
                brand = str(inv.brand) if inv.brand else ''
                model_name = str(inv.model) if inv.model else ''
                color = inv.color or ''
                alt_parts = [str(year) if year else '', brand, model_name]
                core = ' '.join(part for part in alt_parts if part).strip()
                if color:
                    core = f"{core} in {color}".strip()
                self.alt_text = f"View of {core}".strip()[:200]
                if self.alt_text == 'View of':
                    self.alt_text = f"View of {inv.name}"[:200]
            except Exception:
                pass
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Image for {self.inventory.name}"

    class Meta:
        verbose_name = "Inventory Image"
        verbose_name_plural = "Inventory Images"
        db_table = "tbl_inventory_images"
        ordering = ['order', 'id']
