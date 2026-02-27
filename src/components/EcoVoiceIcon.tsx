// Custom EcoVoice SVG icon — leaf + microphone combination
const EcoVoiceIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Leaf shape */}
    <path
      d="M8 32C8 32 10 18 22 10C18 16 16 22 16 28C16 28 14 32 8 32Z"
      fill="currentColor"
      opacity="0.7"
    />
    <path
      d="M8 32C12 28 14 22 22 10"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      opacity="0.5"
    />
    {/* Microphone body */}
    <rect x="22" y="8" width="8" height="14" rx="4" fill="currentColor" />
    {/* Microphone arc */}
    <path
      d="M19 18C19 23.523 22.477 26 26 26C29.523 26 33 23.523 33 18"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
    />
    {/* Microphone stand */}
    <line x1="26" y1="26" x2="26" y2="31" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <line x1="22" y1="31" x2="30" y2="31" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    {/* Sound waves */}
    <path d="M34 13C35.5 14 36 16 35.5 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
    <path d="M36 11C38.5 13 39.5 16.5 38.5 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
  </svg>
);

export default EcoVoiceIcon;
