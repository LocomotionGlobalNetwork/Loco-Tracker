import * as React from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

export interface MetricCardProps {
  label: string;
  value: number | string;
  description?: string;
  variant?: "default" | "warning" | "destructive" | "success";
  icon?: React.ReactNode;
  className?: string;
}

const variantStyles = {
  default: {
    badge: "border-border/60 bg-muted/50 text-foreground",
    value: "text-foreground",
    indicator: "bg-muted-foreground",
  },
  warning: {
    badge: "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400",
    value: "text-amber-700 dark:text-amber-400",
    indicator: "bg-amber-500",
  },
  destructive: {
    badge: "border-destructive/20 bg-destructive/10 text-destructive",
    value: "text-destructive",
    indicator: "bg-destructive",
  },
  success: {
    badge: "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    value: "text-emerald-700 dark:text-emerald-400",
    indicator: "bg-emerald-500",
  },
};

export function MetricCard({
  label,
  value,
  description,
  variant = "default",
  icon,
  className,
}: MetricCardProps) {
  const styles = variantStyles[variant];

  return (
    <Card
      className={cn(
        "flex flex-col justify-between p-5 sm:p-6 transition-colors h-full min-h-[142px] sm:min-h-[148px] max-h-[160px]",
        className
      )}
    >
      <div className="flex items-center justify-between gap-2.5">
        <span className="text-[13px] sm:text-sm font-medium tracking-normal text-muted-foreground">
          {label}
        </span>
        {icon && (
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground [&>svg]:size-4.5">
            {icon}
          </div>
        )}
      </div>

      <div className="mt-3.5 sm:mt-4">
        <div className={cn("text-[28px] sm:text-3xl font-bold tracking-tight tabular-nums leading-none", styles.value)}>
          {value}
        </div>
        {description && (
          <p className="mt-1.5 text-xs sm:text-[13px] text-muted-foreground leading-normal line-clamp-2">
            {description}
          </p>
        )}
      </div>
    </Card>
  );
}
