"use client";

import { LucideIcon } from "lucide-react";
import { Text, CheckCheck, ArrowDownWideNarrow } from "lucide-react";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useAutoResizeTextarea } from "@/hooks/use-auto-resize-textarea";
import { Button } from "./button";
import { ArrowUp } from "lucide-react";

interface ActionItem {
  text: string;
  icon: LucideIcon;
  colors: {
    icon: string;
    border: string;
    bg: string;
  };
  onClick: (text: string) => void; // Custom function for each action
}

interface AIInputWithSuggestionsProps {
  id?: string;
  placeholder?: string;
  minHeight?: number;
  maxHeight?: number;
  actions?: ActionItem[];
  className?: string;
  getAiResponse: (input: string) => void;
}

const DEFAULT_ACTIONS: ActionItem[] = [
  {
    text: "Summary",
    icon: Text,
    colors: {
      icon: "text-orange-600",
      border: "border-orange-500",
      bg: "bg-orange-100",
    },
    onClick: (text: string) => console.log(`Summarizing: ${text}`),
  },
  {
    text: "Fix Spelling and Grammar",
    icon: CheckCheck,
    colors: {
      icon: "text-emerald-600",
      border: "border-emerald-500",
      bg: "bg-emerald-100",
    },
    onClick: (text: string) => console.log(`Proofreading: ${text}`),
  },
  {
    text: "Make shorter",
    icon: ArrowDownWideNarrow,
    colors: {
      icon: "text-purple-600",
      border: "border-purple-500",
      bg: "bg-purple-100",
    },
    onClick: (text: string) => console.log(`Condensing: ${text}`),
  },
];

export function AIInputWithSuggestions({
  id = "ai-input-with-actions",
  placeholder = "Enter your text here...",
  minHeight = 55,
  maxHeight = 200,
  // actions = DEFAULT_ACTIONS,
  className,
  getAiResponse,
}: AIInputWithSuggestionsProps) {
  const [inputValue, setInputValue] = useState("");
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight,
    maxHeight,
  });

  // const handleActionClick = (action: ActionItem) => {
  //   if (inputValue.trim()) {
  //     action.onClick(inputValue);
  //     setInputValue("");
  //     adjustHeight(true);
  //   }
  // };

  return (
    <div className={cn("w-full py-4 px-4 sm:px-0 ", className)}>
      <div className="relative w-full max-w-[360px] sm:max-w-2xl mx-auto">
        <div className="relative border border-black/10 dark:border-white/10 focus-within:border-black/20 dark:focus-within:border-white/20 rounded-2xl bg-black/[0.03] dark:bg-white/[0.03]">
          <div className="flex flex-col">
            <div
              className="overflow-y-auto flex"
              style={{ maxHeight: `${maxHeight}px` }}
            >
              <Textarea
                ref={textareaRef}
                id={id}
                placeholder={placeholder}
                className={cn(
                  "w-full rounded-2xl pr-10 pt-4.5 ps-3 pb-3 placeholder:text-black/70 dark:placeholder:text-white/70 border-none focus:ring text-black focus:ps-5 dark:text-white resize-none text-wrap bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 leading-[1.2] focus:placeholder:opacity-0",
                  `min-h-[${minHeight}px]  transition-all duration-300 placeholder:ps-2`
                )}
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  adjustHeight();
                }}
              />

              <Button
                className={`self-center mr-2 cursor-pointer ${
                  inputValue.length === 0 && "bg-gray-500"
                } rounded-full py-5 px-1`}
                disabled={inputValue.length === 0 ? true : false}
                onClick={() => {
                  getAiResponse(inputValue);
                  setInputValue("");
                  adjustHeight(true);
                }}
              >
                <ArrowUp className="w-[10px] h-[10px]" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
