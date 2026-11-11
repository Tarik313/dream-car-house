from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver

from core.utils.revalidation import trigger_next_revalidation


@receiver(post_save, sender="home.SiteSettings")
@receiver(post_delete, sender="home.SiteSettings")
def handle_site_settings_change(sender, **kwargs):
    trigger_next_revalidation(
        paths=["/", "/about/", "/contact/", "/sell/", "/inventory/"],
        tags=["site-settings"],
    )


@receiver(post_save, sender="home.ShowroomBranch")
@receiver(post_delete, sender="home.ShowroomBranch")
def handle_branch_change(sender, **kwargs):
    trigger_next_revalidation(
        paths=["/", "/contact/", "/about/", "/cars/", "/inventory/"],
        tags=["branches"],
    )


@receiver(post_save, sender="home.Slider")
@receiver(post_delete, sender="home.Slider")
def handle_slider_change(sender, **kwargs):
    trigger_next_revalidation(paths=["/"], tags=["sliders"])


@receiver(post_save, sender="home.PreferenceSection")
@receiver(post_save, sender="home.PreferenceCategory")
@receiver(post_save, sender="home.ConsultationSection")
@receiver(post_save, sender="home.ExperienceSection")
@receiver(post_save, sender="home.ExperiencePillar")
@receiver(post_delete, sender="home.ExperiencePillar")
@receiver(post_save, sender="home.VisualChroniclesSection")
@receiver(post_save, sender="home.VisualChroniclesItem")
@receiver(post_delete, sender="home.VisualChroniclesItem")
@receiver(post_save, sender="home.VipSanctuarySection")
@receiver(post_save, sender="home.AboutSection")
def handle_home_sections_change(sender, **kwargs):
    trigger_next_revalidation(
        paths=["/", "/about/", "/gallery/"],
        tags=["home-sections"],
    )


@receiver(post_save, sender="home.ShowroomStory")
@receiver(post_delete, sender="home.ShowroomStory")
def handle_stories_change(sender, **kwargs):
    trigger_next_revalidation(paths=["/"], tags=["showroom-stories"])


@receiver(post_save, sender="home.SalesRepresentative")
@receiver(post_delete, sender="home.SalesRepresentative")
def handle_sales_rep_change(sender, **kwargs):
    trigger_next_revalidation(paths=["/contact/"], tags=["sales-representatives"])


@receiver(post_save, sender="home.PeopleTalkAboutUs")
@receiver(post_delete, sender="home.PeopleTalkAboutUs")
def handle_people_talk_change(sender, **kwargs):
    trigger_next_revalidation(paths=["/", "/about/"], tags=["people-talk"])

