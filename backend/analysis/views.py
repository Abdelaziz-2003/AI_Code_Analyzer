from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import CodeEntry, AnalysisResult, Chat
from .ai_code.analysis_ai import analyse_code_input  # import du module IA

@api_view(['POST'])
def create_chat(request):
    title = request.data.get('title', 'Nouvelle discussion')
    chat = Chat.objects.create(title=title)
    return Response({'chat_id': chat.id, 'title': chat.title})

@api_view(['GET'])
def get_chats(request):
    chats = Chat.objects.all().order_by('-created_at')
    data = [{'id': c.id, 'title': c.title} for c in chats]
    return Response(data)

@api_view(['POST'])
def analyze_code_view(request):
    chat_id = request.data.get('chat_id')
    code_content = request.data.get('code', '')

    chat = Chat.objects.get(id=chat_id)
    code_entry = CodeEntry.objects.create(chat=chat, code_content=code_content)
    result = analyse_code_input(code_content)

    AnalysisResult.objects.create(
        code_entry=code_entry,
        response_text=result["gpt_suggestion"],
        language_detected=result["language_detected"],
    )

    return Response({
        "code_entry_id": code_entry.id,
        "language_detected": result["language_detected"],
        "gpt_suggestion": result["gpt_suggestion"]
    })

@api_view(['GET'])
def chat_history(request, chat_id):
    try:
        chat = Chat.objects.get(id=chat_id)
    except Chat.DoesNotExist:
        return Response({'error': 'Chat not found'}, status=404)

    entries = CodeEntry.objects.filter(chat=chat).order_by('created_at')
    history = []

    for entry in entries:
        # message utilisateur
        history.append({
            'sender': 'user',
            'text': entry.code_content
        })

        # réponse IA (s’il y a une)
        result = entry.results.first()
        if result:
            history.append({
                'sender': 'bot',
                'result': {
                    'language_detected': getattr(result, 'language_detected', ''),
                    'gpt_suggestion': result.response_text
                }
            })

    return Response(history)


@api_view(['DELETE'])
def delete_chat(request, chat_id):
    try:
        chat = Chat.objects.get(id=chat_id)
        chat.delete()
        return Response({'message': 'Chat supprimé avec succès'})
    except Chat.DoesNotExist:
        return Response({'error': 'Chat non trouvé'}, status=404)
