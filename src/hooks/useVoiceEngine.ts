import { useState, useRef, useCallback, useEffect } from "react";
import { toast } from "sonner";
import type { SpeechRecognition as SpeechRecognitionType } from "@/types/speech.d";

const LANGUAGE_PATTERNS: Array<{ lang: string; regex: RegExp }> = [
  { lang: "hi-IN", regex: /[\u0900-\u097F]/ },
  { lang: "te-IN", regex: /[\u0C00-\u0C7F]/ },
  { lang: "ta-IN", regex: /[\u0B80-\u0BFF]/ },
  { lang: "kn-IN", regex: /[\u0C80-\u0CFF]/ },
];

export const detectLanguage = (text: string): string => {
  for (const p of LANGUAGE_PATTERNS) {
    if (p.regex.test(text)) return p.lang;
  }
  return "en-IN";
};

export function useVoiceEngine() {
  const [listening, setListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [language, setLanguage] = useState("auto");
  const [voiceTone, setVoiceTone] = useState<"friendly" | "formal">("friendly");
  const [autoSpeak, setAutoSpeak] = useState(true);
  const recognitionRef = useRef<SpeechRecognitionType | null>(null);
  const speakQueueRef = useRef<Promise<void>>(Promise.resolve());
  const retryCountRef = useRef(0);

  // Load voices early
  useEffect(() => {
    window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, []);

  const resolvedLang = useCallback((text?: string): string => {
    if (language !== "auto") return language;
    return text ? detectLanguage(text) : "en-IN";
  }, [language]);

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  const speak = useCallback((text: string, forceLang?: string) => {
    const doSpeak = async () => {
      window.speechSynthesis.cancel();
      const clean = text.replace(/\*\*(.*?)\*\*/g, "$1").replace(/[#*_~`]/g, "").trim();
      if (!clean) return;

      const lang = forceLang || resolvedLang(text);
      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.lang = lang;
      utterance.rate = voiceTone === "friendly" ? 1.0 : 0.9;
      utterance.pitch = voiceTone === "friendly" ? 1.05 : 0.9;

      const voices = window.speechSynthesis.getVoices();
      const match = voices.find(v => v.lang === lang) || voices.find(v => v.lang.startsWith(lang.split("-")[0]));
      if (match) utterance.voice = match;

      setIsSpeaking(true);
      try {
        await new Promise<void>((resolve, reject) => {
          utterance.onend = () => resolve();
          utterance.onerror = (e) => reject(e);
          window.speechSynthesis.speak(utterance);
          setTimeout(() => resolve(), 30000); // safety timeout
        });
      } catch (err) {
        // Retry once
        if (retryCountRef.current < 1) {
          retryCountRef.current++;
          await new Promise(r => setTimeout(r, 300));
          window.speechSynthesis.speak(utterance);
          await new Promise<void>(resolve => {
            utterance.onend = () => resolve();
            utterance.onerror = () => resolve();
            setTimeout(() => resolve(), 30000);
          });
        }
      } finally {
        retryCountRef.current = 0;
        setIsSpeaking(false);
      }
    };

    speakQueueRef.current = speakQueueRef.current.then(doSpeak).catch(() => setIsSpeaking(false));
  }, [resolvedLang, voiceTone]);

  const startListening = useCallback((onResult: (transcript: string) => void) => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      toast.error("Speech recognition not supported. Try Chrome or Edge.");
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
    recognition.lang = language === "auto" ? (navigator.language || "en-IN") : language;

    recognition.onstart = () => setListening(true);
    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) transcript += event.results[i][0].transcript;
      if (event.results[0].isFinal) {
        onResult(transcript);
        setListening(false);
      }
    };
    recognition.onerror = () => {
      setListening(false);
      toast.error("Voice recognition failed. Please try again.");
    };
    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch {
      toast.error("Could not access microphone.");
    }
  }, [listening, language]);

  const playEcoSound = useCallback(() => {
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(523, ctx.currentTime);
      osc.frequency.setValueAtTime(659, ctx.currentTime + 0.1);
      osc.frequency.setValueAtTime(784, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.4);
    } catch { /* no-op */ }
  }, []);

  return {
    listening, isSpeaking, language, voiceTone, autoSpeak,
    setLanguage, setVoiceTone, setAutoSpeak,
    speak, stopSpeaking, startListening, playEcoSound, resolvedLang,
  };
}
