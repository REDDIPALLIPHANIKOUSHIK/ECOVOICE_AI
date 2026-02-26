import { Globe, Gauge } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

interface TTSControlsProps {
  language: string;
  speed: number;
  onLanguageChange: (lang: string) => void;
  onSpeedChange: (speed: number) => void;
}

const LANGUAGES = [
  { value: "en-US", label: "English (US)" },
  { value: "en-GB", label: "English (UK)" },
  { value: "es-ES", label: "Español" },
  { value: "fr-FR", label: "Français" },
  { value: "de-DE", label: "Deutsch" },
  { value: "pt-BR", label: "Português (BR)" },
  { value: "ar-SA", label: "العربية" },
  { value: "hi-IN", label: "हिन्दी" },
  { value: "zh-CN", label: "中文" },
  { value: "ja-JP", label: "日本語" },
];

const TTSControls = ({ language, speed, onLanguageChange, onSpeedChange }: TTSControlsProps) => (
  <div className="flex items-center gap-3 px-2 py-2 bg-muted/50 rounded-xl text-xs">
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
  </div>
);

export default TTSControls;
