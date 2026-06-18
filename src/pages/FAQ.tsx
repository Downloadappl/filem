import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "motion/react";
import { HelpCircle, ChevronDown, ChevronUp } from "lucide-react";

export const FAQ: React.FC = () => {
  const { i18n } = useTranslation();
  const lang = i18n.language;
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const content: Record<string, any> = {
    ar: {
      title: "الأسئلة الشائعة",
      subtitle: "إجابات فورية لجميع استفساراتك حول كيفية التشغيل والاكتشاف السينمائي",
      items: [
        { q: "كيف أقوم بتشغيل الأفلام والمسلسلات؟", a: "ببساطة، انقر فوق أي عمل تود مشاهدته، وفي صفحة التفاصيل اضغط على 'مشاهدة الآن 🎬' لتفتح نافذة البث المدمجة تلقائياً وتعمل بكفاءة فورية." },
        { q: "المشغل يقول أنه غير متوفر، ما العمل؟", a: "المشغل مبرمج على استخدام سيرفر سينمائي خارجي ذكي للغاية يبحث تلقائياً عن العمل. إذا ظهرت شاشة فارغة، يرجى تفقّد اتصال الإنترنت وتحديث الصفحة. غالباً ما يعمل السيرفر فائق التوافقية بشكل ممتاز لجميع الأفلام والمسلسلات." },
        { q: "كيف أستخدم الذكاء الاصطناعي لاكتشاف العناوين؟", a: "في الصفحة الرئيسية، اذهب إلى مساعد التوصية الذكي 🤖، واكتب نوع الأفلام التي تحبها، مثل 'أريد فيلم خيال علمي مع حبكة غامضة'. وسيقوم الموديل بتحليل طلبك وإعطائك اقتراحات ذكية فورية مع إمكانية تشغيلها مباشرة." },
        { q: "هل يتطلب الموقع أي اشتراك مالي أو تسجيل حساب؟", a: "الموقع مجاني تماماً 100% لجميع الميزات، بما في ذلك مساعد الذكاء الاصطناعي والمشاحنات اللامتناهية ومزامنة المفضلة وقائمة الحفظ التي يتم تخزينها على متصفحك محلياً لضمان الخصوصية القصوى." },
        { q: "ما هو 'التحكم السينمائي التراكمي'؟", a: "هي واجهة ذكية نضعها فوق نافذة البث المدمجة لحمايتك من الضغط على الإعلانات والنوافذ المنبثقة الضارة التي تأتي مع المشغلات الخارجية. تمنحك شريط تمرير وزر تشغيل وإيقاف سينمائي آمن ومريح." }
      ]
    },
    en: {
      title: "Frequently Asked Questions",
      subtitle: "Get instant answers to all your streaming, discovery, and setup inquiries",
      items: [
        { q: "How do I play movies and TV shows?", a: "Simply click on any title you want to watch, and from the Details page, press 'Watch Now 🎬'. This loads our robust embedded streaming module with immediate access." },
        { q: "The player reports that the video is unavailable?", a: "Our web player links to highly compatible external movie networks. If it fails to load, please verify your internet connection or reload the page. The aggregator handles almost all media seamlessly." },
        { q: "How can I get AI suggestions?", a: "On the homepage, navigate to the AI Discovery Assistant 🤖, outline your vibe (e.g., 'Mystery mind-bending movie from Nolan'), and our model compiles direct matches you can play instantly." },
        { q: "Is registration or payment required?", a: "Our platform is 100% free with no registration or subscriptions needed. Your watchlist, favorites, and search logs are stored securely on your browser locally." },
        { q: "What is 'Cinematic Overlay Control'?", a: "It is an interactive custom interface we overlay on top of the stream player to completely block spam redirects and ads, granting you a safe, ad-free and reliable environment to play videos." }
      ]
    }
  };

  const activeContent = content[lang] || content["ar"];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 md:py-16 space-y-12">
      {/* Page Header */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center justify-center p-3 rounded-full bg-brand-primary/10 text-brand-primary mb-2"
        >
          <HelpCircle className="w-8 h-8" />
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

      {/* Accordion List */}
      <div className="space-y-4 max-w-3xl mx-auto">
        {activeContent.items.map((item: any, idx: number) => {
          const isOpen = openIdx === idx;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 + idx * 0.05 }}
              className="glass-panel rounded-2xl border border-white/5 overflow-hidden transition-all"
            >
              <button
                type="button"
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                className="w-full p-5 text-start flex items-center justify-between gap-4 cursor-pointer hover:bg-white/3 transition-colors"
              >
                <span className="text-xs md:text-sm font-bold text-white leading-relaxed">
                  {item.q}
                </span>
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-brand-primary shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-neutral-400 shrink-0" />
                )}
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="p-5 pt-0 border-t border-white/5 text-[11px] md:text-xs text-neutral-400 leading-relaxed bg-[#0C0C12]/50">
                      {item.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
