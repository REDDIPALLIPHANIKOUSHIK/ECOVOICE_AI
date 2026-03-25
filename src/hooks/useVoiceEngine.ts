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
  const voicesLoadedRef = useRef(false);
  const activeSpeechSessionRef = useRef(0);
  const userInteractionReadyRef = useRef(false);

  // Pre-load voices and wait for them
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        voicesLoadedRef.current = true;
        console.log("[EcoVoice] Voices loaded:", voices.length);
        console.log("[EcoVoice] Indian voices:", voices.filter(v => v.lang.includes("IN")).map(v => `${v.name} (${v.lang})`));
      }
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, []);

  const resolvedLang = useCallback((text?: string): string => {
    if (language !== "auto") return language;
    return text ? detectLanguage(text) : "en-IN";
  }, [language]);

  const registerInteraction = useCallback(() => {
    userInteractionReadyRef.current = true;
    try {
      window.speechSynthesis.resume();
    } catch {
      // no-op
    }
  }, []);

  const pickVoice = useCallback((lang: string) => {
    const voices = window.speechSynthesis.getVoices();
    const exactMatch = voices.find(v => v.lang === lang);
    const partialMatch = voices.find(v => v.lang.startsWith(lang.split("-")[0]));
    const fallback = voices.find(v => v.lang.includes("IN")) || voices[0];
    return exactMatch || partialMatch || fallback;
  }, []);

  const splitSpeechChunks = useCallback((text: string) => {
    const sentenceChunks = text.match(/[^.!?]+[.!?]?/g)?.map(s => s.trim()).filter(Boolean) || [];
    if (sentenceChunks.length > 0) return sentenceChunks;

    const words = text.split(/\s+/).filter(Boolean);
    const chunks: string[] = [];
    for (let i = 0; i < words.length; i += 18) {
      chunks.push(words.slice(i, i + 18).join(" "));
    }
    return chunks;
  }, []);

  const stopSpeaking = useCallback(() => {
    activeSpeechSessionRef.current += 1;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  const speak = useCallback((text: string, forceLang?: string) => {
    // Always cancel previous speech first (prevents overlap/interruption)
    activeSpeechSessionRef.current += 1;
    const sessionId = activeSpeechSessionRef.current;
    window.speechSynthesis.cancel();

    const clean = text.replace(/\*\*(.*?)\*\*/g, "$1").replace(/[#*_~`]/g, "").trim();
    if (!clean) return;

    const lang = forceLang || resolvedLang(text);
    const chunks = splitSpeechChunks(clean);
    console.log(`[EcoVoice] Full response length: ${clean.length}`);
    console.log(`[EcoVoice] Number of speech chunks: ${chunks.length}`);
    console.log(`[EcoVoice] Language used: ${lang}`);

    if (!userInteractionReadyRef.current) {
      console.warn("[EcoVoice] Speech may be blocked: no prior user interaction captured");
    }

    const speakChunk = (index: number, attempt: number) => {
      if (activeSpeechSessionRef.current !== sessionId) return;
      if (index >= chunks.length) {
        console.log("[EcoVoice] Speech completed (all chunks)");
        setIsSpeaking(false);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(chunks[index]);
      utterance.lang = lang;
      utterance.rate = voiceTone === "friendly" ? 1.0 : 0.9;
      utterance.pitch = voiceTone === "friendly" ? 1.05 : 0.9;

      const selectedVoice = pickVoice(lang);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
        console.log(`[EcoVoice] Selected voice: ${selectedVoice.name} (${selectedVoice.lang})`);
      } else {
        console.log(`[EcoVoice] No voice found for ${lang}, using default`);
      }

      setIsSpeaking(true);
      console.log(`[EcoVoice] Speech start chunk ${index + 1}/${chunks.length} (attempt ${attempt + 1})`);

      utterance.onend = () => {
        if (activeSpeechSessionRef.current !== sessionId) return;
        console.log(`[EcoVoice] Speech end chunk ${index + 1}/${chunks.length}`);
        setTimeout(() => speakChunk(index + 1, 0), 30);
      };

      utterance.onerror = (e) => {
        if (activeSpeechSessionRef.current !== sessionId) return;
        console.warn("[EcoVoice] Speech error:", e.error);
        if (attempt < 1) {
          toast.info("Retrying voice…");
          setTimeout(() => speakChunk(index, attempt + 1), 500);
        } else {
          setIsSpeaking(false);
          toast.error("Voice playback failed. Try again.");
        }
      };

      window.speechSynthesis.speak(utterance);

      // Trigger guard + Chrome bug workaround
      setTimeout(() => {
        if (activeSpeechSessionRef.current !== sessionId) return;
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
        const notSpeaking = !window.speechSynthesis.speaking && !window.speechSynthesis.pending;
        if (notSpeaking && attempt < 1) {
          toast.info("Retrying voice…");
          setTimeout(() => speakChunk(index, attempt + 1), 500);
        }
      }, 220);
    };

    // Small defer helps ensure cancel has fully settled before the first chunk
    setTimeout(() => speakChunk(0, 0), 60);
  }, [pickVoice, resolvedLang, splitSpeechChunks, voiceTone]);

  const startListening = useCallback((onResult: (transcript: string) => void) => {
    registerInteraction();
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

    // Stop any current speech
    window.speechSynthesis.cancel();
    setIsSpeaking(false);

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = language === "auto" ? (navigator.language || "en-IN") : language;

    recognition.onstart = () => {
      setListening(true);
      console.log("[EcoVoice] Listening started, lang:", recognition.lang);
    };

    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      if (event.results[0].isFinal) {
        console.log("[EcoVoice] Transcript:", transcript);
        onResult(transcript);
        setListening(false);
      }
    };

    recognition.onerror = (e) => {
      console.warn("[EcoVoice] Recognition error:", e);
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
  }, [language, listening, registerInteraction]);

  const playEcoSound = useCallback(() => {
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(523, ctx.currentTime);
      osc.frequency.setValueAtTime(659, ctx.currentTime + 0.1);
      osc.frequency.setValueAtTime(784, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.4);
    } catch { /* no-op */ }
  }, []);

  return {
    listening, isSpeaking, language, voiceTone, autoSpeak,
    setLanguage, setVoiceTone, setAutoSpeak,
    speak, stopSpeaking, startListening, playEcoSound, resolvedLang, registerInteraction,
  };
}
