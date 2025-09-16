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

    // Add placeholder AI message for streaming
    const aiMessageId = (Date.now() + 1).toString();
    const aiMessage = {
      id: aiMessageId,
      conversationId: convoId,
      sender: "ai" as const,
      content: "",
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
      setLoading(false);
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.chunk) {
                  // Update the AI message content with the accumulated text
                  updateMessage(aiMessageId, data.fullText);
                }
              } catch (e) {
                console.error("Error parsing stream data:", e);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Error during streaming:", error);

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
