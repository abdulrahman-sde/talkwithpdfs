"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function ConversationSkeleton() {
  return (
    <div className="mb-3">
      {/* Parent (abdulrahman / lecture...) */}
      <Skeleton className="h-[18px] w-[150px] rounded-md" />
      <div className="pl-4 mt-3">
        {/* Child (New Conversation) */}
        <Skeleton className="h-[16px] w-[160px] mb-2 rounded-md" />
        <Skeleton className="h-[16px] w-[160px] mb-2 rounded-md" />
        <Skeleton className="h-[16px] w-[160px] mb-2 rounded-md" />
      </div>
    </div>
  );
}
