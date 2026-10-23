"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { briefFormSchema, type BriefFormData } from "../schemas";
import { saveBriefAction } from "../actions";
import type { BriefDetail } from "../types";
import { AlertCircle, FileText, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";

interface BriefFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  initialData?: BriefDetail | null;
  onSuccess?: () => void;
}

export function BriefFormDialog({
  open,
  onOpenChange,
  projectId,
  initialData,
  onSuccess,
}: BriefFormDialogProps) {
  const [serverError, setServerError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BriefFormData>({
    resolver: zodResolver(briefFormSchema),
    defaultValues: {
      objective: initialData?.objective || "",
      target_audience: initialData?.target_audience || "",
      key_message: initialData?.key_message || "",
      deliverables_summary: initialData?.deliverables_summary || "",
      reference_links: initialData?.reference_links || "",
    },
  });

  const [prevOpen, setPrevOpen] = React.useState(open);
  if (prevOpen !== open) {
    setPrevOpen(open);
    if (!open) {
      setServerError(null);
    }
  }

  React.useEffect(() => {
    reset({
      objective: initialData?.objective || "",
      target_audience: initialData?.target_audience || "",
      key_message: initialData?.key_message || "",
      deliverables_summary: initialData?.deliverables_summary || "",
      reference_links: initialData?.reference_links || "",
    });
  }, [initialData, reset, open]);

  const handleClose = React.useCallback(() => {
    setServerError(null);
    onOpenChange(false);
  }, [onOpenChange]);

  const onSubmit = async (data: BriefFormData) => {
    setServerError(null);
    const res = await saveBriefAction(projectId, data);
    if (!res.success) {
      const msg = res.error || "Gagal menyimpan brief.";
      setServerError(msg);
      toast.error(msg);
      return;
    }

    toast.success(initialData ? "Brief project berhasil diperbarui." : "Brief project berhasil disimpan.");
    onOpenChange(false);
    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl md:max-w-3xl max-h-[calc(100dvh-3.5rem)] flex flex-col p-0 gap-0 overflow-hidden shadow-2xl">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b border-border bg-card shrink-0 text-left">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
              <FileText className="size-4.5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold text-foreground tracking-tight">
                {initialData ? "Edit Brief Project" : "Buat Brief Project Baru"}
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Definisikan sasaran campaign, audiens, pesan utama, dan deliverables yang diharapkan.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4.5 text-sm">
            {serverError && (
              <div
                role="alert"
                className="flex items-start gap-2.5 rounded-lg bg-destructive/10 p-3 text-xs sm:text-sm text-destructive border border-destructive/20 font-medium"
              >
                <AlertCircle className="size-4 shrink-0 mt-0.5" />
                <span>{serverError}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="brief-objective" className="text-xs sm:text-sm font-medium">
                Tujuan Campaign (Objective) <span className="text-destructive">*</span>
              </Label>
              <textarea
                id="brief-objective"
                rows={3}
                disabled={isSubmitting}
                className="w-full rounded-md border border-input bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50 resize-y"
                placeholder="Jelaskan tujuan utama yang ingin dicapai melalui campaign atau konten ini..."
                {...register("objective")}
              />
              {errors.objective && (
                <p className="text-xs text-destructive font-medium">{errors.objective.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="brief-target-audience" className="text-xs sm:text-sm font-medium">
                Target Audiens <span className="text-destructive">*</span>
              </Label>
              <textarea
                id="brief-target-audience"
                rows={2}
                disabled={isSubmitting}
                className="w-full rounded-md border border-input bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50 resize-y"
                placeholder="Demografi, persona, usia, atau segmen masyarakat sasaran..."
                {...register("target_audience")}
              />
              {errors.target_audience && (
                <p className="text-xs text-destructive font-medium">{errors.target_audience.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="brief-key-message" className="text-xs sm:text-sm font-medium">
                Pesan Utama (Key Message) <span className="text-destructive">*</span>
              </Label>
              <textarea
                id="brief-key-message"
                rows={2}
                disabled={isSubmitting}
                className="w-full rounded-md border border-input bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50 resize-y"
                placeholder="Pesan tunggal yang harus dipahami dan diingat oleh audiens..."
                {...register("key_message")}
              />
              {errors.key_message && (
                <p className="text-xs text-destructive font-medium">{errors.key_message.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="brief-deliverables" className="text-xs sm:text-sm font-medium">
                Ringkasan Deliverable <span className="text-destructive">*</span>
              </Label>
              <textarea
                id="brief-deliverables"
                rows={3}
                disabled={isSubmitting}
                className="w-full rounded-md border border-input bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50 resize-y"
                placeholder="Daftar output yang diharapkan (misal: 3 Carousel Feed, 2 Video Reels 30s)..."
                {...register("deliverables_summary")}
              />
              {errors.deliverables_summary && (
                <p className="text-xs text-destructive font-medium">{errors.deliverables_summary.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="brief-references" className="text-xs sm:text-sm font-medium">
                Link Referensi & Moodboard (Opsional)
              </Label>
              <textarea
                id="brief-references"
                rows={2}
                disabled={isSubmitting}
                className="w-full rounded-md border border-input bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50 resize-y font-mono"
                placeholder="https://pinterest.com/..., https://instagram.com/... (pisahkan per baris)"
                {...register("reference_links")}
              />
            </div>
          </div>

          {/* Footer */}
          <DialogFooter className="px-6 py-4 border-t border-border bg-muted/20 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2.5 shrink-0 mt-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClose}
              disabled={isSubmitting}
              className="h-9.5 px-4 text-sm font-medium"
            >
              Batal
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="h-9.5 px-4 text-sm font-medium gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <span>{initialData ? "Simpan Perubahan Brief" : "Simpan Brief"}</span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
