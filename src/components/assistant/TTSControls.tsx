import { Globe, Gauge, VolumeX, Volume2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

interface TTSControlsProps {
  language: string;
  speed: number;
  autoSpeak: boolean;
  onLanguageChange: (lang: string) => void;
  onSpeedChange: (speed: number) => void;
  onAutoSpeakChange: (val: boolean) => void;
}

const LANGUAGES = [
  { value: "en-IN", label: "English (India)" },
  { value: "hi-IN", label: "हिन्दी" },
  { value: "ta-IN", label: "தமிழ்" },
  { value: "te-IN", label: "తెలుగు" },
  { value: "kn-IN", label: "ಕನ್ನಡ" },
  { value: "ml-IN", label: "മലയാളം" },
  { value: "bn-IN", label: "বাংলা" },
  { value: "mr-IN", label: "मराठी" },
  { value: "gu-IN", label: "ગુજરાતી" },
  { value: "pa-IN", label: "ਪੰਜਾਬੀ" },
  { value: "fr-FR", label: "Français" },
  { value: "de-DE", label: "Deutsch" },
  { value: "pt-BR", label: "Português" },
];

const stopSpeaking = () => window.speechSynthesis.cancel();

const TTSControls = ({ language, speed, autoSpeak, onLanguageChange, onSpeedChange, onAutoSpeakChange }: TTSControlsProps) => (
  <div className="flex items-center gap-3 px-3 py-2.5 bg-muted/50 rounded-xl text-xs flex-wrap border border-border/50">
    <div className="flex items-center gap-1.5">
      <Globe className="w-3.5 h-3.5 text-muted-foreground" />
      <Select value={language} onValueChange={onLanguageChange}>
        <SelectTrigger className="h-7 w-[130px] text-xs border-none bg-background/60">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {LANGUAGES.map((l) => (
            <SelectItem key={l.value} value={l.value} className="text-xs">{l.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
    <div className="flex items-center gap-1.5 min-w-[120px]">
      <Gauge className="w-3.5 h-3.5 text-muted-foreground" />
      <Slider
        value={[speed]}
        onValueChange={([v]) => onSpeedChange(v)}
        min={0.5}
        max={2}
        step={0.1}
        className="flex-1"
      />
      <span className="text-muted-foreground w-8 text-right">{speed}x</span>
    </div>
    <div className="flex items-center gap-1.5">
      <Volume2 className="w-3.5 h-3.5 text-muted-foreground" />
      <Switch checked={autoSpeak} onCheckedChange={onAutoSpeakChange} className="scale-75" />
      <span className="text-muted-foreground">Auto</span>
    </div>
    <Button
      variant="outline"
      size="sm"
      className="h-7 text-xs gap-1 ml-auto"
      onClick={stopSpeaking}
      aria-label="Stop speaking"
    >
      <VolumeX className="w-3.5 h-3.5" /> Stop
    </Button>
  </div>
);

export default TTSControls;
