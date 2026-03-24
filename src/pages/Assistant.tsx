import { useState, useRef, useEffect } from "react";
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
import { useVoiceEngine, detectLanguage } from "@/hooks/useVoiceEngine";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-waste`;

const Assistant = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi! I'm EcoVoice 🌿\n\nAsk me about any waste item, water saving, or sustainability tip. Type or use your microphone — I'll speak the answer back!\n\nTry: \"How do I recycle a plastic bottle?\" or \"How to save water?\"" },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [location, setLocation] = useState<UserLocation | null>(() => getSavedLocation());
  const chatEndRef = useRef<HTMLDivElement>(null);

  const voice = useVoiceEngine();

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    const inferredLang = voice.resolvedLang(text);

    const userMsg: Message = { role: "user", content: text.trim() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setIsTyping(true);

    let assistantSoFar = "";

    try {
      const apiMessages = updatedMessages.filter((_, i) => i > 0).map(m => ({ role: m.role, content: m.content }));
      const locationContext = location
        ? `User is in ${location.city}, ${location.state}, ${location.country}. Local rules: ${getLocationRules(location)}`
        : "User location unknown. Provide general recycling guidelines.";

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
          if (jsonStr === "[DONE]") { streamDone = true; break; }
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) upsertAssistant(content);
          } catch { /* skip */ }
        }
      }

      if (!assistantSoFar) {
        setMessages(prev => [...prev, { role: "assistant", content: "I couldn't generate a response. Please try again." }]);
      } else {
        voice.playEcoSound();
        if (voice.autoSpeak) {
          const responseLang = detectLanguage(assistantSoFar);
          setTimeout(() => voice.speak(assistantSoFar, responseLang), 200);
        }
      }
    } catch (err: any) {
      console.error("Chat error:", err);
      toast.error(err?.message || "Failed to get response");
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, something went wrong. Please try again." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="page-container flex flex-col" style={{ height: "calc(100vh - 8rem)" }}>
      <div className="text-center mb-3">
        <h1 className="text-3xl sm:text-4xl font-display font-bold mb-1 eco-gradient-text">EcoVoice Assistant</h1>
        <p className="text-muted-foreground text-sm">Ask about waste, water, or sustainability — type or speak! 🔊</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 mb-3">
        <div className="flex-1">
          <TTSControls
            language={voice.language}
            voiceTone={voice.voiceTone}
            autoSpeak={voice.autoSpeak}
            onLanguageChange={voice.setLanguage}
            onVoiceToneChange={voice.setVoiceTone}
            onAutoSpeakChange={voice.setAutoSpeak}
            onStop={voice.stopSpeaking}
            isSpeaking={voice.isSpeaking}
          />
        </div>
        <div className="flex items-center bg-muted/50 rounded-xl px-3 border border-border/50">
          <LocationSelector location={location} onLocationChange={setLocation} />
        </div>
      </div>

      {voice.listening && (
        <div className="flex items-center justify-center gap-3 py-2 mb-2 bg-destructive/10 rounded-xl border border-destructive/20">
          <WaveformAnimation active={voice.listening} />
          <span className="text-sm font-medium text-destructive">Listening...</span>
        </div>
      )}

      <div className="flex-1 eco-card p-4 overflow-y-auto mb-4 space-y-4">
        {messages.map((msg, i) => (
          <ChatMessage key={i} role={msg.role} content={msg.content} index={i} onSpeak={msg.role === "assistant" ? voice.speak : undefined} />
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
            placeholder="Ask about waste, water, or sustainability..."
            className="w-full bg-muted rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring border border-border/50"
            aria-label="Type your question"
          />
        </div>
        <Button size="icon" onClick={() => sendMessage(input)} className="shrink-0 rounded-xl" aria-label="Send message">
          <Send className="w-4 h-4" />
        </Button>
      </div>

      <FloatingVoiceButton listening={voice.listening} onToggle={() => voice.startListening(sendMessage)} showOnAssistant />
    </div>
  );
};

export default Assistant;
