from django.db import models
from django.utils.translation import gettext_lazy as _

from base.models import BaseModel


class ContactMessage(BaseModel):
    class TopicChoices(models.TextChoices):
        BUYING = 'BUYING', _('Buying a car')
        SELLING = 'SELLING', _('Selling my car')
        AFTER_SALES = 'AFTER_SALES', _('After-sales & service')
        OTHER = 'OTHER', _('Something else')

    class PreferredContactChoices(models.TextChoices):
        WHATSAPP = 'WHATSAPP', _('WhatsApp')
        PHONE = 'PHONE', _('Phone call')
        EMAIL = 'EMAIL', _('Email')

    topic = models.CharField(
        max_length=20,
        choices=TopicChoices.choices,
        default=TopicChoices.BUYING,
        verbose_name=_('Interested in'),
    )
    name = models.CharField(
        max_length=100,
        verbose_name=_('Full name'),
    )
    phone = models.CharField(
        max_length=20,
        verbose_name=_('Phone'),
    )
    email = models.EmailField(
        max_length=254,
        blank=True,
        default='',
        verbose_name=_('Email'),
    )
    vehicle = models.CharField(
        max_length=150,
        blank=True,
        default='',
        verbose_name=_('Vehicle'),
        help_text=_('Vehicle of interest, or the customer\'s own car when selling.'),
    )
    message = models.TextField(
        max_length=3000,
        verbose_name=_('Message'),
    )
    preferred_contact = models.CharField(
        max_length=10,
        choices=PreferredContactChoices.choices,
        default=PreferredContactChoices.WHATSAPP,
        verbose_name=_('Preferred way to reach'),
    )

    def __str__(self):
        return f"{self.name} — {self.get_topic_display()}"

    class Meta:
        verbose_name = _('Contact Message')
        verbose_name_plural = _('Contact Messages')
        db_table = 'tbl_contact_messages'
        ordering = ('-created_at',)
