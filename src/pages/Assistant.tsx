import { useState, useRef, useEffect, useCallback } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import ChatMessage from "@/components/assistant/ChatMessage";
import TypingIndicator from "@/components/assistant/TypingIndicator";
import TTSControls from "@/components/assistant/TTSControls";
import LocationSelector from "@/components/LocationSelector";
import WaveformAnimation from "@/components/WaveformAnimation";
import FloatingVoiceButton from "@/components/FloatingVoiceButton";
import { getSavedLocation, getLocationRules, type UserLocation } from "@/lib/location";
import type { SpeechRecognition as SpeechRecognitionType } from "@/types/speech.d";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface VoiceOption {
  name: string;
  lang: string;
  voiceURI: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-waste`;

const LANGUAGE_PATTERNS: Array<{ lang: string; regex: RegExp }> = [
  { lang: "hi-IN", regex: /[\u0900-\u097F]/ },
  { lang: "bn-IN", regex: /[\u0980-\u09FF]/ },
  { lang: "ta-IN", regex: /[\u0B80-\u0BFF]/ },
  { lang: "te-IN", regex: /[\u0C00-\u0C7F]/ },
  { lang: "kn-IN", regex: /[\u0C80-\u0CFF]/ },
  { lang: "ml-IN", regex: /[\u0D00-\u0D7F]/ },
  { lang: "gu-IN", regex: /[\u0A80-\u0AFF]/ },
  { lang: "mr-IN", regex: /[\u0900-\u097F]/ },
  { lang: "pa-IN", regex: /[\u0A00-\u0A7F]/ },
];

const detectLanguageFromText = (text: string): string => {
  for (const pattern of LANGUAGE_PATTERNS) {
    if (pattern.regex.test(text)) return pattern.lang;
  }
  const lower = text.toLowerCase();
  if (/\b(hola|reciclar|botella)\b/.test(lower)) return "es-ES";
  if (/\b(bonjour|recycler|déchet)\b/.test(lower)) return "fr-FR";
  if (/\b(hallo|recycling|abfall)\b/.test(lower)) return "de-DE";
  return "en-IN";
};

const playEcoSound = () => {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(523, ctx.currentTime);
    osc.frequency.setValueAtTime(659, ctx.currentTime + 0.1);
    osc.frequency.setValueAtTime(784, ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.4);
  } catch {
    // no-op
  }
};

const Assistant = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi! I'm EcoVoice 🌿\n\nAsk me about any waste item and I'll help you sort and dispose of it properly. You can type or use your microphone — I'll even speak the answer back to you!\n\nTry saying: \"How do I recycle a plastic bottle?\"" },
  ]);
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [ttsLang, setTtsLang] = useState("en-IN");
  const [speechLanguage, setSpeechLanguage] = useState("auto");
  const [ttsSpeed, setTtsSpeed] = useState(1);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [voiceTone, setVoiceTone] = useState<"friendly" | "formal">("friendly");
  const [availableVoices, setAvailableVoices] = useState<VoiceOption[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState("auto");
  const [location, setLocation] = useState<UserLocation | null>(() => getSavedLocation());
  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognitionType | null>(null);
  const pendingSpeakRef = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices.map((v) => ({ name: v.name, lang: v.lang, voiceURI: v.voiceURI })));
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const speak = useCallback((text: string, forceLang?: string) => {
    pendingSpeakRef.current = pendingSpeakRef.current.then(async () => {
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/\*\*(.*?)\*\*/g, "$1").replace(/[#*_~`]/g, "");
      const utterance = new SpeechSynthesisUtterance(cleanText);
      const outputLang = forceLang || ttsLang;
      utterance.lang = outputLang;
      utterance.rate = voiceTone === "friendly" ? ttsSpeed : Math.max(0.8, ttsSpeed - 0.1);
      utterance.pitch = voiceTone === "friendly" ? 1.08 : 0.92;

      const voices = window.speechSynthesis.getVoices();
      const selected = selectedVoiceURI !== "auto" ? voices.find((v) => v.voiceURI === selectedVoiceURI) : undefined;
      const match =
        selected ||
        voices.find((v) => v.lang === outputLang) ||
        voices.find((v) => v.lang.startsWith(outputLang.split("-")[0]));

      if (match) utterance.voice = match;

      await new Promise<void>((resolve) => {
        utterance.onend = () => resolve();
        utterance.onerror = () => resolve();
        window.speechSynthesis.speak(utterance);
      });
    });
  }, [selectedVoiceURI, ttsLang, ttsSpeed, voiceTone]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    const inferredLang = speechLanguage === "auto" ? detectLanguageFromText(text) : speechLanguage;
    if (speechLanguage === "auto") setTtsLang(inferredLang);

    const userMsg: Message = { role: "user", content: text.trim() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setIsTyping(true);

    let assistantSoFar = "";

    try {
      const apiMessages = updatedMessages.filter((_, i) => i > 0).map((m) => ({ role: m.role, content: m.content }));
      const locationContext = location
        ? `User is in ${location.city}, ${location.state}, ${location.country}. Local rules: ${getLocationRules(location)}`
        : "User location unknown. Provide general recycling guidelines.";

      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: apiMessages, locationContext, userLanguage: inferredLang, voiceTone }),
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
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant" && prev.length > 1) {
            return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
          }
          return [...prev, { role: "assistant", content: assistantSoFar }];
        });
      };

      let streamDone = false;
      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "" || !line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            streamDone = true;
            break;
          }
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) upsertAssistant(content);
          } catch {
            // skip malformed chunk
          }
        }
      }

      if (!assistantSoFar) {
        setMessages((prev) => [...prev, { role: "assistant", content: "I couldn't generate a response. Please try again." }]);
      } else {
        playEcoSound();
        if (autoSpeak) {
          const responseLang = detectLanguageFromText(assistantSoFar);
          setTimeout(() => speak(assistantSoFar, responseLang), 150);
        }
      }
    } catch (err: any) {
      console.error("Chat error:", err);
      toast.error(err?.message || "Failed to get response");
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, something went wrong. Please try again." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const toggleListening = () => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      toast.error("Speech recognition is not supported in this browser. Please try Chrome or Edge.");
      return;
    }

    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 3;
    recognition.lang = speechLanguage === "auto" ? navigator.language || "en-IN" : speechLanguage;

    recognition.onstart = () => setListening(true);
    recognition.onresult = (event) => {
      const results = event.results;
      let transcript = "";
      for (let i = 0; i < results.length; i++) transcript += results[i][0].transcript;
      setInput(transcript);

      if (results[0].isFinal) {
        if (speechLanguage === "auto") {
          const detected = detectLanguageFromText(transcript);
          setTtsLang(detected);
        }
        sendMessage(transcript);
        setListening(false);
      }
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
    recognition.start();
  };

  return (
    <div className="page-container flex flex-col" style={{ height: "calc(100vh - 8rem)" }}>
      <div className="text-center mb-3">
        <h1 className="text-3xl sm:text-4xl font-display font-bold mb-1 eco-gradient-text">EcoVoice Assistant</h1>
        <p className="text-muted-foreground text-sm">Ask about any waste item — type or speak! I'll talk back 🔊</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 mb-3">
        <div className="flex-1">
          <TTSControls
            language={ttsLang}
            speechLanguage={speechLanguage}
            speed={ttsSpeed}
            autoSpeak={autoSpeak}
            voiceTone={voiceTone}
            voices={availableVoices}
            selectedVoiceURI={selectedVoiceURI}
            onLanguageChange={setTtsLang}
            onSpeechLanguageChange={setSpeechLanguage}
            onSpeedChange={setTtsSpeed}
            onAutoSpeakChange={setAutoSpeak}
            onVoiceToneChange={setVoiceTone}
            onVoiceChange={setSelectedVoiceURI}
          />
        </div>
        <div className="flex items-center bg-muted/50 rounded-xl px-3 border border-border/50">
          <LocationSelector location={location} onLocationChange={setLocation} />
        </div>
      </div>

      {listening && (
        <div className="flex items-center justify-center gap-3 py-2 mb-2 bg-destructive/10 rounded-xl border border-destructive/20">
          <WaveformAnimation active={listening} />
          <span className="text-sm font-medium text-destructive">Listening...</span>
        </div>
      )}

      <div className="flex-1 eco-card p-4 overflow-y-auto mb-4 space-y-4">
        {messages.map((msg, i) => (
          <ChatMessage key={i} role={msg.role} content={msg.content} index={i} onSpeak={msg.role === "assistant" ? speak : undefined} />
        ))}
        {isTyping && !messages[messages.length - 1]?.content && <TypingIndicator />}
        <div ref={chatEndRef} />
      </div>

      <div className="flex gap-2 pr-16">
        <div className="flex-1 relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
            placeholder="Ask about any waste item..."
            className="w-full bg-muted rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring border border-border/50"
            aria-label="Type your question"
          />
        </div>
        <Button size="icon" onClick={() => sendMessage(input)} className="shrink-0 rounded-xl" aria-label="Send message">
          <Send className="w-4 h-4" />
        </Button>
      </div>

      <FloatingVoiceButton listening={listening} onToggle={toggleListening} showOnAssistant />
    </div>
  );
};

export default Assistant;
