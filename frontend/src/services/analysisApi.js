import axios from 'axios';

const BACKEND_URL = 'http://127.0.0.1:8000';

export async function analyzeCode(chatId, codeText) {
  const token = localStorage.getItem('access_token');

  if (!token) {
    throw new Error('Utilisateur non authentifié');
  }

  const response = await axios.post(
    `${BACKEND_URL}/api/analyze/`,
    {
      code: codeText,
      chat_id: chatId
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );

  return response.data;
}
