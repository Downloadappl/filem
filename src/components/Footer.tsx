import React from "react";
import { Film, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export const Footer: React.FC = () => {
  const { t, i18n } = useTranslation();
  const currentYear = new Date().getFullYear();
  const lang = i18n.language;

  // Bilingual link arrays
  const links = lang === "ar" ? {
    platformTitle: "المنصة",
    platform: [
      { text: "من نحن", path: "/about" },
      { text: "الميزات والخصائص", path: "/features" },
      { text: "الأسئلة الشائعة", path: "/faq" }
    ],
    legalTitle: "القانونية",
    legal: [
      { text: "شروط الاستخدام", path: "/terms" },
      { text: "سياسة الخصوصية", path: "/privacy" }
    ],
    devCredit: "تطوير وتحسين فريق arix"
  } : {
    platformTitle: "Platform",
    platform: [
      { text: "About Us", path: "/about" },
      { text: "Features & Specs", path: path => "/features" },
      { text: "FAQs", path: "/faq" }
    ],
    legalTitle: "Legal",
    legal: [
      { text: "Terms of Use", path: "/terms" },
      { text: "Privacy Policy", path: "/privacy" }
    ],
    devCredit: "Developed by team arix"
  };

  return (
    <footer className="border-t border-white/5 bg-[#0B0B0F]/90 backdrop-blur-md pt-10 pb-8 px-4 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-8 text-start">
        
        {/* Logo and Brand */}
        <div className="space-y-4 max-w-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-primary to-orange-500 flex items-center justify-center text-white shadow-lg">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-white text-base tracking-tight">{t("appName")}</h4>
              <p className="text-xs text-neutral-500 mt-0.5">{t("tagline")}</p>
            </div>
          </div>
          <p className="text-neutral-400 text-xs leading-relaxed flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-brand-primary shrink-0 animate-pulse" />
            <span className="font-semibold text-neutral-300">{links.devCredit}</span>
          </p>
        </div>

        {/* Footer Navigation Columns */}
        <div className="flex gap-12 sm:gap-20">
          {/* Navigation Links column */}
          <div className="space-y-3">
            <h5 className="text-xs font-black uppercase text-white/50 tracking-wider">
              {links.platformTitle}
            </h5>
            <ul className="space-y-2">
              {links.platform.map((lnk: any, idx: number) => (
                <li key={idx}>
                  <Link
                    to={typeof lnk.path === "function" ? lnk.path() : lnk.path}
                    className="text-xs text-neutral-400 hover:text-brand-primary transition-colors font-medium hover:underline"
                  >
                    {lnk.text}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links column */}
          <div className="space-y-3">
            <h5 className="text-xs font-black uppercase text-white/50 tracking-wider">
              {links.legalTitle}
            </h5>
            <ul className="space-y-2">
              {links.legal.map((lnk: any, idx: number) => (
                <li key={idx}>
                  <Link
                    to={lnk.path}
                    className="text-xs text-neutral-400 hover:text-brand-primary transition-colors font-medium hover:underline"
                  >
                    {lnk.text}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

      </div>

      <div className="max-w-7xl mx-auto border-t border-white/5 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
        <p>© {currentYear} {t("appName")}. All rights reserved.</p>
        <p className="text-[10px] text-neutral-600">
          Powered by TMDB api and Gemini AI. Content from external aggregated directories.
        </p>
      </div>
    </footer>
  );
};
export default Footer;
