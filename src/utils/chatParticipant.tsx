import type { ChatResponse } from "@/types";
import api from "@/utils/api";

export default function getOtherParticipant(
  chat: ChatResponse | null,
  userId: number | null = null,
) {
  if (!chat || !userId) {
    return null;
  }

  const otherParticipant =
    chat.participants_detail[0].id === userId
      ? chat.participants_detail[1]
      : chat.participants_detail[0];

  return otherParticipant;
}

export async function getOtherParticipantFromChatId(
  chatId: number | null,
  userId: number | null = null,
) {
  if (!chatId || !userId) {
    return null;
  }

  try {
    const response = await api<ChatResponse>(`/chats/${chatId}/`);
    if (response.status !== 200) {
      return null;
    }

    const chat = response.data;
    if (!chat) {
      return null;
    }

    return getOtherParticipant(chat, userId);
  } catch (error) {
    console.error("Error fetching chat details:", error);
    return null;
  }
}
