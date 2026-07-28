import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 20000,
});

export async function predictClassification(payload: Record<string, unknown>) {
  const response = await api.post('/classification/predict', payload);
  return response.data;
}

export async function predictCausality(payload: Record<string, unknown>) {
  const response = await api.post('/causality/predict', payload);
  return response.data;
}

export async function predictRegression(payload: Record<string, unknown>) {
  const response = await api.post('/regression/predict', payload);
  return response.data;
}

export async function getClassificationMetrics() {
  const response = await api.get('/metrics/classification');
  return response.data;
}

export async function getCausalityMetrics() {
  const response = await api.get('/metrics/causality');
  return response.data;
}

export async function getRegressionMetrics() {
  const response = await api.get('/metrics/regression');
  return response.data;
}

export async function getDashboard() {
  const response = await api.get('/dashboard');
  return response.data;
}

export async function getDatasetSummary() {
  const response = await api.get('/dataset/summary');
  return response.data;
}

export async function getDatasetFeatures() {
  const response = await api.get('/dataset/features');
  return response.data;
}

export async function getDatasetStatistics() {
  const response = await api.get('/dataset/statistics');
  return response.data;
}

export async function searchDataset(query: string) {
  const response = await api.get(`/dataset/search?q=${encodeURIComponent(query)}`);
  return response.data;
}

export async function askChatbot(message: string, sessionId?: string) {
  const response = await api.post('/chatbot', { message, session_id: sessionId });
  return response.data;
}

export interface StoredConversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  last_message: string | null;
  message_count: number;
}

export interface StoredMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
}

export async function createChatConversation() {
  const response = await api.post('/chat/new', {});
  return response.data.conversation as StoredConversation;
}

export async function listChatConversations() {
  const response = await api.get('/chat/conversations');
  return response.data.conversations as StoredConversation[];
}

export async function loadChatConversation(conversationId: string) {
  const response = await api.get(`/chat/conversation/${conversationId}`);
  return response.data as { conversation: StoredConversation; messages: StoredMessage[] };
}

export async function sendPersistentChatMessage(conversationId: string, message: string) {
  const response = await api.post('/chat/message', {
    conversation_id: conversationId,
    message,
  });
  return response.data as { reply: string; sources: string[] };
}

export async function deleteChatConversation(conversationId: string) {
  await api.delete(`/chat/conversation/${conversationId}`);
}

export async function getVisualization(kind: 'classification' | 'causality' | 'regression') {
  const response = await api.get(`/visualization/${kind}`);
  return response.data;
}
