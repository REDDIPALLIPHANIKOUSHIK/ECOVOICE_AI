import { useState, useRef, useEffect } from "react";
import { Send, Mic, MicOff, Volume2, VolumeX, Sparkles, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import ChatMessage from "@/components/assistant/ChatMessage";
import TypingIndicator from "@/components/assistant/TypingIndicator";
import WaveformAnimation from "@/components/WaveformAnimation";

const PANEL_LANGUAGES = [
  { value: "auto", label: "🔍 Auto" },
  { value: "en-IN", label: "🇮🇳 English" },
  { value: "hi-IN", label: "हिन्दी" },
  { value: "te-IN", label: "తెలుగు" },
  { value: "ta-IN", label: "தமிழ்" },
  { value: "kn-IN", label: "ಕನ್ನಡ" },
];
import { getSavedLocation, getLocationRules } from "@/lib/location";
import { useVoiceEngine } from "@/hooks/useVoiceEngine";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface VoiceAssistantPanelProps {
  title?: string;
  subtitle?: string;
  greeting: string;
  placeholder?: string;
  systemContext?: string;
  suggestions?: string[];
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-waste`;

const VoiceAssistantPanel = ({
  title = "Voice Assistant",
  subtitle = "Ask me anything — type or speak 🎤",
  greeting,
  placeholder = "Ask a question...",
  systemContext,
  suggestions = [],
}: VoiceAssistantPanelProps) => {
  const [messages, setMessages] = useState<Message[]>([{ role: "assistant", content: greeting }]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const voice = useVoiceEngine();

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = async (text: string, detectedLangOverride?: string) => {
    if (!text.trim()) return;
    voice.registerInteraction();
    const inferredLang = detectedLangOverride || voice.resolvedLang(text);

    const userMsg: Message = { role: "user", content: text.trim() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setIsTyping(true);

    let assistantSoFar = "";
    try {
      const apiMessages = updatedMessages.filter((_, i) => i > 0).map(m => ({ role: m.role, content: m.content }));
      const loc = getSavedLocation();
      const locationContext = loc
        ? `User is in ${loc.city}, ${loc.state}, ${loc.country}. Local rules: ${getLocationRules(loc)}. ${systemContext || ""}`
        : `User location unknown. ${systemContext || ""}`;

      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: apiMessages, locationContext, userLanguage: inferredLang, voiceTone: voice.voiceTone }),
      });

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.error || `Request failed (${resp.status})`);
      }
      if (!resp.body) throw new Error("No response body");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";

      const upsertAssistant = (chunk: string) => {
        assistantSoFar += chunk;
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant" && prev.length > 1) {
            return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
          }
          return [...prev, { role: "assistant", content: assistantSoFar }];
        });
      };

      const processSseLine = (rawLine: string) => {
        let line = rawLine;
        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (line.startsWith(":") || line.trim() === "" || !line.startsWith("data: ")) return false;
        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") return true;
        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) upsertAssistant(content);
        } catch { /* skip */ }
        return false;
      };

      let streamDone = false;
      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });
        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          const line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (processSseLine(line)) { streamDone = true; break; }
        }
      }
      const tail = textBuffer.trim();
      if (!streamDone && tail) processSseLine(tail);

      const finalResponse = assistantSoFar.trim();
      if (!finalResponse) {
        setMessages(prev => [...prev, { role: "assistant", content: "I couldn't generate a response. Please try again." }]);
      } else {
        voice.playEcoSound();
        if (voice.autoSpeak) voice.speak(finalResponse, inferredLang);
      }
    } catch (err: any) {
      console.error("Voice panel error:", err);
      toast.error(err?.message || "Failed to get response");
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, something went wrong. Please try again." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="eco-card p-4 sm:p-5 flex flex-col" style={{ minHeight: "480px" }}>
      <div className="flex items-center justify-between mb-3 gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full eco-gradient flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-sm">{title}</h3>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <div className="flex items-center gap-1 bg-muted/60 rounded-lg px-1.5 h-8 border border-border/50">
            <Globe className="w-3.5 h-3.5 text-muted-foreground" />
            <Select value={voice.language} onValueChange={voice.setLanguage}>
              <SelectTrigger className="h-7 w-[105px] text-xs border-none bg-transparent px-1 focus:ring-0">
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                {PANEL_LANGUAGES.map((l) => (
                  <SelectItem key={l.value} value={l.value} className="text-xs">{l.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <button
            onClick={() => {
              voice.registerInteraction();
              voice.setAutoSpeak(!voice.autoSpeak);
            }}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
              voice.autoSpeak ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
            }`}
            aria-label={voice.autoSpeak ? "Mute voice" : "Enable voice"}
            title={voice.autoSpeak ? "Voice on" : "Voice off"}
          >
            {voice.autoSpeak ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
          {voice.isSpeaking && (
            <button
              onClick={voice.stopSpeaking}
              className="text-xs px-2 py-1 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20"
            >
              Stop
            </button>
          )}
        </div>
      </div>

      {voice.listening && (
        <div className="flex items-center justify-center gap-3 py-2 mb-2 bg-destructive/10 rounded-xl border border-destructive/20">
          <WaveformAnimation active={voice.listening} />
          <span className="text-sm font-medium text-destructive">Listening...</span>
        </div>
      )}

      <div className="flex-1 overflow-y-auto mb-3 space-y-3 pr-1" style={{ maxHeight: "360px" }}>
        {messages.map((msg, i) => (
          <ChatMessage
            key={i}
            role={msg.role}
            content={msg.content}
            index={i}
            onSpeak={msg.role === "assistant" ? voice.speak : undefined}
          />
        ))}
        {isTyping && !messages[messages.length - 1]?.content && <TypingIndicator />}
        <div ref={chatEndRef} />
      </div>

      {suggestions.length > 0 && messages.length <= 1 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => {
                voice.registerInteraction();
                void sendMessage(s);
              }}
              className="text-xs bg-secondary hover:bg-secondary/80 text-secondary-foreground px-2.5 py-1 rounded-full transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <div className="flex-1 relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                voice.registerInteraction();
                void sendMessage(input);
              }
            }}
            placeholder={placeholder}
            className="w-full bg-muted rounded-xl pl-4 pr-12 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring border border-border/50"
            aria-label="Type your question"
          />
          <button
            onClick={() => {
              voice.registerInteraction();
              voice.startListening((transcript, detectedLang) => {
                void sendMessage(transcript, detectedLang);
              });
            }}
            className={`absolute right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
              voice.listening
                ? "bg-destructive text-destructive-foreground animate-pulse"
                : "bg-primary/10 text-primary hover:bg-primary/20"
            }`}
            aria-label={voice.listening ? "Stop listening" : "Start voice input"}
          >
            {voice.listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
        </div>
        <Button
          size="icon"
          onClick={() => {
            voice.registerInteraction();
            void sendMessage(input);
          }}
          className="shrink-0 rounded-xl"
          aria-label="Send message"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default VoiceAssistantPanel;
