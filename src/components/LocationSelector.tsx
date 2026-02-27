import { useState } from "react";
import { MapPin, RefreshCw, X, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { detectLocation, clearLocation, type UserLocation } from "@/lib/location";
import { toast } from "sonner";

interface LocationSelectorProps {
  location: UserLocation | null;
  onLocationChange: (loc: UserLocation | null) => void;
}

const LocationSelector = ({ location, onLocationChange }: LocationSelectorProps) => {
  const [detecting, setDetecting] = useState(false);

  const detect = async () => {
    setDetecting(true);
    try {
      const loc = await detectLocation();
      onLocationChange(loc);
      toast.success(`📍 Location set to ${loc.city}, ${loc.state}`);
    } catch {
      toast.error("Could not detect location. Using general guidelines.");
      onLocationChange(null);
    } finally {
      setDetecting(false);
    }
  };

  const clear = () => {
    clearLocation();
    onLocationChange(null);
    toast.info("Location cleared. Using general recycling guidelines.");
  };

  return (
    <div className="flex items-center gap-2 text-xs">
      <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
      {location ? (
        <>
          <span className="text-muted-foreground truncate max-w-[150px]">
            {location.city}, {location.state}
          </span>
          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs gap-1" onClick={detect} disabled={detecting}>
            <Navigation className={`w-3 h-3 ${detecting ? "animate-spin" : ""}`} />
            Change
          </Button>
          <Button variant="ghost" size="sm" className="h-6 px-1.5" onClick={clear}>
            <X className="w-3 h-3" />
          </Button>
        </>
      ) : (
        <Button variant="ghost" size="sm" className="h-6 text-xs gap-1" onClick={detect} disabled={detecting}>
          {detecting ? <RefreshCw className="w-3 h-3 animate-spin" /> : null}
          {detecting ? "Detecting..." : "Enable Location"}
        </Button>
      )}
    </div>
  );
};

export default LocationSelector;
