import * as React from "react";
import { cn } from "cn";

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  children,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2.5 pb-7 md:pb-8 md:flex-row md:items-center md:justify-between",
        className
      )}
    >
      <div className="space-y-1 sm:space-y-1.5">
        <h1 className="text-xl sm:text-2xl lg:text-[26px] xl:text-[28px] font-bold tracking-tight text-foreground">
          {title}
        </h1>
        {description && (
          <p className="text-sm sm:text-[14.5px] text-muted-foreground leading-normal">
            {description}
          </p>
        )}
      </div>
      {children && (
        <div className="flex shrink-0 items-center gap-2.5 pt-2 md:pt-0">
          {children}
        </div>
      )}
    </div>
  );
}
