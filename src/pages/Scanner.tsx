import { useState, useRef, useEffect } from "react";
import { Upload, Camera, Loader2, Recycle, Leaf, AlertTriangle, Zap, Trash2, CheckCircle, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { addScan } from "@/lib/scan-store";
import { getSavedLocation, getLocationRules, type UserLocation } from "@/lib/location";
import LocationSelector from "@/components/LocationSelector";

type WasteCategory = "Recycle" | "Compost" | "Landfill" | "Hazardous" | "E-waste";

interface AnalysisResult {
  category: WasteCategory;
  material: string;
  contamination: "Low" | "Medium" | "High";
  confidence: number;
  disposal: string;
  explanation: string;
}

const categoryConfig: Record<WasteCategory, { icon: React.ReactNode; color: string; bg: string }> = {
  Recycle: { icon: <Recycle className="w-6 h-6" />, color: "text-primary", bg: "bg-secondary" },
  Compost: { icon: <Leaf className="w-6 h-6" />, color: "text-primary", bg: "bg-secondary" },
  Landfill: { icon: <Trash2 className="w-6 h-6" />, color: "text-muted-foreground", bg: "bg-muted" },
  Hazardous: { icon: <AlertTriangle className="w-6 h-6" />, color: "text-eco-orange", bg: "bg-accent" },
  "E-waste": { icon: <Zap className="w-6 h-6" />, color: "text-eco-blue", bg: "bg-accent" },
};

const Scanner = () => {
  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [location, setLocation] = useState<UserLocation | null>(() => getSavedLocation());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target?.result as string);
      setResult(null);
      setShowSuccess(false);
    };
    reader.readAsDataURL(file);
  };

  const analyze = async () => {
    if (!image) return;
    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-waste", {
        body: { imageBase64: image },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const validated: AnalysisResult = {
        category: data.category || "Landfill",
        material: data.material || "Unknown",
        contamination: data.contamination || "Medium",
        confidence: data.confidence || 50,
        disposal: data.disposal || "Check local guidelines.",
        explanation: data.explanation || "Could not determine details.",
      };

      // Append location-specific rules
      if (location) {
        const localRule = getLocationRules(location, validated.material);
        validated.disposal = `${validated.disposal}\n\n📍 ${location.city} specific: ${localRule}`;
      }

      setResult(validated);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);

      await addScan({
        item: validated.material,
        category: validated.category,
        material: validated.material,
        confidence: validated.confidence,
        contamination: validated.contamination,
        disposal: validated.disposal,
        city: location?.city,
        state: location?.state,
        country: location?.country,
      });

      // Play success sound
      try {
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(523, ctx.currentTime);
        osc.frequency.setValueAtTime(784, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.3);
      } catch {}

      toast.success("🌱 Great job scanning! Your eco-impact is growing!");
    } catch (err: any) {
      console.error("Analysis failed:", err);
      toast.error(err?.message || "Failed to analyze image. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  const reset = () => {
    setImage(null);
    setResult(null);
    setShowSuccess(false);
  };

  const contaminationColor = (level: string) => {
    if (level === "Low") return "text-primary";
    if (level === "Medium") return "text-eco-yellow";
    return "text-eco-red";
  };

  return (
    <div className="page-container">
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-display font-bold mb-3 eco-gradient-text">Waste Scanner</h1>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Upload or capture an image of any waste item and our AI will identify it and tell you exactly how to dispose of it.
        </p>
      </div>

      <div className="max-w-xl mx-auto">
        {/* Location bar */}
        <div className="eco-card p-3 mb-4 flex items-center justify-between">
          <LocationSelector location={location} onLocationChange={setLocation} />
          {location && (
            <span className="text-xs text-muted-foreground hidden sm:block">
              Rules adapted for {location.city}
            </span>
          )}
        </div>

        {/* Success animation overlay */}
        {showSuccess && (
          <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
            <div className="flex flex-col items-center animate-scale-in">
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <CheckCircle className="w-16 h-16 text-primary animate-float" />
              </div>
              <p className="text-xl font-bold text-primary">Sorted! 🌱</p>
            </div>
          </div>
        )}

        {!image ? (
          <div
            className="eco-card p-12 text-center cursor-pointer hover:border-primary/50 transition-all duration-300 hover:shadow-md group"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-secondary flex items-center justify-center group-hover:scale-110 transition-transform">
              <Upload className="w-8 h-8 text-primary" />
            </div>
            <p className="font-semibold mb-1">Upload an image</p>
            <p className="text-sm text-muted-foreground mb-4">Drag & drop or click to browse</p>
            <div className="flex justify-center gap-3">
              <Button onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }} className="rounded-xl">
                <Upload className="w-4 h-4 mr-2" /> Upload
              </Button>
              <Button variant="outline" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }} className="rounded-xl">
                <Camera className="w-4 h-4 mr-2" /> Camera
              </Button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="eco-card overflow-hidden">
              <img src={image} alt="Uploaded waste" className="w-full max-h-80 object-contain bg-muted" />
            </div>

            {!result && !analyzing && (
              <div className="flex gap-3">
                <Button className="flex-1 rounded-xl" onClick={analyze}>Analyze Waste</Button>
                <Button variant="outline" onClick={reset} className="rounded-xl">Clear</Button>
              </div>
            )}

            {analyzing && (
              <div className="eco-card p-8 text-center">
                <Loader2 className="w-10 h-10 text-primary mx-auto mb-3 animate-spin" />
                <p className="font-medium">Analyzing your waste item...</p>
                <p className="text-sm text-muted-foreground">Our AI is identifying the material</p>
              </div>
            )}

            {result && (
              <div className="eco-card p-6 animate-scale-in space-y-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl ${categoryConfig[result.category]?.bg || "bg-muted"} flex items-center justify-center ${categoryConfig[result.category]?.color || "text-muted-foreground"}`}>
                    {categoryConfig[result.category]?.icon || <Trash2 className="w-6 h-6" />}
                  </div>
                  <div>
                    <p className="font-bold text-lg">{result.category}</p>
                    <p className="text-sm text-muted-foreground">{result.material}</p>
                  </div>
                  <div className="ml-auto text-right">
                    <p className="text-2xl font-bold text-primary">{result.confidence}%</p>
                    <p className="text-xs text-muted-foreground">confidence</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-muted rounded-xl p-3">
                    <p className="text-xs text-muted-foreground mb-1">Contamination Risk</p>
                    <p className={`font-semibold ${contaminationColor(result.contamination)}`}>
                      {result.contamination}
                    </p>
                  </div>
                  <div className="bg-muted rounded-xl p-3">
                    <p className="text-xs text-muted-foreground mb-1">Material</p>
                    <p className="font-semibold">{result.material}</p>
                  </div>
                </div>

                <div className="bg-secondary rounded-xl p-4">
                  <p className="text-xs font-medium text-secondary-foreground mb-1">Disposal Instructions</p>
                  <p className="text-sm whitespace-pre-line">{result.disposal}</p>
                </div>

                {location && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    <span>Guidelines adapted for {location.city}, {location.state}</span>
                  </div>
                )}

                <p className="text-sm text-muted-foreground">{result.explanation}</p>

                <Button variant="outline" className="w-full rounded-xl" onClick={reset}>
                  Scan Another Item
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Scanner;
