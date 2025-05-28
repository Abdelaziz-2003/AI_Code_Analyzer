# accounts/adapters.py
from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
import uuid 

class CustomSocialAccountAdapter(DefaultSocialAccountAdapter):
    def populate_user(self, request, sociallogin, data):
        user = super().populate_user(request, sociallogin, data)
        extra = sociallogin.account.extra_data

        # DEBUG : affiche les données Google renvoyées
        print("🔍 EXTRA DATA FROM GOOGLE:", extra)

        user.first_name = extra.get("given_name", "")
        user.last_name = extra.get("family_name", "")
        user.is_verified = True
        if not user.username:
            base = (user.first_name + user.last_name).lower()
            uid = uuid.uuid4().hex[:6]
            user.username = f"{base}_{uid}" if base else uid
        return user

    def get_login_redirect_url(self, request):
        user = request.user

        # ⚠️ Ici on suppose que tu veux d'abord valider le nom/prénom si incomplets
        if user.first_name and user.last_name:
            return 'http://localhost:5173/app'
        else:
            return 'http://localhost:5173/update-profile'
