// hooks/useConversation.ts
"use client";

import useSWR, { useSWRConfig } from "swr";
import { useState, useEffect } from "react";

type Message = {
  id: string;
  conversationId: string;
  sender: "user" | "ai";
  content: string;
  createdAt: Date;
};

type ConversationData = {
  conversationName: string;
  pdfName: string;
  messages: Message[];
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useConversation(convoId?: string) {
  const { mutate } = useSWRConfig();
  const [optimisticMessages, setOptimisticMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const { data, error, isLoading } = useSWR(
    convoId ? `/api/conversations/${convoId}` : null,
    fetcher
  );

  // Reset optimistic messages when data changes
  useEffect(() => {
    if (data?.messages) {
      setOptimisticMessages([]);
    }
  }, [data?.messages]);

  // Combine server messages with optimistic messages, ensuring unique IDs
  const allMessages = [
    ...(data?.messages || []),
    ...optimisticMessages.filter(
      (optMsg) =>
        !(data?.messages || []).some(
          (serverMsg: Message) =>
            serverMsg.content === optMsg.content &&
            serverMsg.sender === optMsg.sender
        )
    ),
  ];

  const addOptimisticMessage = (message: Omit<Message, "id">) => {
    const newMessage: Message = {
      ...message,
      id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    setOptimisticMessages((prev) => [...prev, newMessage]);
    return newMessage.id;
  };

  const updateOptimisticMessage = (tempId: string, content: string) => {
    setOptimisticMessages((prev) =>
      prev.map((msg) => (msg.id === tempId ? { ...msg, content } : msg))
    );
  };

  const removeOptimisticMessage = (tempId: string) => {
    setOptimisticMessages((prev) => prev.filter((msg) => msg.id !== tempId));
  };

  const clearOptimisticMessages = () => {
    setOptimisticMessages([]);
  };

  console.log(data);
  return {
    conversationName: data?.conversationName || "Untitled Conversation",
    pdfName: data?.pdfName || "",
    messages: allMessages,
    isLoading,
    isError: error,
    isProcessing,
    setIsProcessing,
    mutate,
    addOptimisticMessage,
    updateOptimisticMessage,
    removeOptimisticMessage,
    clearOptimisticMessages,
  };
}
