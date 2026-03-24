import { Globe, VolumeX, Volume2, Theater } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

interface TTSControlsProps {
  language: string;
  voiceTone: "friendly" | "formal";
  autoSpeak: boolean;
  onLanguageChange: (lang: string) => void;
  onVoiceToneChange: (tone: "friendly" | "formal") => void;
  onAutoSpeakChange: (val: boolean) => void;
  onStop: () => void;
  isSpeaking: boolean;
}

const LANGUAGES = [
  { value: "auto", label: "🔍 Auto Detect" },
  { value: "en-IN", label: "🇮🇳 English (India)" },
  { value: "hi-IN", label: "🇮🇳 हिन्दी" },
  { value: "te-IN", label: "🇮🇳 తెలుగు" },
  { value: "ta-IN", label: "🇮🇳 தமிழ்" },
  { value: "kn-IN", label: "🇮🇳 ಕನ್ನಡ" },
];

const TTSControls = ({
  language,
  voiceTone,
  autoSpeak,
  onLanguageChange,
  onVoiceToneChange,
  onAutoSpeakChange,
  onStop,
  isSpeaking,
}: TTSControlsProps) => (
  <div className="flex items-center gap-2.5 px-3 py-2 bg-muted/50 rounded-xl text-xs flex-wrap border border-border/50">
    <div className="flex items-center gap-1.5">
      <Globe className="w-3.5 h-3.5 text-muted-foreground" />
      <Select value={language} onValueChange={onLanguageChange}>
        <SelectTrigger className="h-7 w-[140px] text-xs border-none bg-background/60">
          <SelectValue placeholder="Language" />
        </SelectTrigger>
        <SelectContent>
          {LANGUAGES.map((l) => (
            <SelectItem key={l.value} value={l.value} className="text-xs">{l.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>

    <div className="flex items-center gap-1.5">
      <Theater className="w-3.5 h-3.5 text-muted-foreground" />
      <Select value={voiceTone} onValueChange={(v: "friendly" | "formal") => onVoiceToneChange(v)}>
        <SelectTrigger className="h-7 w-[110px] text-xs border-none bg-background/60"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="friendly" className="text-xs">😊 Friendly</SelectItem>
          <SelectItem value="formal" className="text-xs">👔 Professional</SelectItem>
        </SelectContent>
      </Select>
    </div>

    <div className="flex items-center gap-1.5">
      <Volume2 className="w-3.5 h-3.5 text-muted-foreground" />
      <Switch checked={autoSpeak} onCheckedChange={onAutoSpeakChange} className="scale-75" />
      <span className="text-muted-foreground">Auto voice</span>
    </div>

    {isSpeaking && (
      <Button variant="outline" size="sm" className="h-7 text-xs gap-1 ml-auto" onClick={onStop} aria-label="Stop speaking">
        <VolumeX className="w-3.5 h-3.5" /> Stop
      </Button>
    )}
  </div>
);

export default TTSControls;
