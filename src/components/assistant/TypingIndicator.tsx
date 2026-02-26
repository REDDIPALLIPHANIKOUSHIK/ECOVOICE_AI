import { Leaf } from "lucide-react";

const TypingIndicator = () => (
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
);

export default TypingIndicator;
