import { Leaf, User, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  index: number;
  onSpeak?: (text: string) => void;
}

const renderMarkdown = (text: string) => {
  return text.split("\n").map((line, i) => {
    const boldReplaced = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    return <p key={i} className="mb-1" dangerouslySetInnerHTML={{ __html: boldReplaced }} />;
  });
};

const ChatMessage = ({ role, content, index, onSpeak }: ChatMessageProps) => (
  <div className={`flex gap-3 ${role === "user" ? "justify-end" : ""} animate-fade-up`} style={{ animationDelay: `${index * 0.05}s` }}>
    {role === "assistant" && (
      <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
        <Leaf className="w-4 h-4 text-primary" />
      </div>
    )}
    <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
      role === "user"
        ? "eco-gradient text-primary-foreground rounded-br-sm"
        : "bg-muted rounded-bl-sm"
    }`}>
      {role === "assistant" ? (
        <div>
          {renderMarkdown(content)}
          {onSpeak && content && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-1 h-7 px-2 text-xs gap-1 text-muted-foreground hover:text-primary"
              onClick={() => onSpeak(content)}
            >
              <Volume2 className="w-3 h-3" /> Listen
            </Button>
          )}
        </div>
      ) : (
        <p>{content}</p>
      )}
    </div>
    {role === "user" && (
      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
        <User className="w-4 h-4 text-muted-foreground" />
      </div>
    )}
  </div>
);

export default ChatMessage;
