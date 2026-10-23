"use client";

import * as React from "react";
import { recordTaskClientVerdictAction } from "../actions";
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
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { CheckCircle2, AlertTriangle, Loader2, ShieldAlert, FileText } from "lucide-react";

interface TaskClientReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: TaskWithRelations | null;
  projectId?: string;
  onSuccess?: () => void;
}

interface TaskClientReviewFormProps {
  task: TaskWithRelations;
  projectId?: string;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

function TaskClientReviewForm({
  task,
  projectId,
  onOpenChange,
  onSuccess,
}: TaskClientReviewFormProps) {
  const [verdict, setVerdict] = React.useState<"APPROVED" | "REVISION_REQUESTED">("APPROVED");
  const [feedback, setFeedback] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (verdict === "REVISION_REQUESTED" && !feedback.trim()) {
      setErrorMessage("Catatan feedback revisi klien wajib diisi saat meminta revisi.");
      return;
    }

    setIsSubmitting(true);

    const res = await recordTaskClientVerdictAction({
      taskId: task.id,
      verdict,
      feedback: feedback.trim(),
      projectId: projectId || task.project_id,
    });

    if (!res.success) {
      const errorMsg = res.error || "Gagal mencatat keputusan review klien.";
      setErrorMessage(errorMsg);
      toast.error(errorMsg);
      setIsSubmitting(false);
      return;
    }

    toast.success(
      verdict === "APPROVED"
        ? "Tugas berhasil disetujui klien."
        : "Permintaan revisi klien berhasil dicatat."
    );

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
          <div className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary shrink-0">
            <FileText className="size-4.5" />
          </div>
          <DialogTitle className="text-lg font-semibold tracking-tight">
            Catat Review Klien
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

        {/* Verdict Selection */}
        <div className="space-y-2">
          <Label className="text-xs sm:text-sm font-semibold text-foreground">
            Keputusan Klien
          </Label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setVerdict("APPROVED")}
              className={`flex flex-col items-center justify-center gap-2 rounded-lg border p-3.5 text-center transition-all cursor-pointer ${
                verdict === "APPROVED"
                  ? "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/30"
                  : "border-border hover:bg-muted/40 text-muted-foreground"
              }`}
            >
              <CheckCircle2 className="size-5 text-emerald-500" />
              <span className="font-semibold text-xs sm:text-sm text-foreground">
                Disetujui Klien
              </span>
              <span className="text-xs text-muted-foreground">
                Materi di-ACC, siap tayang
              </span>
            </button>

            <button
              type="button"
              onClick={() => setVerdict("REVISION_REQUESTED")}
              className={`flex flex-col items-center justify-center gap-2 rounded-lg border p-3.5 text-center transition-all cursor-pointer ${
                verdict === "REVISION_REQUESTED"
                  ? "border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-300 ring-2 ring-amber-500/30"
                  : "border-border hover:bg-muted/40 text-muted-foreground"
              }`}
            >
              <AlertTriangle className="size-5 text-amber-500" />
              <span className="font-semibold text-xs sm:text-sm text-foreground">
                Minta Revisi
              </span>
              <span className="text-xs text-muted-foreground">
                Kembali ke tim kreatif
              </span>
            </button>
          </div>
        </div>

        {/* Feedback Notes */}
        <div className="space-y-1.5">
          <Label htmlFor="client-feedback" className="text-xs sm:text-sm font-semibold text-foreground">
            {verdict === "REVISION_REQUESTED" ? (
              <>
                Catatan Revisi Klien <span className="text-destructive">*</span>
              </>
            ) : (
              "Catatan Tambahan (Opsional)"
            )}
          </Label>
          <textarea
            id="client-feedback"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder={
              verdict === "REVISION_REQUESTED"
                ? "Tuliskan detail perbaikan yang diminta klien (misal: perbesar logo, ganti headline slide 2)..."
                : "Catatan atau apresiasi klien (opsional)..."
            }
            rows={3}
            className="w-full rounded-md border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring resize-none leading-relaxed"
          />
          {verdict === "REVISION_REQUESTED" && (
            <p className="text-xs text-muted-foreground">
              Tugas akan otomatis dialihkan kembali ke kreator dan wajib melalui QC Creative Director ulang setelah revisi selesai.
            </p>
          )}
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
          className={`h-9.5 px-4 text-sm font-medium ${
            verdict === "APPROVED"
              ? "bg-emerald-600 hover:bg-emerald-700 text-white"
              : "bg-amber-600 hover:bg-amber-700 text-white"
          }`}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-3.5 animate-spin mr-1.5" />
              <span>Menyimpan...</span>
            </>
          ) : verdict === "APPROVED" ? (
            <>
              <CheckCircle2 className="size-3.5 mr-1.5" />
              <span>Simpan Approval Klien</span>
            </>
          ) : (
            <>
              <AlertTriangle className="size-3.5 mr-1.5" />
              <span>Kirim Revisi ke Tim</span>
            </>
          )}
        </Button>
      </DialogFooter>
    </form>
  </DialogContent>
  );
}

export function TaskClientReviewDialog({
  open,
  onOpenChange,
  task,
  projectId,
  onSuccess,
}: TaskClientReviewDialogProps) {
  if (!task) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open && (
        <TaskClientReviewForm
          task={task}
          projectId={projectId}
          onOpenChange={onOpenChange}
          onSuccess={onSuccess}
        />
      )}
    </Dialog>
  );
}
