import React from "react";
import { useTranslation } from "react-i18next";
import { motion } from "motion/react";
import { Shield } from "lucide-react";

export const Privacy: React.FC = () => {
  const { i18n } = useTranslation();
  const lang = i18n.language;

  const content: Record<string, any> = {
    ar: {
      title: "سياسة الخصوصية",
      subtitle: "نحن ملتزمون بحماية خصوصيتك وبياناتك الشخصية بأقصى درجات الشفافية والخصوصية",
      intro: "أمن وخصوصية بياناتك هي أولويتنا القصوى. توضح هذه الوثيقة ماهية البيانات البسيطة التي نتعامل معها وكيف نحمي خصوصيتك بالكامل:",
      sections: [
        { title: "1. التخزين المحلي والخصوصية التامة", text: "كل معلومات التصفح المفضلة لديك، وسجل البحث الأخير، وقائمة الحفظ (Watchlist)، وسجل الحلقات والمواسم التي شاهدتها يتم تخزينها بالكامل محلياً وبشكل مشفر في متصفحك الشخصي عبر الـ (LocalStorage). لا نقوم برفع أو مزامنة هذه البيانات على أي خوادم خارجية حفاظاً على سرية معلوماتك." },
        { title: "2. ملفات الارتباط (Cookies)", text: "نستخدم فقط ملفات ارتباط أساسية ومؤقتة لتذكر خيار اللغة المفضلة لديك وتفضيل 'الوضع السينمائي' للغرفة المظلمة." },
        { title: "3. بيانات البث والمشغل الخارجي الطرف الثالث", text: "عند تفعيل المشغل لفيلم، يتم تحميل الإطار من سيرفر خارجي. ننصحك بتفعيل خيار 'التحكم السينمائي فوق المشغل' المدمج في موقعنا لمنع ملفات الارتباط الخارجية المزعجة أو النوافذ غير المرغوبة من تتبع متصفحك." },
        { title: "4. التواصل والدعم الفني", text: "عند تواصلك مع فريق المطورين arix عبر واتساب أو تليجرام، فإننا نحفظ سرية المحادثات ولا نشارك رقمك أو معرفك الشخصي مع أي طرف." }
      ]
    },
    en: {
      title: "Privacy Policy",
      subtitle: "We prioritize safeguarding your personal experience under uncompromising privacy frameworks",
      intro: "Security and control of your private habits remains our primary core directive. Here is a clear description of how limited local variables are structured on our site:",
      sections: [
        { title: "1. Under No Cloud Logs (Strict Local Storage)", text: "All saved playlists, watched episodes progress indices, and search histories are stored on your device's Local Directory (LocalStorage) using standard client caching. We NEVER upload, relay, transfer, or save your watch history to remote databases." },
        { title: "2. Session Cookies & Locale Caching", text: "We utilize minor core cookie blocks only to maintain your chosen translation language and theater state preferences." },
        { title: "3. Third-party Player Interfaces", text: "Activating stream layers requests visual packets from cloud directories. Utilizing our custom adblock layer / cinematic controller prevents annoying third-party popups from collecting trace data." },
        { title: "4. Direct Developer Auditing", text: "Any communication you initiate with arix devs via designated lines (WhatsApp or Telegram) remains strictly confidential, and user info is never shared or compiled." }
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
          <Shield className="w-8 h-8" />
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

      {/* Privacy Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="glass-panel p-6 md:p-8 rounded-2xl border border-white/5 space-y-6 max-w-3xl mx-auto"
      >
        <p className="text-xs text-neutral-300 leading-relaxed font-semibold">
          {activeContent.intro}
        </p>

        <div className="space-y-6 pt-4 border-t border-white/5">
          {activeContent.sections.map((sect: any, idx: number) => (
            <div key={idx} className="space-y-2">
              <h3 className="text-xs md:text-sm font-extrabold text-white text-brand-primary">
                {sect.title}
              </h3>
              <p className="text-[11px] md:text-xs text-neutral-400 leading-relaxed">
                {sect.text}
              </p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};
