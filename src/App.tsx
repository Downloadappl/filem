import React, { useEffect } from "react";
import { HashRouter, Routes, Route, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { WatchProvider } from "./context/WatchContext";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { Home } from "./pages/Home";
import { Discover } from "./pages/Discover";
import { Details } from "./pages/Details";
import { Saved } from "./pages/Saved";
import { About } from "./pages/About";
import { Features } from "./pages/Features";
import { FAQ } from "./pages/FAQ";
import { Terms } from "./pages/Terms";
import { Privacy } from "./pages/Privacy";

// Simple internal Scroll Restoration component to snap scroll vertical position on route change
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);

  return null;
};

export default function App() {
  const { i18n } = useTranslation();

  // Dynamic RTL vs LTR Document adjustments and security protections
  useEffect(() => {
    const isRtl = i18n.language === "ar";
    document.dir = isRtl ? "rtl" : "ltr";
    document.documentElement.lang = i18n.language;
    
    // Change body classes to support Cairo font when Arabic is selected
    if (isRtl) {
      document.body.classList.add("font-[Cairo]");
      document.body.classList.remove("font-[Inter]");
    } else {
      document.body.classList.add("font-[Inter]");
      document.body.classList.remove("font-[Cairo]");
    }
  }, [i18n.language]);

  return (
    <WatchProvider>
      <HashRouter>
        <ScrollToTop />
        <div className="relative min-h-screen bg-[#0B0B0F] text-white flex flex-col font-sans transition-all duration-300 antialiased selection:bg-brand-primary selection:text-white overflow-x-hidden">
          
          {/* Immersive UI Ambient Spotlight Accents */}
          <div className="fixed top-[450px] left-[50%] -translate-x-[50%] w-[800px] h-[400px] bg-[#E50914]/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
          <div className="fixed top-[10%] left-[-10%] w-[500px] h-[500px] bg-[#E50914]/4 rounded-full blur-[150px] -z-10 pointer-events-none" />
          <div className="fixed bottom-[15%] right-[-15%] w-[600px] h-[600px] bg-[#FFC857]/3 rounded-full blur-[160px] -z-10 pointer-events-none" />

          {/* Main App Navigation Centerpiece */}
          <Header />
            
          {/* Page Routing Views */}
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/discover" element={<Discover />} />
              <Route path="/details/:type/:id" element={<Details />} />
              <Route path="/saved" element={<Saved />} />
              <Route path="/about" element={<About />} />
              <Route path="/features" element={<Features />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="*" element={<Home />} /> {/* Fail-safe redirection fallback */}
            </Routes>
          </main>
          
          {/* Main App Footer */}
          <Footer />
          
        </div>
      </HashRouter>
    </WatchProvider>
  );
}
