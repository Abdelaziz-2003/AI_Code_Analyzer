from django.db import models
from django.conf import settings

class Chat(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='chats')
    title = models.CharField(max_length=255, default="Nouvelle discussion")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class CodeEntry(models.Model):
    chat = models.ForeignKey(Chat, on_delete=models.CASCADE, related_name='entries', null=True)
    code_content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

class AnalysisResult(models.Model):
    code_entry = models.ForeignKey(CodeEntry, on_delete=models.CASCADE, related_name='results')
    response_text = models.TextField()
    language_detected = models.CharField(max_length=100, default='')
    created_at = models.DateTimeField(auto_now_add=True)