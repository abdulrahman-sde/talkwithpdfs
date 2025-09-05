"use client";

import { LucideIcon } from "lucide-react";
import { Text, CheckCheck, ArrowDownWideNarrow } from "lucide-react";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useAutoResizeTextarea } from "@/hooks/use-auto-resize-textarea";

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
  minHeight = 64,
  maxHeight = 200,
  actions = DEFAULT_ACTIONS,
  className,
}: AIInputWithSuggestionsProps) {
  const [inputValue, setInputValue] = useState("");
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight,
    maxHeight,
  });

  const handleActionClick = (action: ActionItem) => {
    if (inputValue.trim()) {
      action.onClick(inputValue);
      setInputValue("");
      adjustHeight(true);
    }
  };

  return (
    <div className={cn("w-full py-4", className)}>
      <div className="relative max-w-xl w-full mx-auto">
        <div className="relative border border-black/10 dark:border-white/10 focus-within:border-black/20 dark:focus-within:border-white/20 rounded-2xl bg-black/[0.03] dark:bg-white/[0.03]">
          <div className="flex flex-col">
            <div
              className="overflow-y-auto"
              style={{ maxHeight: `${maxHeight}px` }}
            >
              <Textarea
                ref={textareaRef}
                id={id}
                placeholder={placeholder}
                className={cn(
                  "max-w-xl w-full rounded-2xl pr-10 pt-3 pb-3 placeholder:text-black/70 dark:placeholder:text-white/70 border-none focus:ring text-black dark:text-white resize-none text-wrap bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 leading-[1.2]",
                  `min-h-[${minHeight}px]`
                )}
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  adjustHeight();
                }}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5 mt-2 max-w-xl mx-auto justify-start px-4">
        <p className="text-sm mt-0.5">Quick Actions - </p>
        {actions.map(({ text, icon: Icon, colors, onClick }) => (
          <button
            type="button"
            key={text}
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded-full",
              "border transition-all duration-200",
              "border-black/10 dark:border-white/10 bg-white dark:bg-gray-900 hover:bg-black/5 dark:hover:bg-white/5",
              "flex-shrink-0"
            )}
            onClick={() =>
              handleActionClick({ text, icon: Icon, colors, onClick })
            }
          >
            <div className="flex items-center gap-1.5">
              <Icon className={cn("h-4 w-4", colors.icon)} />
              <span className="text-black/70 dark:text-white/70 whitespace-nowrap">
                {text}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
