"use client";

import { AIInputWithSuggestions } from "@/components/ui/ai-input-with-suggestions";
import { Text, CheckCheck, ArrowDownWideNarrow } from "lucide-react";

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
  return (
    <div className="w-full h-full flex justify-center items-baseline-last">
      <div className="space-y-8 min-w-[350px] flex-1">
        <div>
          <AIInputWithSuggestions
            actions={CUSTOM_ACTIONS}
            placeholder="Enter text to process..."
          />
        </div>
      </div>
    </div>
  );
}
