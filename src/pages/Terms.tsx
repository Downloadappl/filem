import React from "react";
import { useTranslation } from "react-i18next";
import { motion } from "motion/react";
import { ShieldCheck } from "lucide-react";

export const Terms: React.FC = () => {
  const { i18n } = useTranslation();
  const lang = i18n.language;

  const content: Record<string, any> = {
    ar: {
      title: "شروط الاستخدام",
      subtitle: "يرجى قراءة شروط الخدمة بعناية لضمان فهم قواعد استخدام منصتنا الترفيهية",
      intro: "مرحباً بك في منصتنا الترفيهية الذكية. عبر استخدامك لهذا الموقع، فإنك توافق على الامتثال التام للشروط والأحكام التالية والتقيّد بها بالكامل:",
      sections: [
        { title: "1. النطاق والترخيص", text: "هذا الموقع هو محرك واجهة بحثية تفاعلية لتنظيم وتسهيل تصفح بيانات الأفلام والمسلسلات العامة من قاعدة بيانات TMDB. لا نقوم برفع أو استضافة أي وسائط مرئية على خوادمنا الخاصة؛ بل يتم جلب المشاهدات من سيرفرات بث وتجميع مفتوحة المصدر بالكامل." },
        { title: "2. حدود المسؤولية وكفاءة البث", text: "بما أن روابط التشغيل وبث الفيديو مأخوذة من خوادم طرف ثالث، فإننا لا نتحمل أي مسؤولية قانونية أو تكنولوجية عن دقة الترجمة، جودة البث، سرعة التحميل، أو انقطاع التشغيل. يتوفر البث 'كما هو' لمساعدة المستخدم لتسجيل قائمته المفضلة فقط." },
        { title: "3. الاستخدام العادل للأدوات والذكاء الاصطناعي", text: "مساعد التوصيات الذكي 🤖 وأدوات الفلترة مصممة للاستخدام الفردي فقط. يُمنع منعاً باتاً استغلال الذكاء الاصطناعي في إرسال طلبات عشوائية أو هجمات لتعطيل استقرار الخدمة." },
        { title: "4. التعديل على الشروط", text: "يحتفظ فريق المطورين arix بالحق في تغيير هذه الشروط من وقت لآخر بحسب تطور الميزات والتقنيات، وتعتبر مراجعة هذه الصفحة دورياً مسؤولية المستخدم الفردية." }
      ]
    },
    en: {
      title: "Terms of Use",
      subtitle: "Please read our user agreement policies carefully before using our platform",
      intro: "Welcome to our smart movie discovery platform. By accessing or using this website, you explicitly agree to conform and be bound to the following terms and guidelines:",
      sections: [
        { title: "1. Scope of Service & Meta-Retrieval", text: "This application operates purely as an interactive interface searching, categorizing and rendering public film metadata provided by TMDB API. We do NOT host, upload or store any video files on our local servers. Dynamic streams are referenced directly from public cloud networks." },
        { title: "2. Limitation of Liabilities for Third-Party Playback", text: "Because stream directories are fetched from external third-party aggregators, we disclaim any responsibility for subtitle accuracy, loading speed, playback lag, or streaming interruptions. Streams are provided 'as is' for customized reference only." },
        { title: "3. Conduct & AI Prompt Restrictions", desc: "Our built-in AI Recommendation wizard is allocated exclusively for friendly, individual search use. Exploitation of the API, prompt injection attacks, or spamming scripts to disrupt the model's reliability is strictly banned." },
        { title: "4. Policy Adjustments", text: "The development collective arix holds full rights to modify these terms as newer iterations are deployed. Users are encouraged to inspect this ledger from time to time." }
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
          <ShieldCheck className="w-8 h-8" />
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

      {/* Terms list */}
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
                {sect.text || sect.desc}
              </p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};
