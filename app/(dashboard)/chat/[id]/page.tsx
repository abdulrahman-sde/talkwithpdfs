"use client";

import { AIInputWithSuggestions } from "@/components/ui/ai-input-with-suggestions";
import { getRelevantChunks } from "@/actions/getRelevantChunks";
import { MessageBox } from "@/components/dashboard/message-box";
import { useParams } from "next/navigation";
import { useConversation } from "@/hooks/get-single-conversation";
import { useState } from "react";
import { toast } from "sonner";

export default function AIInputWithSuggestionsDemo() {
  const params = useParams();
  const convoId = params.id as string | undefined;
  const [loading, setLoading] = useState(false);
  const { messages, isLoading, isError, addMessage, updateMessage } =
    useConversation(convoId);

  const getAiResponse = async (input: string) => {
    if (!convoId) return;
    // Add user message optimistically
    const userMessage = {
      id: Date.now().toString(),
      conversationId: convoId,
      sender: "user" as const,
      content: input,
      createdAt: new Date(),
    };
    addMessage(userMessage);
    setLoading(true);

    // Add placeholder AI message
    const aiMessageId = (Date.now() + 1).toString();
    const aiMessage = {
      id: aiMessageId,
      conversationId: convoId,
      sender: "ai" as const,
      content: "Thinking...",
      createdAt: new Date(),
    };

    addMessage(aiMessage);

    const chunks = await getRelevantChunks(convoId, input);
    const contentArray = chunks.map((chunk) => chunk.content);
    const vectorContext = contentArray.join(" ");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversationId: convoId,
          prompt: input,
          vectorContext,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to get AI response");
      }

      const result = await res.json();
      setLoading(false);

      if (result.success && result.text) {
        // Update the AI message with the response
        updateMessage(aiMessageId, result.text);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Error during chat:", error);
      setLoading(false);
      // Update the AI message with an error
      updateMessage(
        aiMessageId,
        "Sorry, I encountered an error processing your request."
      );
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (isError) return toast.error("Error loading Conversation");

  return (
    <div className="w-full h-full flex justify-between flex-col ">
      <div className="space-y-4">
        <MessageBox messages={messages} loading={loading} />
        {/* {loading && <AIResponseLoader />} */}
      </div>
      <div className="space-y-8 self-center  max-w-[700px] w-full ">
        <AIInputWithSuggestions
          // actions={CUSTOM_ACTIONS}
          placeholder="Enter text to process..."
          getAiResponse={getAiResponse}
        />
      </div>
    </div>
  );
}
