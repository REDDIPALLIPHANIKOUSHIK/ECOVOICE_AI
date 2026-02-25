import { Link } from "react-router-dom";
import { Camera, Mic, MessageSquare, ArrowRight, Recycle, BarChart3, Users, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-eco.jpg";

const steps = [
  { icon: <Camera className="w-6 h-6" />, title: "Upload / Speak / Type", desc: "Share your waste item via image, voice, or text" },
  { icon: <Recycle className="w-6 h-6" />, title: "AI Analyzes", desc: "Our smart engine identifies material and category" },
  { icon: <Leaf className="w-6 h-6" />, title: "Smart Disposal Advice", desc: "Get personalized sorting and recycling instructions" },
];

const features = [
  { icon: <Camera className="w-5 h-5" />, title: "Image Recognition", desc: "Snap a photo and instantly know how to sort it" },
  { icon: <Mic className="w-5 h-5" />, title: "Voice Assistant", desc: "Ask by voice — hands-free waste sorting" },
  { icon: <MessageSquare className="w-5 h-5" />, title: "Text Chat", desc: "Type any waste-related question for instant help" },
  { icon: <BarChart3 className="w-5 h-5" />, title: "Impact Tracking", desc: "See your CO₂, water, and energy savings" },
  { icon: <Users className="w-5 h-5" />, title: "Community Powered", desc: "Your feedback trains smarter AI for everyone" },
  { icon: <Recycle className="w-5 h-5" />, title: "Local Rules", desc: "Disposal advice adapted to your location" },
];

const Landing = () => {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary via-background to-accent opacity-80" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-up">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold leading-tight mb-6">
                Sort Smarter.{" "}
                <span className="eco-gradient-text">Live Greener.</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-lg">
                EcoVoice is your AI-powered sustainability assistant. Identify, sort, and manage waste using image, voice, or text — all in one place.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg" className="rounded-xl text-base px-6">
                  <Link to="/scanner">
                    Try Waste Scanner <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="rounded-xl text-base px-6">
                  <Link to="/about">Learn More</Link>
                </Button>
              </div>
            </div>
            <div className="animate-fade-up hidden lg:block" style={{ animationDelay: "0.2s" }}>
              <img
                src={heroImage}
                alt="EcoVoice sustainability illustration"
                className="w-full rounded-3xl shadow-lg eco-glow"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step Process */}
      <section className="py-16 bg-card">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-center mb-10">
            How It Works
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {steps.map((step, i) => (
              <div key={i} className="text-center animate-fade-up" style={{ animationDelay: `${i * 0.15}s` }}>
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-secondary flex items-center justify-center text-primary">
                  {step.icon}
                </div>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-full eco-gradient text-primary-foreground text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <h3 className="font-display font-semibold">{step.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-center mb-10">
            Everything You Need
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feat, i) => (
              <div key={i} className="eco-card p-5 animate-fade-up" style={{ animationDelay: `${i * 0.08}s` }}>
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-primary mb-3">
                  {feat.icon}
                </div>
                <h3 className="font-display font-semibold mb-1">{feat.title}</h3>
                <p className="text-sm text-muted-foreground">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-card">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-display font-bold mb-4">
            Ready to make a difference?
          </h2>
          <p className="text-muted-foreground mb-6">
            Start scanning waste items and track your environmental impact today.
          </p>
          <Button asChild size="lg" className="rounded-xl text-base px-8">
            <Link to="/scanner">
              Get Started <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Landing;
