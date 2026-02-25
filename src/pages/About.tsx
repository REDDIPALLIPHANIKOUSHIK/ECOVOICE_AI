import { Brain, MapPin, AlertTriangle, BarChart3, Users, Leaf } from "lucide-react";

const features = [
  {
    icon: <Brain className="w-6 h-6" />,
    title: "Multimodal AI Fusion",
    desc: "Our AI understands waste through images, voice, and text. Upload a photo, describe what you see, or just ask — EcoVoice figures out the rest.",
  },
  {
    icon: <MapPin className="w-6 h-6" />,
    title: "Context-Aware Local Rules",
    desc: "Recycling rules differ by location. EcoVoice adapts its advice to your area's specific disposal guidelines and facilities.",
  },
  {
    icon: <AlertTriangle className="w-6 h-6" />,
    title: "Contamination Risk Prediction",
    desc: "Not all waste is clean. Our AI predicts contamination levels so you know when extra cleaning or special disposal is needed.",
  },
  {
    icon: <BarChart3 className="w-6 h-6" />,
    title: "Eco-Impact Tracking",
    desc: "See your real environmental impact — from CO₂ saved to water conserved. Small actions add up to big change!",
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: "Self-Learning Community",
    desc: "Every piece of feedback improves our AI. Together, we're building the smartest waste sorting assistant on the planet.",
  },
];

const About = () => {
  return (
    <div className="page-container">
      <div className="text-center mb-12 max-w-2xl mx-auto">
        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl eco-gradient flex items-center justify-center">
          <Leaf className="w-7 h-7 text-primary-foreground" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-bold mb-3">How EcoVoice Works</h1>
        <p className="text-muted-foreground text-lg">
          EcoVoice is your intelligent sustainability assistant — combining cutting-edge AI with community wisdom to make waste sorting effortless.
        </p>
      </div>

      <div className="max-w-3xl mx-auto space-y-6">
        {features.map((feature, i) => (
          <div key={i} className="eco-card p-6 flex gap-5 items-start animate-fade-up" style={{ animationDelay: `${i * 0.1}s` }}>
            <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-primary shrink-0">
              {feature.icon}
            </div>
            <div>
              <h3 className="font-display font-semibold text-lg mb-1">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{feature.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-12 eco-card p-8 max-w-2xl mx-auto">
        <h2 className="font-display font-bold text-xl mb-2">Our Mission</h2>
        <p className="text-muted-foreground leading-relaxed">
          We believe everyone can make a difference. EcoVoice empowers you with the knowledge to sort waste correctly, reduce contamination, and track your positive impact on the planet. Together, we're building a cleaner future — one scan at a time. 🌍
        </p>
      </div>
    </div>
  );
};

export default About;
