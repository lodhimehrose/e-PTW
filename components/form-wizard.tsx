"use client";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type FormWizardProps = {
  step: number;
  totalSteps: number;
  stepTitle: string;
  onBack?: () => void;
  onNext?: () => void;
  isLast?: boolean;
  onSubmit?: () => void;
  submitting?: boolean;
  children: React.ReactNode;
};

export function FormWizard({
  step,
  totalSteps,
  stepTitle,
  onBack,
  onNext,
  isLast,
  onSubmit,
  submitting,
  children,
}: FormWizardProps) {
  const progress = Math.round((step / totalSteps) * 100);
  return (
    <div className="space-y-6">
      <div>
        <div className="mb-2 flex justify-between text-sm">
          <span className="font-medium text-sma-navy">Step {step} of {totalSteps}</span>
          <span className="text-muted-foreground">{stepTitle}</span>
        </div>
        <Progress value={progress} />
      </div>
      <div className="rounded-lg border bg-white p-4 shadow-sm md:p-6">{children}</div>
      <div className={cn("fixed inset-x-0 bottom-0 z-40 border-t bg-white/95 p-4 md:static md:border-0 md:bg-transparent md:p-0")}>
        <div className="mx-auto flex max-w-3xl gap-3">
          {onBack && step > 1 && (
            <Button type="button" variant="outline" className="flex-1" onClick={onBack}>Back</Button>
          )}
          {!isLast && onNext && (
            <Button type="button" className="flex-1" onClick={onNext}>Next</Button>
          )}
          {isLast && onSubmit && (
            <Button type="button" className="flex-1" onClick={onSubmit} disabled={submitting}>
              {submitting ? "Submitting…" : "Submit"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
