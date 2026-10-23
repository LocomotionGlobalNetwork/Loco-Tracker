"use client";

import * as React from "react";
import { reassignTaskAction } from "../actions";
import type { TaskWithRelations } from "../types";
import { AlertCircle, ArrowRight, Loader2, UserCheck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { formatUserWithRole } from "@/constants/labels";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";

interface TaskReassignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: TaskWithRelations | null;
  projectId: string;
  availableAssignees?: Array<{
    id: string;
    full_name: string;
    email: string;
    role: string;
  }>;
  onSuccess?: () => void;
}

export function TaskReassignDialog({
  open,
  onOpenChange,
  task,
  projectId,
  availableAssignees = [],
  onSuccess,
}: TaskReassignDialogProps) {
  const [selectedAssigneeId, setSelectedAssigneeId] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);

  // When dialog opens, always require explicit selection (never auto-select current or any PIC)
  const [prevOpen, setPrevOpen] = React.useState(open);
  if (prevOpen !== open) {
    setPrevOpen(open);
    if (open) {
      setSelectedAssigneeId("");
      setServerError(null);
    } else {
      setSelectedAssigneeId("");
      setServerError(null);
    }
  }

  const handleClose = React.useCallback(() => {
    if (isSubmitting) return;
    setServerError(null);
    setSelectedAssigneeId("");
    onOpenChange(false);
  }, [isSubmitting, onOpenChange]);

  const isAlreadyAssigned = Boolean(task?.current_assignee_id);

  // Exclude current PIC from candidates to prevent re-selecting the same person
  const eligibleCandidates = React.useMemo(() => {
    if (!task) return [];
    if (task.current_assignee_id) {
      return availableAssignees.filter((u) => u.id !== task.current_assignee_id);
    }
    return availableAssignees;
  }, [availableAssignees, task]);

  const selectedCandidate = React.useMemo(() => {
    if (!selectedAssigneeId || selectedAssigneeId === "NONE") return null;
    return eligibleCandidates.find((u) => u.id === selectedAssigneeId) || null;
  }, [selectedAssigneeId, eligibleCandidates]);

  const selectedAssigneeLabel = React.useMemo(() => {
    if (!selectedCandidate) {
      return isAlreadyAssigned ? "Pilih PIC pengganti..." : "Pilih anggota tim...";
    }
    return formatUserWithRole(selectedCandidate);
  }, [selectedCandidate, isAlreadyAssigned]);

  const isCandidateValid = Boolean(
    selectedAssigneeId &&
    selectedAssigneeId !== "NONE" &&
    selectedAssigneeId !== task?.current_assignee_id &&
    eligibleCandidates.some((c) => c.id === selectedAssigneeId)
  );

  if (!task) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isCandidateValid || !selectedCandidate) {
      setServerError("Pilih anggota tim PIC pengganti yang valid.");
      return;
    }

    setIsSubmitting(true);
    setServerError(null);

    const res = await reassignTaskAction(
      task.id,
      projectId,
      selectedAssigneeId,
      task.current_assignee_id
    );

    if (!res.success) {
      const errorMsg = res.error || "Gagal mengalihkan PIC. Coba lagi.";
      setServerError(errorMsg);
      toast.error(errorMsg);
      setIsSubmitting(false);
      return;
    }

    const targetName = selectedCandidate.full_name;
    const successToast = isAlreadyAssigned
      ? `PIC berhasil dialihkan ke ${targetName}.`
      : `PIC berhasil ditugaskan ke ${targetName}.`;

    toast.success(successToast);
    setIsSubmitting(false);
    onOpenChange(false);
    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-xl md:max-w-2xl max-h-[calc(100dvh-3.5rem)] flex flex-col p-0 gap-0 overflow-hidden rounded-xl border border-border/80 bg-card shadow-2xl">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b border-border bg-card shrink-0 text-left">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
              <UserCheck className="size-4.5" />
            </div>
            <div className="min-w-0 pr-6">
              <DialogTitle className="text-lg font-semibold text-foreground tracking-tight">
                {isAlreadyAssigned ? "Alihkan Penugasan PIC" : "Tugaskan PIC"}
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                {isAlreadyAssigned
                  ? "Pindahkan penanggung jawab tugas produksi ke anggota tim kreatif lain."
                  : "Tentukan anggota tim kreatif yang bertanggung jawab mengerjakan tugas ini."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 text-sm">
            {serverError && (
              <div
                role="alert"
                className="flex items-start gap-2.5 rounded-md bg-destructive/10 p-3 text-destructive border border-destructive/20 text-xs sm:text-sm font-medium"
              >
                <AlertCircle className="size-4 shrink-0 mt-0.5" />
                <span>{serverError}</span>
              </div>
            )}

            {/* Summary Card */}
            <div className="rounded-lg border border-border/80 bg-muted/30 p-4 space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1 min-w-0">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider block">
                    Tugas
                  </span>
                  <p className="text-sm font-semibold text-foreground truncate" title={task.title}>
                    {task.title}
                  </p>
                </div>
                <div className="space-y-1 min-w-0">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider block">
                    PIC Saat Ini
                  </span>
                  <p className="text-sm font-medium text-foreground truncate" title={formatUserWithRole(task.current_assignee)}>
                    {formatUserWithRole(task.current_assignee)}
                  </p>
                </div>
              </div>

              {/* Reassignment Preview */}
              {selectedCandidate && isAlreadyAssigned && (
                <div className="pt-2.5 border-t border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs sm:text-sm">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Alur Pengalihan:
                  </span>
                  <div className="inline-flex items-center gap-2 rounded-md bg-background/80 px-3 py-1.5 border border-border/60 font-medium self-start sm:self-auto">
                    <span
                      className="text-muted-foreground truncate max-w-[130px] sm:max-w-[160px]"
                      title={task.current_assignee?.full_name || "Belum ada"}
                    >
                      {task.current_assignee?.full_name || "Belum ada"}
                    </span>
                    <ArrowRight className="size-3.5 text-muted-foreground shrink-0" />
                    <span
                      className="text-primary font-semibold truncate max-w-[130px] sm:max-w-[160px]"
                      title={selectedCandidate.full_name}
                    >
                      {selectedCandidate.full_name}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Target Assignee Field or Empty State Notice */}
            {eligibleCandidates.length === 0 ? (
              <div
                role="status"
                className="flex items-start gap-2.5 rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-xs sm:text-sm text-amber-700 dark:text-amber-400 font-medium"
              >
                <AlertCircle className="size-4 shrink-0 mt-0.5" />
                <span>Tidak ada anggota tim lain yang tersedia untuk dialihkan.</span>
              </div>
            ) : (
              <div className="space-y-1.5">
                <Label htmlFor="reassign-user-select" className="text-xs sm:text-sm font-medium text-foreground block">
                  {isAlreadyAssigned ? "Pilih PIC Pengganti" : "Pilih Anggota Tim PIC"}{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={selectedAssigneeId || "NONE"}
                  onValueChange={(val) => {
                    setSelectedAssigneeId(!val || val === "NONE" ? "" : val);
                    if (serverError) setServerError(null);
                  }}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="reassign-user-select" className="h-9.5 text-sm px-3 w-full">
                    <SelectValue placeholder={isAlreadyAssigned ? "Pilih PIC pengganti..." : "Pilih anggota tim..."}>
                      {selectedAssigneeLabel}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">
                      {isAlreadyAssigned ? "Pilih PIC pengganti..." : "Pilih anggota tim..."}
                    </SelectItem>
                    {eligibleCandidates.map((user) => (
                      <SelectItem key={user.id} value={user.id} className="text-sm">
                        {formatUserWithRole(user)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground pt-0.5">
                  Riwayat perpindahan PIC akan tercatat otomatis pada aktivitas proyek.
                </p>
              </div>
            )}
          </div>

          {/* Dialog Footer */}
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
              disabled={isSubmitting || !isCandidateValid}
              className="h-9.5 px-4 text-sm font-medium shadow-xs"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-3.5 animate-spin mr-1.5" />
                  <span>{isAlreadyAssigned ? "Mengalihkan..." : "Menugaskan..."}</span>
                </>
              ) : (
                <span>{isAlreadyAssigned ? "Konfirmasi Alihkan" : "Tugaskan PIC"}</span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
