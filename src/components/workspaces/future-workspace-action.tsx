"use client";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";

type FutureWorkspaceActionProps = {
  label: string;
  description: string;
  variant?: "default" | "outline" | "secondary" | "ghost";
  size?: "default" | "sm" | "lg";
  className?: string;
};

export function FutureWorkspaceAction({
  label,
  description,
  variant = "outline",
  size = "default",
  className,
}: FutureWorkspaceActionProps) {
  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={() => {
        toast(label, {
          description: `${description} This action will be connected once workspace sync is enabled.`,
        });
      }}
    >
      {label}
    </Button>
  );
}
