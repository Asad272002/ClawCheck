import type { LucideIcon } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type FeatureCardProps = {
  title: string;
  description: string;
  eyebrow: string;
  icon: LucideIcon;
};

export function FeatureCard({ title, description, eyebrow, icon: Icon }: FeatureCardProps) {
  return (
    <Card className="surface-card h-full">
      <CardHeader className="space-y-4">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/10">
          <Icon className="size-5" />
        </div>
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/80">
            {eyebrow}
          </p>
          <CardTitle className="text-lg">{title}</CardTitle>
          <CardDescription className="text-sm leading-6">{description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="pt-0 text-sm text-muted-foreground">
        Built for clear demos today and extensible evaluation workflows later.
      </CardContent>
    </Card>
  );
}
