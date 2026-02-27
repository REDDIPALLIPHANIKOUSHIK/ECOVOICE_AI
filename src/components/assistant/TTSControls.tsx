import { VolumeX, Volume2, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

interface TTSControlsProps {
  autoSpeak: boolean;
  voiceTone: "friendly" | "formal";
  detectedLanguageLabel: string;
  onAutoSpeakChange: (val: boolean) => void;
  onVoiceToneChange: (tone: "friendly" | "formal") => void;
}

const stopSpeaking = () => window.speechSynthesis.cancel();

const TTSControls = ({
  autoSpeak,
  voiceTone,
  detectedLanguageLabel,
  onAutoSpeakChange,
  onVoiceToneChange,
}: TTSControlsProps) => (
  <div className="flex items-center gap-3 px-3 py-2.5 bg-muted/50 rounded-xl text-xs flex-wrap border border-border/50">
    <div className="flex items-center gap-1.5 text-muted-foreground">
      <Languages className="w-3.5 h-3.5" />
      <span>Auto language: {detectedLanguageLabel}</span>
    </div>

    <div className="flex items-center gap-1.5">
      <Volume2 className="w-3.5 h-3.5 text-muted-foreground" />
      <Switch checked={autoSpeak} onCheckedChange={onAutoSpeakChange} className="scale-75" />
      <span className="text-muted-foreground">Auto voice reply</span>
    </div>

    <div className="flex items-center gap-1">
      <Button
        variant={voiceTone === "friendly" ? "default" : "outline"}
        size="sm"
        className="h-7 text-xs"
        onClick={() => onVoiceToneChange("friendly")}
      >
        Friendly
      </Button>
      <Button
        variant={voiceTone === "formal" ? "default" : "outline"}
        size="sm"
        className="h-7 text-xs"
        onClick={() => onVoiceToneChange("formal")}
      >
        Formal
      </Button>
    </div>

    <Button variant="outline" size="sm" className="h-7 text-xs gap-1 ml-auto" onClick={stopSpeaking} aria-label="Stop speaking">
      <VolumeX className="w-3.5 h-3.5" /> Stop
    </Button>
  </div>
);

export default TTSControls;
