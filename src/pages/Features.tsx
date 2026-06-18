import React from "react";
import { useTranslation } from "react-i18next";
import { motion } from "motion/react";
import { Sparkles, Tv, ShieldAlert, Zap, Film, Compass, Heart, Share2 } from "lucide-react";

export const Features: React.FC = () => {
  const { i18n } = useTranslation();
  const lang = i18n.language;

  const content: Record<string, any> = {
    ar: {
      title: "الميزات والخصائص",
      subtitle: "استكشف الأدوات والخصائص السينمائية المبتكرة والفريدة التي نقدمها لك",
      features: [
        { icon: <Compass className="w-5 h-5" />, title: "مساعد التوصية الذكي 🤖", desc: "اكتب ما تشعر به أو أجواء السهرة وسيقوم الذكاء الاصطناعي بتحليل الأنماط سينمائياً واقتراح الأفلام الدقيقة." },
        { icon: <Zap className="w-5 h-5" />, title: "المشغل الفوري فائق السرعة ⚡", desc: "مشاهدة بضغطة زر واحدة بفضل السيرفر الموحد الرئيسي عالي التوافقية والأداء على جميع المتصفحات." },
        { icon: <Tv className="w-5 h-5" />, title: "نظام مواسم وحلقات متكامل 📺", desc: "ترتيب فوري للمسلسلات مع فلاتر المواسم والتشغيل التلقائي وقراءة حية لجميع الحلقات." },
        { icon: <Film className="w-5 h-5" />, title: "معلومات وتصنيفات TMDB الشاملة 🍿", desc: "مزامنة تفصيلية لبيانات تقييم الأفلام، المخرجين، الممثلين المفضلين، والتوصيات المشابهة." },
        { icon: <ShieldAlert className="w-5 h-5" />, title: "واجهة حماية ضد النوافذ المنبثقة 🛡️", desc: "التحكم السينمائي التراكمي فوق المشغل يحجب الإعلانات المزعجة لتستمتع بمشاهدة نقية مريحة وآمنة." },
        { icon: <Heart className="w-5 h-5" />, title: "قائمة حفظ ومفضلة شخصية 💖", desc: "احفظ ما تود مشاهدته لاحقاً وتتبع سجل بحثك ومؤشر مشاهداتك محلياً بخصوصية تامة." }
      ]
    },
    en: {
      title: "Features & Specs",
      subtitle: "Discover the innovative and unique cinema tools engineered for your experience",
      features: [
        { icon: <Compass className="w-5 h-5" />, title: "AI-Powered Recommendations 🤖", desc: "Type in any prompt, mood, or context, and let our AI model brainstorm perfect cinematic pairings." },
        { icon: <Zap className="w-5 h-5" />, title: "Zero Lag Instant Player ⚡", desc: "Watch anything in one click thanks to our highly compatible integrated main server that operates with full speed." },
        { icon: <Tv className="w-5 h-5" />, title: "Native Seasons & Episodes 📺", desc: "Beautiful television lists with seamless season filter dropdowns and automatic episode play-state management." },
        { icon: <Film className="w-5 h-5" />, title: "Comprehensive TMDB Sync 🍿", desc: "Enjoy deep details, global rating indices, detailed cast/crew bios, and similar tailored suggestions." },
        { icon: <ShieldAlert className="w-5 h-5" />, title: "Anti-Popup Interactive Layer 🛡️", desc: "Our optional cinematic overlay protects your device by blocking intrusive redirects and annoying popups." },
        { icon: <Heart className="w-5 h-5" />, title: "Watchlist & Personal Favorites 💖", desc: "Save titles you plan to stream, flag favorites, and maintain complete localized search logs privately." }
      ]
    }
  };

  const activeContent = content[lang] || content["ar"];

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 md:py-16 space-y-12">
      {/* Page Header */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center justify-center p-3 rounded-full bg-brand-primary/10 text-brand-primary mb-2"
        >
          <Sparkles className="w-8 h-8" />
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-2"
        >
          {activeContent.title}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-sm md:text-base text-neutral-400 max-w-xl mx-auto"
        >
          {activeContent.subtitle}
        </motion.p>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeContent.features.map((feat: any, idx: number) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 + idx * 0.05 }}
            className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4 flex flex-col justify-between hover:border-brand-primary/20 transition-colors group"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                {feat.icon}
              </div>
              <h3 className="text-sm font-bold text-white uppercase group-hover:text-brand-primary transition-colors">
                {feat.title}
              </h3>
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                {feat.desc}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
