import { Link, useLocation } from "react-router-dom";
import { Menu, X, Home, Camera, MessageSquare, BarChart3, Clock, Droplets, Info } from "lucide-react";
import { useState } from "react";
import EcoVoiceIcon from "./EcoVoiceIcon";

const navLinks = [
  { to: "/", label: "Home", icon: Home },
  { to: "/scanner", label: "Scanner", icon: Camera },
  { to: "/assistant", label: "Assistant", icon: MessageSquare },
  { to: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { to: "/history", label: "History", icon: Clock },
  { to: "/water", label: "Water", icon: Droplets },
  { to: "/about", label: "About", icon: Info },
];

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 font-display font-bold text-xl group">
            <div className="w-8 h-8 rounded-lg eco-gradient flex items-center justify-center text-primary-foreground transition-transform group-hover:scale-110">
              <EcoVoiceIcon className="w-5 h-5" />
            </div>
            <span className="eco-gradient-text">EcoVoice</span>
          </Link>

          <nav className="hidden md:flex items-center gap-0.5">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
                    isActive
                      ? "bg-secondary text-secondary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <Icon className={`w-4 h-4 transition-colors ${isActive ? "text-primary" : ""}`} />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <button
            className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {mobileOpen && (
          <nav className="md:hidden border-t border-border bg-background animate-fade-in">
            <div className="px-4 py-2 space-y-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.to;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-secondary text-secondary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? "text-primary" : ""}`} />
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </nav>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border bg-card">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-sm text-muted-foreground">
          <div className="flex items-center justify-center gap-2 mb-2">
            <EcoVoiceIcon className="w-4 h-4 text-primary" />
            <span className="font-display font-semibold text-foreground">EcoVoice</span>
          </div>
          <p>Sort Smarter. Live Greener. © {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
