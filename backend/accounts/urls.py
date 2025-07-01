from django.urls import path
from .views import (
    signup_request_code,
    validate_code_and_create_user,
    login_user,
    current_user_view,
    update_profile,
    password_reset_request_code,
    password_reset_confirm,
)

urlpatterns = [
    path('api/signup/code/', signup_request_code),
    path('api/signup/verify/', validate_code_and_create_user),
    path('api/login/', login_user),
    path('api/user/me/', current_user_view),
    path('api/user/update/', update_profile),
    path('api/password-reset/code/', password_reset_request_code),
    path('api/password-reset/confirm/', password_reset_confirm),

]
