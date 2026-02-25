import { useState, useRef } from "react";
import { Upload, Camera, Loader2, Recycle, Leaf, AlertTriangle, Zap, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

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

const mockResults: AnalysisResult[] = [
  { category: "Recycle", material: "PET Plastic (#1)", contamination: "Low", confidence: 94, disposal: "Rinse and place in your blue recycling bin. Remove caps and labels if possible.", explanation: "This appears to be a PET plastic bottle, one of the most commonly recycled plastics." },
  { category: "Compost", material: "Organic Food Waste", contamination: "Low", confidence: 88, disposal: "Place in your green compost bin. Can also be home composted.", explanation: "Organic food waste breaks down naturally and creates nutrient-rich soil." },
  { category: "E-waste", material: "Circuit Board / Electronics", contamination: "High", confidence: 91, disposal: "Take to your local e-waste collection point. Do not place in regular bins.", explanation: "Electronic waste contains valuable metals but also hazardous materials." },
  { category: "Hazardous", material: "Battery (Lithium-ion)", contamination: "High", confidence: 96, disposal: "Drop off at a battery recycling station. Never throw in regular trash.", explanation: "Batteries contain chemicals that can leak and contaminate soil and water." },
];

const Scanner = () => {
  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target?.result as string);
      setResult(null);
    };
    reader.readAsDataURL(file);
  };

  const analyze = () => {
    setAnalyzing(true);
    setTimeout(() => {
      setResult(mockResults[Math.floor(Math.random() * mockResults.length)]);
      setAnalyzing(false);
    }, 2000);
  };

  const reset = () => {
    setImage(null);
    setResult(null);
  };

  const contaminationColor = (level: string) => {
    if (level === "Low") return "text-primary";
    if (level === "Medium") return "text-eco-yellow";
    return "text-eco-red";
  };

  return (
    <div className="page-container">
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-display font-bold mb-3">Waste Scanner</h1>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Upload or capture an image of any waste item and our AI will identify it and tell you exactly how to dispose of it.
        </p>
      </div>

      <div className="max-w-xl mx-auto">
        {!image ? (
          <div
            className="eco-card p-12 text-center cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-secondary flex items-center justify-center">
              <Upload className="w-8 h-8 text-primary" />
            </div>
            <p className="font-semibold mb-1">Upload an image</p>
            <p className="text-sm text-muted-foreground mb-4">Drag & drop or click to browse</p>
            <div className="flex justify-center gap-3">
              <Button onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                <Upload className="w-4 h-4 mr-2" /> Upload
              </Button>
              <Button variant="outline" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
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
                <Button className="flex-1" onClick={analyze}>Analyze Waste</Button>
                <Button variant="outline" onClick={reset}>Clear</Button>
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
                  <div className={`w-12 h-12 rounded-xl ${categoryConfig[result.category].bg} flex items-center justify-center ${categoryConfig[result.category].color}`}>
                    {categoryConfig[result.category].icon}
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
                  <p className="text-sm">{result.disposal}</p>
                </div>

                <p className="text-sm text-muted-foreground">{result.explanation}</p>

                <Button variant="outline" className="w-full" onClick={reset}>
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
