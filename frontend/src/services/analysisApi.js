import axios from 'axios';

const BACKEND_URL = 'http://127.0.0.1:8000';

export async function analyzeCode(chatId, codeText) {
  const response = await axios.post(`${BACKEND_URL}/api/analyze/`, {
    code: codeText,
    chat_id: chatId
  });
  return response.data;
}