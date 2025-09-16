"use client";
import { startNewConversation } from "@/actions/startNewConversation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useConversations } from "@/hooks/get-user-conversations";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export function NewConversationDialog({
  dialogOpen,
  setDialogOpen,
  pdfId,
}: {
  dialogOpen: boolean;
  setDialogOpen: (dialogOpen: boolean) => void;
  pdfId: string;
}) {
  const [title, setTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { refreshConversations } = useConversations();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await startNewConversation({ pdfId, title });

      setDialogOpen(false);
      setTitle("");

      if (res.success) {
        refreshConversations();
        router.push(`/chat/${res.conversationId}`);
      }
    } catch (error) {
      console.error("Failed to start conversation:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit} className="space-y-6">
          <DialogHeader className="text-center space-y-3">
            {/* <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <MessageSquarePlus className="h-6 w-6 text-primary" />
            </div> */}
            <DialogTitle className="text-xl font-semibold">
              New Conversation
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Start chatting with your PDF. Give your conversation a memorable
              name.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            {/* <Label htmlFor="conversation-name" className="text-sm font-medium">
              Conversation Name
            </Label> */}
            <Input
              id="conversation-name"
              placeholder="e.g., Chapter 1 Discussion"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={isSubmitting}
              className="h-11"
              autoFocus
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button
                variant="outline"
                disabled={isSubmitting}
                className="flex-1 sm:flex-none"
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="flex-1 sm:flex-none ms-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Start Conversation"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
