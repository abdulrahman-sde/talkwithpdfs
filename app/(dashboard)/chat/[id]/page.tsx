"use client";

import { AIInputWithSuggestions } from "@/components/ui/ai-input-with-suggestions";
import { getRelevantChunks } from "@/actions/getRelevantChunks";
import { MessageBox } from "@/components/dashboard/message-box";
import { useParams } from "next/navigation";
import { useConversation } from "@/hooks/get-single-conversation";

// const CUSTOM_ACTIONS = [
//   {
//     text: "Summarize",
//     icon: Text,
//     colors: {
//       icon: "text-blue-600",
//       border: "border-blue-500",
//       bg: "bg-blue-100",
//     },
//     onClick: (text: string) => alert(`Summarizing: ${text}`),
//   },
//   {
//     text: "Proofread",
//     icon: CheckCheck,
//     colors: {
//       icon: "text-green-600",
//       border: "border-green-500",
//       bg: "bg-green-100",
//     },
//     onClick: (text: string) => alert(`Proofreading: ${text}`),
//   },
//   {
//     text: "Condense",
//     icon: ArrowDownWideNarrow,
//     colors: {
//       icon: "text-purple-600",
//       border: "border-purple-500",
//       bg: "bg-purple-100",
//     },
//     onClick: (text: string) => alert(`Condensing: ${text}`),
//   },
// ];

type Messages = {
  id: string;
  conversationId: string;
  sender: "user" | "ai";
  content: string;
  createdAt: Date;
}[];

export default function AIInputWithSuggestionsDemo() {
  const params = useParams();
  const convoId = params.id as string | undefined;
  const {
    messages,
    isLoading,
    isError,
    isProcessing,
    setIsProcessing,
    mutate,
    addOptimisticMessage,
    updateOptimisticMessage,
    clearOptimisticMessages,
  } = useConversation(convoId);

  console.log(messages);

  const getAiResponse = async (input: string) => {
    if (!convoId) return;

    setIsProcessing(true);

    // Add user message optimistically
    const userMessageId = addOptimisticMessage({
      conversationId: convoId,
      sender: "user",
      content: input,
      createdAt: new Date(),
    });

    // Add placeholder AI message optimistically
    const aiMessageId = addOptimisticMessage({
      conversationId: convoId,
      sender: "ai",
      content: "",
      createdAt: new Date(),
    });

    try {
      const chunks = await getRelevantChunks(convoId, input);
      const contentArray = chunks.map((chunk) => chunk.content);
      const vectorContext = contentArray.join(" ");

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
                  updateOptimisticMessage(aiMessageId, data.fullText);
                }
                if (data.done) {
                  // Streaming complete, refresh data and clear optimistic messages
                  mutate(`/api/conversations/${convoId}`);
                  setTimeout(() => {
                    clearOptimisticMessages();
                  }, 500);
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
      updateOptimisticMessage(
        aiMessageId,
        "Sorry, I encountered an error processing your request."
      );
    } finally {
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
