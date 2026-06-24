import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type AgentResponseInputProps = {
  value: string;
  onChange: (value: string) => void;
};

export function AgentResponseInput({ value, onChange }: AgentResponseInputProps) {
  return (
    <div className="space-y-3">
      <Label htmlFor="agentResponse">Agent response</Label>
      <Textarea
        id="agentResponse"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={12}
        placeholder="Paste the target AI agent response here."
        className="min-h-72 rounded-2xl border-border bg-background/80 text-sm leading-7"
      />
      <p className="text-xs text-muted-foreground">
        Include the full response so ClawCheck can score risk identification, stakeholder
        awareness, confidence handling, and recommendation quality.
      </p>
    </div>
  );
}
