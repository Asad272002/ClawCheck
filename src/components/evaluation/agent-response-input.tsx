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
      <Textarea id="agentResponse" value={value} onChange={(event) => onChange(event.target.value)} rows={10} placeholder="Paste the target AI agent response here." className="min-h-56 rounded-2xl border-white/10 bg-white/5" />
    </div>
  );
}
