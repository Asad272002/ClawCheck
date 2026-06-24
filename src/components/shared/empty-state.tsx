import { Sparkles } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

type EmptyStateProps = {
  title: string;
  description: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <Card className="glass-panel border-white/10 bg-card/80">
      <CardContent className="flex flex-col items-center justify-center gap-3 py-12 text-center">
        <div className="rounded-full border border-primary/20 bg-primary/10 p-3 text-primary">
          <Sparkles className="size-5" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="max-w-lg text-sm text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
