import { useState } from "react";
import { ThumbsUp, ThumbsDown, MessageSquare, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Classification {
  id: number;
  item: string;
  category: string;
  date: string;
  votes: { correct: number; incorrect: number };
  userVote?: "correct" | "incorrect";
}

const initialClassifications: Classification[] = [
  { id: 1, item: "Plastic water bottle", category: "Recycle", date: "2 hours ago", votes: { correct: 24, incorrect: 2 } },
  { id: 2, item: "Banana peel", category: "Compost", date: "3 hours ago", votes: { correct: 31, incorrect: 0 } },
  { id: 3, item: "Old headphones", category: "E-waste", date: "5 hours ago", votes: { correct: 18, incorrect: 3 } },
  { id: 4, item: "Pizza box (greasy)", category: "Landfill", date: "6 hours ago", votes: { correct: 12, incorrect: 8 } },
  { id: 5, item: "AA batteries", category: "Hazardous", date: "8 hours ago", votes: { correct: 28, incorrect: 1 } },
];

const Community = () => {
  const [classifications, setClassifications] = useState(initialClassifications);
  const [suggestion, setSuggestion] = useState("");
  const [showSuggestion, setShowSuggestion] = useState<number | null>(null);

  const vote = (id: number, type: "correct" | "incorrect") => {
    setClassifications((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const wasVoted = c.userVote;
        const newVotes = { ...c.votes };
        if (wasVoted) newVotes[wasVoted]--;
        if (wasVoted !== type) {
          newVotes[type]++;
          return { ...c, votes: newVotes, userVote: type };
        }
        return { ...c, votes: newVotes, userVote: undefined };
      })
    );
  };

  return (
    <div className="page-container">
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-display font-bold mb-2">Community Feedback</h1>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Your feedback helps train our AI. Mark results as correct or suggest corrections!
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="eco-card p-4 mb-6 flex items-center gap-3 bg-secondary/50">
          <MessageSquare className="w-5 h-5 text-primary shrink-0" />
          <p className="text-sm">Your feedback helps train our AI to be more accurate for everyone. 🌱</p>
        </div>

        <div className="space-y-3">
          {classifications.map((c, i) => (
            <div key={c.id} className="eco-card p-4 animate-fade-up" style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium">{c.item}</p>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground font-medium">
                      {c.category}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{c.date}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => vote(c.id, "correct")}
                    className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-colors ${
                      c.userVote === "correct" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-secondary"
                    }`}
                    aria-label="Mark as correct"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" /> {c.votes.correct}
                  </button>
                  <button
                    onClick={() => vote(c.id, "incorrect")}
                    className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-colors ${
                      c.userVote === "incorrect" ? "bg-destructive text-destructive-foreground" : "bg-muted hover:bg-secondary"
                    }`}
                    aria-label="Mark as incorrect"
                  >
                    <ThumbsDown className="w-3.5 h-3.5" /> {c.votes.incorrect}
                  </button>
                  <button
                    onClick={() => setShowSuggestion(showSuggestion === c.id ? null : c.id)}
                    className="p-1 rounded-lg text-xs bg-muted hover:bg-secondary transition-colors"
                    aria-label="Suggest correction"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {showSuggestion === c.id && (
                <div className="mt-3 pt-3 border-t border-border animate-fade-in">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={suggestion}
                      onChange={(e) => setSuggestion(e.target.value)}
                      placeholder="Suggest the correct category..."
                      className="flex-1 bg-muted rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                    <Button
                      size="sm"
                      onClick={() => {
                        setSuggestion("");
                        setShowSuggestion(null);
                      }}
                    >
                      Submit
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Community;
