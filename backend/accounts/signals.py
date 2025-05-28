from allauth.socialaccount.signals import social_account_added
from django.dispatch import receiver
from django.contrib.auth import get_user_model

User = get_user_model()

@receiver(social_account_added)
def on_social_account_added(request, sociallogin, **kwargs):
    user = sociallogin.user
    extra = sociallogin.account.extra_data
    user.first_name = extra.get("given_name", user.first_name)
    user.last_name = extra.get("family_name", user.last_name)
    user.is_verified = True
    if not user.has_usable_password():
        user.set_password(User.objects.make_random_password())
    user.save()
