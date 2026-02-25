import { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Send, Leaf, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SpeechRecognition as SpeechRecognitionType } from "@/types/speech.d";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const wasteResponses: Record<string, string> = {
  default: `**Category:** General Waste\n**Disposal:** Check your local guidelines for proper disposal.\n**Contamination Risk:** Medium\n**Eco Tip:** When in doubt, clean and separate materials before disposal! 🌱`,
  plastic: `**Category:** ♻️ Recyclable\n**Disposal:** Rinse the plastic container and place in your recycling bin. Remove any caps or labels.\n**Contamination Risk:** Low\n**Eco Tip:** Choose reusable bottles and containers to reduce plastic waste by up to 80%! 🌿`,
  battery: `**Category:** ⚠️ Hazardous\n**Disposal:** Never throw batteries in regular trash! Take them to a battery recycling drop-off point.\n**Contamination Risk:** High\n**Eco Tip:** Consider rechargeable batteries — they last years and prevent hundreds of disposable batteries from reaching landfills! 🔋`,
  food: `**Category:** 🌱 Compostable\n**Disposal:** Place in your green compost bin. Remove any packaging first.\n**Contamination Risk:** Low\n**Eco Tip:** Composting food scraps can reduce your household waste by 30% and creates nutrient-rich soil! 🥕`,
  phone: `**Category:** 📱 E-Waste\n**Disposal:** Take to a certified e-waste recycling center. Many retailers offer trade-in programs.\n**Contamination Risk:** High\n**Eco Tip:** One recycled phone can save enough energy to charge a laptop for 44 hours! ♻️`,
  paper: `**Category:** ♻️ Recyclable\n**Disposal:** Place in your paper recycling bin. Remove any plastic windows or staples.\n**Contamination Risk:** Low\n**Eco Tip:** Recycling one ton of paper saves 17 trees and 7,000 gallons of water! 📄`,
};

const getResponse = (input: string): string => {
  const lower = input.toLowerCase();
  if (lower.includes("plastic") || lower.includes("bottle")) return wasteResponses.plastic;
  if (lower.includes("battery") || lower.includes("batteries")) return wasteResponses.battery;
  if (lower.includes("food") || lower.includes("banana") || lower.includes("apple")) return wasteResponses.food;
  if (lower.includes("phone") || lower.includes("laptop") || lower.includes("computer")) return wasteResponses.phone;
  if (lower.includes("paper") || lower.includes("cardboard")) return wasteResponses.paper;
  return wasteResponses.default;
};

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

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { role: "user", content: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const response = getResponse(text);
      setMessages((prev) => [...prev, { role: "assistant", content: response }]);
      setIsTyping(false);
    }, 1000);
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

        {isTyping && (
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
