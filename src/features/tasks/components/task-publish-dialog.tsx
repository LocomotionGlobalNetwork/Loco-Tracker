"use client";

import * as React from "react";
import { publishTaskAction } from "../actions";
import type { TaskWithRelations } from "../types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { Globe, Loader2, ShieldAlert } from "lucide-react";

interface TaskPublishDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: TaskWithRelations | null;
  projectId?: string;
  onSuccess?: () => void;
}

interface TaskPublishFormProps {
  task: TaskWithRelations;
  projectId?: string;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

function TaskPublishForm({
  task,
  projectId,
  onOpenChange,
  onSuccess,
}: TaskPublishFormProps) {
  const [url, setUrl] = React.useState(task.publication_url || "");
  const [note, setNote] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanUrl = url.trim();
    if (!cleanUrl) {
      setErrorMessage("Tautan publikasi (URL) wajib diisi.");
      return;
    }

    if (!/^https?:\/\/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/.*)?$/.test(cleanUrl)) {
      setErrorMessage("Format tautan tidak valid. Harus diawali dengan http:// atau https://.");
      return;
    }

    setIsSubmitting(true);

    const res = await publishTaskAction({
      taskId: task.id,
      publicationUrl: cleanUrl,
      publishNote: note.trim() || undefined,
      projectId: projectId || task.project_id,
    });

    if (!res.success) {
      const errorMsg = res.error || "Gagal mempublikasikan tugas.";
      setErrorMessage(errorMsg);
      toast.error(errorMsg);
      setIsSubmitting(false);
      return;
    }

    toast.success("Konten berhasil dipublikasikan.");
    setIsSubmitting(false);
    onOpenChange(false);
    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <DialogContent className="sm:max-w-lg md:max-w-xl max-h-[calc(100dvh-3.5rem)] flex flex-col p-0 gap-0 overflow-hidden shadow-2xl">
      <DialogHeader className="px-6 py-4 border-b border-border bg-card shrink-0 text-left">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
            <Globe className="size-4.5" />
          </div>
          <DialogTitle className="text-lg font-semibold tracking-tight">
            Publikasikan Konten
          </DialogTitle>
        </div>
        <DialogDescription className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mt-0.5">
          Tugas: <span className="font-medium text-foreground">{task.title}</span>
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
        <div className="px-6 py-5 overflow-y-auto flex-1 space-y-4 text-sm">
          {errorMessage && (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 flex items-start gap-2.5 text-xs sm:text-sm text-destructive font-medium">
              <ShieldAlert className="size-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="publish-url" className="text-xs sm:text-sm font-semibold text-foreground">
              Tautan Tayang (URL Live) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="publish-url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.instagram.com/p/..."
              className="h-9.5 text-sm"
              required
            />
            <p className="text-xs text-muted-foreground">
              Masukkan tautan postingan live di media sosial (Instagram, TikTok, YouTube, dll).
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="publish-note" className="text-xs sm:text-sm font-semibold text-foreground">
              Catatan Rilis (Opsional)
            </Label>
            <textarea
              id="publish-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Contoh: Tayang di Feed kolaborasi jam 12.00..."
              rows={2}
              className="w-full rounded-md border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring resize-none leading-relaxed"
            />
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t border-border bg-muted/20 shrink-0 gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="h-9.5 px-4 text-sm font-medium"
          >
            Batal
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={isSubmitting}
            className="h-9.5 px-4 text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-3.5 animate-spin mr-1.5" />
                <span>Memproses...</span>
              </>
            ) : (
              <>
                <Globe className="size-3.5 mr-1.5" />
                <span>Tandai Tayang</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

export function TaskPublishDialog({
  open,
  onOpenChange,
  task,
  projectId,
  onSuccess,
}: TaskPublishDialogProps) {
  if (!task) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open && (
        <TaskPublishForm
          task={task}
          projectId={projectId}
          onOpenChange={onOpenChange}
          onSuccess={onSuccess}
        />
      )}
    </Dialog>
  );
}
