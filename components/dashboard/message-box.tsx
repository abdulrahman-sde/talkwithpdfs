// "use client";

// import { useRef, useEffect, useState } from "react";
// import { Avatar, AvatarFallback } from "@/components/ui/avatar";
// import { Sparkles } from "lucide-react";
// import { cn } from "@/lib/utils";
// import { mockMessages } from "@/constants/constant";

// type Messages = {
//   id: string;
//   conversationId?: string;
//   sender: "user" | "ai";
//   content: string;
//   createdAt: Date;
// }[];

// export function MessageBox({ messages = [] }: { messages: Messages }) {
//   const messagesEndRef = useRef<HTMLDivElement>(null);

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   };

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages]);

//   const formatTime = (date: Date) => {
//     return new Intl.DateTimeFormat("en-US", {
//       hour: "2-digit",
//       minute: "2-digit",
//     }).format(date);
//   };
//   return (
//     <div className="flex flex-col max-h-[80dvh] max-w-[1000px] mx-auto ">
//       {/* Messages Area */}
//       <div className="flex-1 overflow-y-auto message-box">
//         {messages.length === 0 ? (
//           // Empty state with greeting
//           <div className="flex flex-col items-center justify-center h-full mt-[-60px] px-6 text-center">
//             <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
//               <Sparkles className="w-8 h-8 text-primary" />
//             </div>
//             <h2 className="text-2xl font-semibold text-foreground mb-3 text-balance">
//               No messages yet
//             </h2>
//             <p className="text-muted-foreground max-w-md text-balance leading-relaxed">
//               Once messages are available, they will show up here.
//             </p>
//           </div>
//         ) : (
//           // Messages list
//           <div className="px-3 py-6 space-y-6 ">
//             {messages.map((message) => (
//               <div
//                 key={message.id}
//                 className={cn(
//                   "flex gap-5",
//                   message.sender === "user" ? "ml-auto flex-row-reverse" : ""
//                 )}
//               >
//                 <Avatar className="w-8 h-8 shrink-0">
//                   <AvatarFallback
//                     className={cn(
//                       "text-xs font-medium",
//                       message.sender === "user"
//                         ? "bg-primary text-primary-foreground"
//                         : "bg-muted text-muted-foreground"
//                     )}
//                   >
//                     {message.sender === "user" ? "U" : "AI"}
//                   </AvatarFallback>
//                 </Avatar>

//                 <div
//                   className={cn(
//                     "flex flex-col gap-1",
//                     message.sender === "user" ? "items-end" : "items-start"
//                   )}
//                 >
//                   <div
//                     className={cn(
//                       "rounded-2xl px-4 py-3 max-w-2xl",
//                       message.sender === "user"
//                         ? "bg-primary text-primary-foreground"
//                         : "bg-muted/50 text-foreground border border-border/50"
//                     )}
//                   >
//                     <p className="text-sm leading-relaxed whitespace-pre-wrap">
//                       {message.content}
//                     </p>
//                   </div>
//                   <span className="text-xs text-muted-foreground px-2">
//                     {formatTime(message.createdAt)}
//                   </span>
//                 </div>
//               </div>
//             ))}
//             <div ref={messagesEndRef} />
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

"use client";

import { useRef, useEffect } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sparkles, MessageCircle, Zap, Brain } from "lucide-react";
import { cn } from "@/lib/utils";
import { BlurFade } from "../magicui/blur-fade";
import { UserButton } from "@clerk/nextjs";
import AIResponseLoader from "../loaders/text-shimmer";

type Messages = {
  id: string;
  conversationId?: string;
  sender: "user" | "ai";
  content: string;
  createdAt: Date;
}[];

export function MessageBox({
  messages = [],
  loading,
}: {
  messages: Messages;
  loading: boolean;
}) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <div className="flex flex-col max-h-[80dvh] max-w-[1000px] mx-auto">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto message-box">
        {messages.length === 0 ? (
          // Simple minimal empty state
          <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
            <section id="header">
              <BlurFade delay={0.25} inView>
                <h2 className="text-3xl font-bold  sm:text-5xl xl:text-6xl/none">
                  Hello Abdul Rahman 👋
                </h2>
              </BlurFade>
              <BlurFade delay={0.25 * 2} inView>
                <span className="text-pretty text-xl sm:text-3xl xl:text-4xl/none">
                  Ask any question about Pdf
                </span>
              </BlurFade>
            </section>
          </div>
        ) : (
          // Messages list
          <div className="px-3 py-6 space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-5",
                  message.sender === "user" ? "ml-auto flex-row-reverse" : ""
                )}
              >
                {message.sender === "user" ? (
                  <UserButton />
                ) : (
                  <Avatar className="w-8 h-8 shrink-0">
                    <AvatarFallback
                      className={cn(
                        "text-xs font-medium",
                        "bg-muted text-muted-foreground"
                      )}
                    >
                      AI
                    </AvatarFallback>
                  </Avatar>
                )}

                <div
                  className={cn(
                    "flex flex-col gap-1",
                    message.sender === "user" ? "items-end" : "items-start"
                  )}
                >
                  <div
                    className={cn(
                      "rounded-2xl pt-1 pb-3 max-w-2xl",
                      message.sender === "user"
                        ? "bg-primary text-primary-foreground px-4 py-3"
                        : "text-foreground"
                    )}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {message.content.trim()}
                    </p>
                  </div>
                  {/* <span className="text-xs text-muted-foreground px-2">
                    {formatTime(message.createdAt)}
                  </span> */}
                </div>
              </div>
            ))}
            {loading && (
              <div className="mt-[-52px]">
                <AIResponseLoader />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
    </div>
  );
}
