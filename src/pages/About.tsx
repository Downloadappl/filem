import React from "react";
import { useTranslation } from "react-i18next";
import { motion } from "motion/react";
import { Users, MessageCircle, Send, Heart, Code, Shield, HelpCircle, Sparkles } from "lucide-react";

export const About: React.FC = () => {
  const { i18n } = useTranslation();
  const lang = i18n.language;

  // Multi-language content dictionary
  const content: Record<string, any> = {
    ar: {
      title: "من نحن",
      subtitle: "نحن ملتزمون بتقديم أفضل تجربة ترفيهية ذكية لك",
      developedBy: "تم تطوير الموقع وإدارته بواسطة فريق arix بكل حب واحترافية.",
      description: "فريق arix هو فريق متخصص في تصميم وتطوير المنصات والأنظمة السحابية المعقدة الموجهة للبث والوسائط الذكية. قمنا بابتكار حلول مبتكرة لدمج المحتوى الترفيهي من خوادم البث العالمية وتنظيمه بلمسات سينمائية تمنحك مشاهدة مريحة وآمنة وخالية من العوائق.",
      ourVision: "رؤيتنا",
      visionText: "توفير بوابات ترفيه عصرية سريعة ومجانية، والوصول المباشر إلى السينما العالمية بأبسط تجربة مستخدم ممكنة وبتقنيات الذكاء الاصطناعي الرائدة.",
      whyUs: "لماذا منصتنا؟",
      whyPoints: [
        { title: "تقييم وتوصية ذكية", desc: "نظام اقتراح وتحليل مبني على اهتماماتك عبر الذكاء الاصطناعي المتطور." },
        { title: "بث عالي الدقة", desc: "مشغلات متطورة تدعم الجودات المتعددة والمواسم والحلقات والترجمة بشكل مباشر." },
        { title: "واجهة سينمائية تفاعلية", desc: "تصميم حائز على اهتمام فائق يحاكي قاعات السينما المظلمة ومريح للعين تماماً." }
      ],
      contactUs: "تواصل مع فريق arix",
      contactDesc: "هل لديك أي استفسار، اقتراح تطوير، أو تريد العمل معنا؟ تواصل معنا مباشرة عبر القنوات الرسمية:",
      whatsappBtn: "مراسلتنا عبر واتساب",
      telegramBtn: "قناتنا على تليجرام"
    },
    en: {
      title: "About Us",
      subtitle: "Dedicated to providing you with the ultimate intelligent entertainment experience",
      developedBy: "Developed and maintained by team arix with love and precision.",
      description: "Team arix is a specialized development collective focused on building high-performance cloud media platforms and smart stream aggregators. We bring innovative solutions that unify entertainment metadata from global directories and present them in a clean, cinematic interface.",
      ourVision: "Our Vision",
      visionText: "To build modern, ultra-fast and free entertainment portals that grant instant access to global media with premium design patterns and intelligent AI recommendation flows.",
      whyUs: "Why Our Platform?",
      whyPoints: [
        { title: "AI-Powered Intelligence", desc: "Smart recommendation wizard that analyzes and generates perfect movie matches based on your mood." },
        { title: "Full HD Streams", desc: "Advanced player interfaces that natively support multiple qualities, complete subtitles, and automatic episodes layouts." },
        { title: "Cinematic Atmosphere", desc: "Meticulously designed interface inspired by dark cinema themes to offer optimal viewing comfort." }
      ],
      contactUs: "Contact Team arix",
      contactDesc: "Any questions, technical suggestions, or business cooperation proposals? Get in touch with us immediately:",
      whatsappBtn: "Contact via WhatsApp",
      telegramBtn: "Join our Telegram"
    },
    de: {
      title: "Über uns",
      subtitle: "Wir bieten Ihnen das ultimative, intelligente Unterhaltungserlebnis",
      developedBy: "Entwickelt und gepflegt vom team arix mit Liebe und Präzision.",
      description: "Das Team arix ist ein spezialisiertes Entwicklungskollektiv, das sich auf den Aufbau leistungsstarker Cloud-Medienplattformen und intelligenter Streaming-Aggregatoren konzentriert.",
      ourVision: "Unsere Vision",
      visionText: "Die Bereitstellung moderner, kostenloser Unterhaltungsportale, die sofortigen Zugriff auf globale Medien mit ästhetisch ansprechenden Designs und künstlicher Intelligenz ermöglichen.",
      whyUs: "Warum wir?",
      whyPoints: [
        { title: "KI-Empfehlungen", desc: "Ein intelligenter Assistent, der Ihre Stimmung analysiert und perfekte Filmergebnisse vorschlägt." },
        { title: "Zuverlässige Web-Player", desc: "Unterstützung für Auflösungen, Untertitel und reibungsloses Laden von Episoden." },
        { title: "Kino-Atmosphäre", desc: "Modernes dunkles Design für maximale Fokussierung und Entlastung der Augen." }
      ],
      contactUs: "Kontaktieren Sie Team arix",
      contactDesc: "Haben Sie Fragen, Feedback oder Partnerschaftsanfragen? Schreiben Sie uns direkt über diese offiziellen Kanäle:",
      whatsappBtn: "Per WhatsApp kontaktieren",
      telegramBtn: "Unserem Telegram beitreten"
    },
    tr: {
      title: "Hakkımızda",
      subtitle: "Size en üst düzey akıllı eğlence deneyimini sunmaya kararlıyız",
      developedBy: "team arix tarafından sevgi ve profesyonellikle geliştirilmiş ve yönetilmektedir.",
      description: "Team arix, yüksek performanslı bulut medya platformları ve akıllı akış arayüzleri oluşturmaya odaklanmış uzman bir yazılım geliştirme ekibidir. Küresel medya sunucularından içerikleri bir araya getirerek sorunsuz bir sinema deneyimi sunuyoruz.",
      ourVision: "Vizyonumuz",
      visionText: "Gelişmiş yapay zeka entegrasyonu ve minimalist modern tasarımlarla, küresel sinemaya anında ve hızlı erişim portalları inşa etmek.",
      whyUs: "Neden Biz?",
      whyPoints: [
        { title: "Yapay Zeka Sihirbazı", desc: "Modunuza en uygun mükemmel filmleri keşfetmeniz için tasarlanmış yenilikçi yapay zeka asistanı." },
        { title: "Kesintisiz Yayınlar", desc: "Çoklu kalite seçeneklerini, tüm dillerde altyazıları ve otomatik sezon geçişlerini destekleyen modern oynatıcılar." },
        { title: "Göz Dostu Sinematik Arayüz", desc: "Uzun saatler boyu konforlu izleme sağlayan tamamen loş sinema salonu temalı lüks tasarım." }
      ],
      contactUs: "Team arix ile İletişim",
      contactDesc: "Herhangi bir sorunuz, geliştirme öneriniz veya iş birliği talebiniz mi var? Resmi kanallarımızdan bize doğrudan ulaşın:",
      whatsappBtn: "WhatsApp'tan Yazın",
      telegramBtn: "Telegram Kanalımız"
    },
    fr: {
      title: "À propos de nous",
      subtitle: "Dédiés à vous offrir la meilleure expérience de divertissement intelligent",
      developedBy: "Développé et maintenu avec amour par l'équipe arix.",
      description: "L'équipe arix est un collectif de développeurs spécialisés dans la création de plateformes de médias en nuage hautement interactives. Nous concevons des agrégateurs de flux élégants pour un visionnage sans friction.",
      ourVision: "Notre Vision",
      visionText: "Simplifier l'accès à la culture cinématographique mondiale grâce à des interfaces esthétiques, des outils de suggestion IA de pointe et des performances maximales.",
      whyUs: "Pourquoi notre portail ?",
      whyPoints: [
        { title: "Intelligence Artificielle", desc: "Recommandations ultra-ciblées basées sur vos envies du moment." },
        { title: "Lecteurs Intégrés Multi-Giga", desc: "Streaming transparent gérant automatiquement les saisons, les épisodes et les sous-titres." },
        { title: "Esthétique Obscure", desc: "Un habillage sombre immersif préservant le confort de vos yeux lors des sessions nocturnes." }
      ],
      contactUs: "Contacter l'équipe arix",
      contactDesc: "Une question, une suggestion d'amélioration, ou un partenariat professionnel ? Écrivez-nous directement :",
      whatsappBtn: "Nous écrire sur WhatsApp",
      telegramBtn: "Nous rejoindre sur Telegram"
    },
    es: {
      title: "Sobre nosotros",
      subtitle: "Comprometidos a brindarte la mejor experiencia de entretenimiento inteligente",
      developedBy: "Desarrollado y administrado por el equipo arix con pasión y profesionalismo.",
      description: "El equipo arix es un colectivo de ingeniería de software dedicado a construir agregadores multimedia cloud y reproductores en línea de alto desempeño, cuidando cada detalle estético para una reproducción fluida.",
      ourVision: "Nuestra Visión",
      visionText: "Crear portales de entretenimiento modernos y gratuitos impulsados por modelos de inteligencia artificial y diseños de experiencia de usuario de primer nivel.",
      whyUs: "¿Por qué nuestra plataforma?",
      whyPoints: [
        { title: "Recomendaciones Inteligentes", desc: "Una herramienta de sugerencia IA premium que entiende exactamente qué quieres ver." },
        { title: "Reproducción Ultra Adaptativa", desc: "Soporte de múltiples calidades, temporadas continuas e integración instantánea." },
        { title: "Diseño Negro de Cine", desc: "Lienzo visual con sombras ambientales oscuras e interfaces minimalistas cuidadas." }
      ],
      contactUs: "Contactar al equipo arix",
      contactDesc: "¿Tiene preguntas, sugerencias técnicas o propuestas comerciales? Póngase en contacto con nosotros directamente:",
      whatsappBtn: "Contactar por WhatsApp",
      telegramBtn: "Canal de Telegram"
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
          <Users className="w-8 h-8" />
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

      {/* Main Beautiful Banner content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="glass-panel p-6 md:p-8 rounded-2xl border border-white/5 space-y-6 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full blur-2xl -z-10" />
        <div className="flex items-center gap-2 text-brand-primary">
          <Sparkles className="w-5 h-5" />
          <h2 className="text-base font-black uppercase tracking-wider">{activeContent.title} - arix Team</h2>
        </div>
        
        <p className="text-xs md:text-sm text-neutral-300 leading-relaxed">
          {activeContent.description}
        </p>

        <div className="p-4 rounded-xl bg-brand-primary/5 border border-brand-primary/15 text-brand-primary">
          <p className="text-xs font-bold text-center">
            {activeContent.developedBy}
          </p>
        </div>
      </motion.div>

      {/* Vision & Why choose section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4"
        >
          <div className="flex items-center gap-2 text-amber-500">
            <Heart className="w-5 h-5 fill-amber-500/20" />
            <h3 className="text-sm font-black uppercase tracking-wider">{activeContent.ourVision}</h3>
          </div>
          <p className="text-xs text-neutral-300 leading-relaxed">
            {activeContent.visionText}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4"
        >
          <div className="flex items-center gap-2 text-brand-primary">
            <Code className="w-5 h-5" />
            <h3 className="text-sm font-black uppercase tracking-wider">{activeContent.whyUs}</h3>
          </div>
          <div className="space-y-3">
            {activeContent.whyPoints.map((pt: any, i: number) => (
              <div key={i} className="space-y-0.5">
                <div className="text-xs font-bold text-white">{pt.title}</div>
                <div className="text-[10px] text-neutral-400">{pt.desc}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Team arix Interactive Contact Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="glass-panel p-6 md:p-8 rounded-2xl border border-white/5 text-center space-y-6 relative"
      >
        <div className="space-y-2">
          <h3 className="text-lg font-black text-white">{activeContent.contactUs}</h3>
          <p className="text-xs text-neutral-400 max-w-lg mx-auto">
            {activeContent.contactDesc}
          </p>
        </div>

        {/* Whatsapp and Telegram Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto pt-2">
          {/* WhatsApp Link with Team arix phone */}
          <a
            href="https://wa.me/9647884064501?text=مرحباً%20فريق%20arix"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:flex-1 py-3 px-5 rounded-xl bg-green-600 hover:bg-green-500 text-white font-extrabold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-600/15 cursor-pointer hover:scale-103 active:scale-97"
          >
            <MessageCircle className="w-4 h-4 fill-white text-green-600" />
            <span>{activeContent.whatsappBtn}</span>
          </a>

          {/* Telegram Link with channels username */}
          <a
            href="https://t.me/airx"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:flex-1 py-3 px-5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-sky-600/15 cursor-pointer hover:scale-103 active:scale-97"
          >
            <Send className="w-4 h-4 fill-white text-sky-600" />
            <span>{activeContent.telegramBtn}</span>
          </a>
        </div>
      </motion.div>
    </div>
  );
};
