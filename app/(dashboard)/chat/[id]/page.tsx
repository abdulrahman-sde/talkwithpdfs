"use client";

import { AIInputWithSuggestions } from "@/components/ui/ai-input-with-suggestions";
import { Text, CheckCheck, ArrowDownWideNarrow } from "lucide-react";
import { useState } from "react";
import { getRelevantChunks } from "@/actions/getRelevantChunks";

const CUSTOM_ACTIONS = [
  {
    text: "Summarize",
    icon: Text,
    colors: {
      icon: "text-blue-600",
      border: "border-blue-500",
      bg: "bg-blue-100",
    },
    onClick: (text: string) => alert(`Summarizing: ${text}`),
  },
  {
    text: "Proofread",
    icon: CheckCheck,
    colors: {
      icon: "text-green-600",
      border: "border-green-500",
      bg: "bg-green-100",
    },
    onClick: (text: string) => alert(`Proofreading: ${text}`),
  },
  {
    text: "Condense",
    icon: ArrowDownWideNarrow,
    colors: {
      icon: "text-purple-600",
      border: "border-purple-500",
      bg: "bg-purple-100",
    },
    onClick: (text: string) => alert(`Condensing: ${text}`),
  },
];

export default function AIInputWithSuggestionsDemo() {
  const [messages, setMessages] = useState();
  const conversationId = "d36dd1d2-9f12-4cce-831d-480da764a882";

  const getAiResponse = async (input: string) => {
    const chunks = await getRelevantChunks(conversationId, input);
    console.log(chunks);
    const contentArray = chunks.map((chunk) => chunk.content);
    const vectorContext = contentArray.join(" ");

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json", // don't forget this!
      },
      body: JSON.stringify({
        prompt: input, // ✅ fixed
        vectorContext, // ✅ now actual text
      }),
    });

    const { text } = await res.json();
    console.log(text);
  };

  return (
    <div className="w-full h-full flex justify-center ">
      <div className="space-y-4">
        <p>Message Box </p>
      </div>
      <div className="space-y-8 min-w-[350px] self-baseline-last flex-1">
        <div>
          <AIInputWithSuggestions
            actions={CUSTOM_ACTIONS}
            placeholder="Enter text to process..."
            getAiResponse={getAiResponse}
          />
        </div>
      </div>
    </div>
  );
}
