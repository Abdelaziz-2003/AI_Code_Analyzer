from django.urls import path, include
from .views import signup_request_code, validate_code_and_create_user, login_user, current_user_view, update_profile, oauth2_redirect_view

urlpatterns = [
    path('api/signup/code/', signup_request_code, name='signup-request-code'),
    path('api/signup/verify/', validate_code_and_create_user, name='signup-verify'),
    path('api/login/', login_user, name='login-user'),
    path('api/user/me/', current_user_view, name='current-user'),

    path('api/auth/', include('dj_rest_auth.urls')),
    path('api/auth/registration/', include('dj_rest_auth.registration.urls')),
    path('api/user/update/', update_profile, name='update-profile'),
    path('accounts/google/redirect/', oauth2_redirect_view),

]
