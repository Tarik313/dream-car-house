from django.db import models


class IdempotencyKey(models.Model):
    key = models.CharField(max_length=128, unique=True, db_index=True)
    scope = models.CharField(max_length=64, default="contact_enquiry", db_index=True)
    request_hash = models.CharField(max_length=64)
    response_code = models.PositiveSmallIntegerField(default=201)
    response_data = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "tbl_idempotency_key"
        verbose_name = "Idempotency Record"
        verbose_name_plural = "Idempotency Records"
        indexes = [
            models.Index(fields=["key"]),
            models.Index(fields=["scope", "key"]),
        ]

    def __str__(self):
        return f"{self.scope}:{self.key} [{self.response_code}]"
