import { Mic, MicOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import WaveformAnimation from "./WaveformAnimation";

interface FloatingVoiceButtonProps {
  listening?: boolean;
  onToggle?: () => void;
  showOnAssistant?: boolean;
}

const FloatingVoiceButton = ({ listening = false, onToggle, showOnAssistant = false }: FloatingVoiceButtonProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onToggle) {
      onToggle();
    } else {
      navigate("/assistant");
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 ${
        listening
          ? "bg-destructive text-destructive-foreground animate-pulse-gentle"
          : "eco-gradient text-primary-foreground hover:shadow-xl"
      }`}
      aria-label={listening ? "Stop listening" : "Voice assistant"}
      style={{ boxShadow: listening ? "0 0 20px hsl(0 72% 51% / 0.4)" : "0 4px 20px hsl(145 63% 42% / 0.3)" }}
    >
      {listening ? (
        <div className="flex flex-col items-center">
          <MicOff className="w-5 h-5" />
        </div>
      ) : (
        <Mic className="w-6 h-6" />
      )}
    </button>
  );
};

export default FloatingVoiceButton;
