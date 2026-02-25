import { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Send, Leaf, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { SpeechRecognition as SpeechRecognitionType } from "@/types/speech.d";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-waste`;

const Assistant = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi! I'm your EcoVoice assistant 🌿\n\nAsk me about any waste item and I'll help you sort and dispose of it properly. You can type or use your microphone!" },
  ]);
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognitionType | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { role: "user", content: text.trim() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setIsTyping(true);

    let assistantSoFar = "";

    try {
      // Only send user/assistant messages (not the initial greeting for context)
      const apiMessages = updatedMessages
        .filter((_, i) => i > 0) // skip initial greeting
        .map((m) => ({ role: m.role, content: m.content }));

      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: apiMessages }),
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
          if (last?.role === "assistant" && prev.length > 1 && last !== messages[0]) {
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
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") { streamDone = true; break; }
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) upsertAssistant(content);
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Final flush
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split("\n")) {
          if (!raw) continue;
          if (raw.endsWith("\r")) raw = raw.slice(0, -1);
          if (raw.startsWith(":") || raw.trim() === "") continue;
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) upsertAssistant(content);
          } catch { /* ignore */ }
        }
      }

      // If no response was streamed, add a fallback
      if (!assistantSoFar) {
        setMessages((prev) => [...prev, { role: "assistant", content: "I couldn't generate a response. Please try again." }]);
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
      alert("Speech recognition is not supported in this browser. Please try Chrome or Edge.");
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
    recognition.lang = "en-US";

    recognition.onstart = () => setListening(true);

    recognition.onresult = (event) => {
      const results = event.results;
      let transcript = "";
      for (let i = 0; i < results.length; i++) {
        transcript += results[i][0].transcript;
      }
      setInput(transcript);

      if (results[0].isFinal) {
        sendMessage(transcript);
        setListening(false);
      }
    };

    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
    recognition.start();
  };

  const renderMarkdown = (text: string) => {
    return text.split("\n").map((line, i) => {
      const boldReplaced = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      return <p key={i} className="mb-1" dangerouslySetInnerHTML={{ __html: boldReplaced }} />;
    });
  };

  return (
    <div className="page-container flex flex-col" style={{ height: "calc(100vh - 8rem)" }}>
      <div className="text-center mb-6">
        <h1 className="text-3xl sm:text-4xl font-display font-bold mb-2">Voice & Text Assistant</h1>
        <p className="text-muted-foreground">Ask about any waste item — type or speak!</p>
      </div>

      <div className="flex-1 eco-card p-4 overflow-y-auto mb-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""} animate-fade-up`} style={{ animationDelay: `${i * 0.05}s` }}>
            {msg.role === "assistant" && (
              <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                <Leaf className="w-4 h-4 text-primary" />
              </div>
            )}
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
              msg.role === "user"
                ? "eco-gradient text-primary-foreground rounded-br-sm"
                : "bg-muted rounded-bl-sm"
            }`}>
              {msg.role === "assistant" ? renderMarkdown(msg.content) : <p>{msg.content}</p>}
            </div>
            {msg.role === "user" && (
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <User className="w-4 h-4 text-muted-foreground" />
              </div>
            )}
          </div>
        ))}

        {isTyping && !messages[messages.length - 1]?.content && (
          <div className="flex gap-3 animate-fade-in">
            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
              <Leaf className="w-4 h-4 text-primary" />
            </div>
            <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse-gentle" />
                <span className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse-gentle" style={{ animationDelay: "0.2s" }} />
                <span className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse-gentle" style={{ animationDelay: "0.4s" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="flex gap-2">
        <Button
          variant={listening ? "destructive" : "outline"}
          size="icon"
          onClick={toggleListening}
          className="shrink-0"
          aria-label={listening ? "Stop listening" : "Start voice input"}
        >
          {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </Button>
        <div className="flex-1 relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
            placeholder="Ask about any waste item..."
            className="w-full bg-muted rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Type your question"
          />
        </div>
        <Button size="icon" onClick={() => sendMessage(input)} className="shrink-0" aria-label="Send message">
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default Assistant;
