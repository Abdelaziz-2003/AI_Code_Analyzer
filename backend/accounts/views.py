import random
import logging
from datetime import timedelta
from django.utils import timezone
from django.core.mail import send_mail
from django.contrib.auth import get_user_model, authenticate
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import AllowAny
from django.views.decorators.csrf import csrf_exempt
from .models import EmailVerificationCode

User = get_user_model()
logger = logging.getLogger(__name__)

@api_view(['POST'])
def signup_request_code(request):
    email = request.data.get('email')
    if not email:
        return Response({'error': 'Email requis'}, status=400)

    if User.objects.filter(email=email).exists():
        return Response({'error': 'Cet email est déjà utilisé'}, status=400)

    code = random.randint(100000, 999999)
    EmailVerificationCode.objects.update_or_create(
        email=email,
        defaults={'code': str(code), 'created_at': timezone.now()}
    )

    send_mail(
        subject='Votre code de vérification',
        message=f'Votre code est : {code} (valable 1 minute)',
        from_email=None,
        recipient_list=[email]
    )
    return Response({'message': 'Code envoyé à votre adresse email'})


@api_view(['POST'])
def validate_code_and_create_user(request):
    email = request.data.get('email')
    code = request.data.get('code')
    password = request.data.get('password')
    first_name = request.data.get('first_name')
    last_name = request.data.get('last_name')

    if not all([email, code, password, first_name, last_name]):
        return Response({'error': 'Champs manquants'}, status=400)

    try:
        record = EmailVerificationCode.objects.get(email=email, code=code)
        if not record.is_valid():
            return Response({'error': 'Code expiré'}, status=400)
    except EmailVerificationCode.DoesNotExist:
        return Response({'error': 'Code invalide'}, status=400)

    if User.objects.filter(email=email).exists():
        return Response({'error': 'Utilisateur déjà existant'}, status=400)

    user = User.objects.create_user(
        email=email,
        password=password,
        is_verified=True,
        first_name=first_name,
        last_name=last_name
    )
    record.delete()
    return Response({'message': 'Compte créé avec succès'})

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny]) 
def login_user(request):
    email = request.data.get('email')
    password = request.data.get('password')
    user = authenticate(email=email, password=password)

    if user is None:
        return Response({'error': 'Identifiants invalides'}, status=401)
    if not user.is_verified:
        return Response({'error': 'Email non vérifié'}, status=403)

    refresh = RefreshToken.for_user(user)
    return Response({
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user_view(request):
    user = request.user
    return Response({
        "email": user.email,
        "username": user.username,
        "first_name": user.first_name,
        "last_name": user.last_name,
    })


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    user = request.user
    user.first_name = request.data.get('first_name', user.first_name)
    user.last_name = request.data.get('last_name', user.last_name)
    user.is_profile_complete = True
    user.save()
    return Response({'message': 'Profil mis à jour'})


@api_view(['POST'])
def password_reset_request_code(request):
    email = request.data.get('email')
    if not email:
        return Response({'error': 'Email requis'}, status=400)

    if not User.objects.filter(email=email).exists():
        return Response({'error': 'Aucun utilisateur avec cet email'}, status=404)

    code = random.randint(100000, 999999)
    EmailVerificationCode.objects.update_or_create(
        email=email,
        defaults={'code': str(code), 'created_at': timezone.now()}
    )

    send_mail(
        subject='Réinitialisation du mot de passe',
        message=f'Votre code est : {code} (valable 1 minute)',
        from_email=None,
        recipient_list=[email]
    )
    return Response({'message': 'Code envoyé pour réinitialiser le mot de passe'})



@api_view(['POST'])
def password_reset_confirm(request):
    email = request.data.get('email')
    code = request.data.get('code')
    new_password = request.data.get('new_password')

    if not all([email, code, new_password]):
        return Response({'error': 'Champs manquants'}, status=400)

    try:
        record = EmailVerificationCode.objects.get(email=email, code=code)
        if not record.is_valid():
            return Response({'error': 'Code expiré'}, status=400)
    except EmailVerificationCode.DoesNotExist:
        return Response({'error': 'Code invalide'}, status=400)

    try:
        user = User.objects.get(email=email)
        user.set_password(new_password)
        user.save()
        record.delete()
        return Response({'message': 'Mot de passe réinitialisé avec succès'})
    except User.DoesNotExist:
        return Response({'error': 'Utilisateur introuvable'}, status=404)
