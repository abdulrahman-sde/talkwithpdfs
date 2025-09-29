// hooks/useConversation.ts
"use client";

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

export function useConversation(convoId?: string) {
  const [data, setData] = useState<ConversationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch conversation data
  const fetchConversation = async () => {
    if (!convoId) return;

    setIsLoading(true);
    setIsError(false);

    try {
      const response = await fetch(`/api/conversations/${convoId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch conversation");
      }
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Error fetching conversation:", error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Load conversation on mount or convoId change
  useEffect(() => {
    fetchConversation();
  }, [convoId]);

  // Add message to state
  const addMessage = (message: Message) => {
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        messages: [...prev.messages, message],
      };
    });
  };

  // Update specific message in state
  const updateMessage = (messageId: string, content: string) => {
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        messages: prev.messages.map((msg) =>
          msg.id === messageId ? { ...msg, content } : msg
        ),
      };
    });
  };

  // Remove message from state
  const removeMessage = (messageId: string) => {
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        messages: prev.messages.filter((msg) => msg.id !== messageId),
      };
    });
  };

  // Refresh data from server
  const refetchConversation = () => {
    fetchConversation();
  };

  console.log(data);
  return {
    conversationName: data?.conversationName || "Untitled Conversation",
    pdfName: data?.pdfName || "",
    messages: data?.messages || [],
    isLoading,
    isError,
    isProcessing,
    setIsProcessing,
    addMessage,
    updateMessage,
    removeMessage,
    refetchConversation,
  };
}
