import { Mic } from "lucide-react";
import { cn } from "@/lib/utils";

interface VoiceAssistantProps {
  isActive?: boolean;
  className?: string;
}

export default function VoiceAssistant({ isActive = false, className }: VoiceAssistantProps) {
  return (
    <Mic 
      className={cn(
        "h-4 w-4",
        isActive && "voice-indicator",
        className
      )}
      data-testid="voice-assistant-icon"
    />
  );
}
