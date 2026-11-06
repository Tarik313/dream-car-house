from django.db import models
from django.utils.translation import gettext_lazy as _
from base.models import BaseModel


class ShowroomBranch(BaseModel):
    branch_id = models.SlugField(
        max_length=100,
        unique=True,
        verbose_name=_("Branch Identifier (Slug)"),
        help_text=_("Unique identifier matching client keys, e.g. 'kakrail', 'gulshan'"),
    )
    name = models.CharField(
        max_length=200,
        verbose_name=_("Branch Name"),
    )
    short_name = models.CharField(
        max_length=100,
        verbose_name=_("Short Name"),
    )
    tag = models.CharField(
        max_length=150,
        blank=True,
        verbose_name=_("Tag Pill"),
        help_text=_("e.g. 'Main Flagship Showroom' or 'Gulshan Avenue Showroom'"),
    )
    address = models.CharField(
        max_length=300,
        verbose_name=_("Address"),
    )
    phone = models.CharField(
        max_length=50,
        verbose_name=_("Direct Phone"),
    )
    hotline = models.CharField(
        max_length=50,
        blank=True,
        verbose_name=_("Hotline"),
    )
    email = models.EmailField(
        default="dreamcarhouse101@gmail.com",
        verbose_name=_("Email"),
    )
    hours = models.CharField(
        max_length=255,
        verbose_name=_("Opening Hours"),
    )
    map_link = models.URLField(
        max_length=500,
        verbose_name=_("Directions Map Link"),
    )
    embed_map = models.TextField(
        verbose_name=_("Embed Map URL/Iframe Src"),
    )
    order = models.PositiveIntegerField(
        default=1,
        verbose_name=_("Display Order"),
    )
    status = models.CharField(
        max_length=20,
        choices=BaseModel.StatusChoices.choices,
        default=BaseModel.StatusChoices.PUBLISHED,
        verbose_name=_("Publication Status"),
    )

    class Meta:
        verbose_name = _("Showroom Branch")
        verbose_name_plural = _("Showroom Branches")
        db_table = "tbl_showroom_branch"
        ordering = ["order", "id"]

    def __str__(self):
        return f"{self.name} ({self.branch_id})"
