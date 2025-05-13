from django.urls import path
from .views import analyze_code_view, get_chats, create_chat, chat_history, delete_chat

urlpatterns = [
    path('api/analyze/', analyze_code_view, name='analyze_code'),
    path('api/chats/', get_chats, name='get_chats'),
    path('api/chats/create/', create_chat, name='create_chat'),
    path('api/chat/<int:chat_id>/history/', chat_history, name='chat_history'),
    path('api/chat/<int:chat_id>/delete/', delete_chat, name='delete_chat'),

]
