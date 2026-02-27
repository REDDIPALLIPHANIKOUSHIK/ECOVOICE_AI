// Animated waveform bars for voice recording state
const WaveformAnimation = ({ active }: { active: boolean }) => {
  if (!active) return null;
  return (
    <div className="flex items-center justify-center gap-[3px] h-8">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="w-1 rounded-full bg-primary"
          style={{
            animation: `waveform 1s ease-in-out ${i * 0.1}s infinite`,
            height: "8px",
          }}
        />
      ))}
      <style>{`
        @keyframes waveform {
          0%, 100% { height: 8px; opacity: 0.5; }
          50% { height: 24px; opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default WaveformAnimation;
