"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import styles from "./page.module.css";

const diagnosticSteps = [
  {
    num: "01",
    title: "提交文档",
    desc: "将需要诊断的英文文本粘贴至对话窗口，或直接上传文档。",
  },
  {
    num: "02",
    title: "AI 分析诊断",
    desc: "系统通过 RAG 检索知识库，由 Subagent 逐段完成四大维度的问题识别与独立评分。",
  },
  {
    num: "03",
    title: "获取诊断报告",
    desc: "接收结构化诊断报告，包含各维度评分、问题定位，以及 before & after 对比分析。",
  },
];

const heroWords = ["文渡", "温度"];

export default function HomePage() {
  const [formState, setFormState] = useState<"idle" | "success">("idle");
  const [formData, setFormData] = useState({ name: "", company: "", email: "", area: "" });
  const [titleIndex, setTitleIndex] = useState(0);
  const [animKey, setAnimKey] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.company) return;
    setFormState("success");
  };

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      setTitleIndex((i) => (i === 0 ? 1 : 0));
      setAnimKey((k) => k + 1);
    }, 4000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [titleIndex]);

  if (formState === "success") {
    return (
      <div className={styles.successScreen}>
        <div className={styles.successCard}>
          <div className={styles.successIcon}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M8 12l2.5 2.5L16 10" />
            </svg>
          </div>
          <h2 className={`${styles.successTitle} font-serif-en`}>Thank You!</h2>
          <p className={styles.successText}>
            谢谢 {formData.name}！稍后会有工作人员联系您。
          </p>
          <p className={styles.successSub}>
            我们会在正式发布前第一时间通知您。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroContent}>
            <div className={styles.heroLogoMobile}>
              <img
                src="/wendo-dev/wendo_logo_vectorized.svg"
                alt="文渡 Wendo"
                width={280}
                height={280}
                className={styles.heroLogoImgMobile}
              />
            </div>
            <motion.p
              className={styles.heroEyebrow}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              跨境外贸网站本地化专家
            </motion.p>
            <motion.h1
              className={styles.heroTitle}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.5 }}
            >
              让出海有<br />
              <span className={styles.heroWordWrapper}>
                <span key={animKey} className={styles.heroWord}>{heroWords[titleIndex]}</span>
              </span>
            </motion.h1>
            <motion.p
              className={styles.heroSubtitle}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              文渡Wendo帮助中国出海企业温暖触达全球。
            </motion.p>
            <motion.div
              className={styles.heroCtas}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.5 }}
            >
              <a href="/contact" className={styles.primaryBtn}>
                报名体验
              </a>
              <a href="/product" className={styles.secondaryBtn}>
                了解产品 →
              </a>
            </motion.div>
          </div>
          <motion.div
            className={styles.heroLogo}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <img
              src="/wendo-dev/wendo_logo_vectorized.svg"
              alt="文渡 Wendo"
              width={400}
              height={400}
              className={styles.heroLogoImg}
            />
          </motion.div>
        </div>
      </section>

      <section className={styles.stats}>
        <div className={styles.statsCard}>
          <span className={styles.statIcon}>🌏</span>
          <div className={styles.statContent}>
            <span className={styles.statValue}>30+</span>
            <span className={styles.statLabel}>覆盖国家和地区</span>
          </div>
        </div>
      </section>

      <section className={styles.steps}>
        <div className={styles.stepsHeader}>
          <h2 className={`${styles.sectionTitle} font-serif-en`}>工作原理</h2>
          <p className={styles.sectionSubtitle}>像和 ChatGPT 对话一样简单，获得专业的文化适配诊断报告</p>
        </div>
        <div className={styles.stepsGrid}>
          {diagnosticSteps.map((step) => (
            <div key={step.num} className={styles.stepCard}>
              <span className={styles.stepNum}>{step.num}</span>
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepDesc}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.cta}>
        <div className={styles.ctaCard}>
          <div className={styles.ctaContent}>
            <h2 className={`${styles.ctaTitle} font-serif-en`}>想要免费体验吗？</h2>
            <p className={styles.ctaText}>
              首批体验名额开放中，提交您的诊断需求，我们将尽快与您联系。
            </p>
          </div>
          <a href="/contact" className={styles.ctaBtn}>
            报名抢先体验计划
          </a>
        </div>
      </section>
    </div>
  );
}
