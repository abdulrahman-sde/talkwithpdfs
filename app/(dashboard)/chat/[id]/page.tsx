"use client";

import { AIInputWithSuggestions } from "@/components/ui/ai-input-with-suggestions";
import { getRelevantChunks } from "@/actions/getRelevantChunks";
import { MessageBox } from "@/components/dashboard/message-box";
import { useParams } from "next/navigation";
import { useConversation } from "@/hooks/get-single-conversation";

export default function AIInputWithSuggestionsDemo() {
  const params = useParams();
  const convoId = params.id as string | undefined;
  const {
    messages,
    isLoading,
    isError,
    isProcessing,
    setIsProcessing,
    addMessage,
    updateMessage,
    refetchConversation,
  } = useConversation(convoId);

  console.log(messages);

  const getAiResponse = async (input: string) => {
    if (!convoId) return;

    setIsProcessing(true);

    // Add user message immediately
    const userMessage = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      conversationId: convoId,
      sender: "user" as const,
      content: input,
      createdAt: new Date(),
    };
    addMessage(userMessage);

    // Add placeholder AI message
    const aiMessageId = `ai-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    const aiMessage = {
      id: aiMessageId,
      conversationId: convoId,
      sender: "ai" as const,
      content: "Analyzing your question and conversation context...",
      createdAt: new Date(),
    };
    addMessage(aiMessage);

    try {
      const chunks = await getRelevantChunks(convoId, input);
      const contentArray = chunks.map((chunk) => chunk.content);
      const vectorContext = contentArray.join(" ");

      // Update AI message to show we're generating response
      updateMessage(
        aiMessageId,
        "Generating response based on relevant document sections..."
      );

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

      // Handle streaming response
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
                if (data.done) {
                  // Streaming complete, stop processing
                  setIsProcessing(false);
                }
              } catch (e) {
                console.error("Error parsing stream data:", e);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Error:", error);
      // Update AI message with error
      updateMessage(
        aiMessageId,
        "Sorry, I encountered an error processing your request."
      );
      setIsProcessing(false);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading conversation</div>;

  return (
    <div className="w-full h-full flex justify-between flex-col ">
      <div className="space-y-4">
        <MessageBox messages={messages} loading={isLoading || isProcessing} />
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
