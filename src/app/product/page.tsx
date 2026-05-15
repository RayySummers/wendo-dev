"use client";

import styles from "./page.module.css";
import Flowchart from "@/components/Flowchart";
import FaqAccordion from "@/components/FaqAccordion";
import KnowledgeTree from "@/components/KnowledgeTree";
import HeroFadeIn from "@/components/HeroFadeIn";

const dimensions = [
  {
    icon: "✅",
    title: "语言合规性",
    desc: "拼写正确性、语法正确性、词汇搭配合理性",
    maxScore: "25",
  },
  {
    icon: "💬",
    title: "表达自然性",
    desc: "流畅度可读性、习语用法正确性、句子节奏多样性",
    maxScore: "25",
  },
  {
    icon: "🌍",
    title: "文化适配性",
    desc: "文化禁忌规避、本地化表达习惯、价值观适配",
    maxScore: "25",
  },
  {
    icon: "🎯",
    title: "沟通效果",
    desc: "信息清晰度、行动召唤有效性、品牌调性一致性",
    maxScore: "25",
  },
];

const knowledgeBaseCategories = [
  {
    icon: "📁",
    title: "Cases",
    subtitle: "品牌案例库",
    count: "12+",
    regions: ["🇺🇸 美国", "🇪🇺 欧盟", "🇯🇵 日本", "🇸🇬 东南亚"],
  },
  {
    icon: "🌍",
    title: "Regions",
    subtitle: "地区知识库",
    count: "30+",
    regions: ["🇺🇸 美国", "🇪🇺 欧盟", "🇯🇵 日本", "🇸🇬 东南亚"],
  },
  {
    icon: "📋",
    title: "Standards",
    subtitle: "诊断标准",
    count: "4",
    regions: ["通用标准", "行业标准", "地区标准", "品牌标准"],
  },
  {
    icon: "📖",
    title: "Terminology",
    subtitle: "行业术语库",
    count: "4+",
    regions: ["科技", "金融", "医疗", "法律"],
  },
];

export default function ProductPage() {
  return (
    <div className={styles.page}>
      <HeroFadeIn
        eyebrow="产品介绍"
        title={<>让全球用户<br />感受品牌的温度</>}
        subtitle={'文渡将 AI 与跨文化商务智能结合，通过对话式交互帮助中国出海企业打造真正"入乡随俗"的英文品牌网站——不只是准确，更是温暖触达。'}
        cta={<a href="/wendo-dev/contact" className={styles.primaryBtn}>报名体验</a>}
        align="center"
        contentClassName={styles.heroContent}
      />

      <section className={styles.wendo}>
        <div className={styles.wendoHeader}>
          <h2 className={`${styles.sectionTitle} font-serif-en`}>W-E-N-D-O</h2>
          <p className={styles.sectionSubtitle}>文渡价值观</p>
        </div>
        <div className={styles.wendoList}>
          {[
            { letter: "W", cn: "Warm", desc: "传递温度" },
            { letter: "E", cn: "Empathy", desc: "共情为本" },
            { letter: "N", cn: "Navigate", desc: "导航出海" },
            { letter: "D", cn: "Diagnose", desc: "精准诊断" },
            { letter: "O", cn: "Optimize", desc: "优化赋能" },
          ].map((v) => (
            <div key={v.letter} className={styles.wendoItem}>
              <span className={styles.wendoLetter}>{v.letter}</span>
              <span className={styles.wendoCn}>{v.cn}</span>
              <span className={styles.wendoDesc}>{v.desc}</span>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.dimensions}>
        <div className={styles.dimensionsHeader}>
          <h2 className={`${styles.sectionTitle} font-serif-en`}>诊断维度</h2>
          <p className={styles.sectionSubtitle}>标准化分维度量化评分机制，每个维度独立评分，最终汇总生成总分</p>
        </div>
        <div className={styles.dimensionsGrid}>
          {dimensions.map((d) => (
            <div key={d.title} className={styles.dimensionCard}>
              <span className={styles.dimensionIcon}>{d.icon}</span>
              <h3 className={styles.dimensionTitle}>{d.title}</h3>
              <p className={styles.dimensionDesc}>{d.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.process}>
        <div className={styles.processHeader}>
          <h2 className={`${styles.sectionTitle} font-serif-en`}>工作原理</h2>
          <p className={styles.sectionSubtitle}>系统通过 RAG 检索专业知识库，Subagent 逐段完成问题识别与评分</p>
        </div>
        <div className={styles.processFlow}>
          <div className={styles.processStep}>
            <div className={styles.processStepNum}>01</div>
            <div className={styles.processStepContent}>
              <h3>文档切分</h3>
              <p>系统将源文档切分为文本片段，为逐段分析做准备。</p>
            </div>
          </div>
          <div className={styles.processArrow}>→</div>
          <div className={styles.processStep}>
            <div className={styles.processStepNum}>02</div>
            <div className={styles.processStepContent}>
              <h3>RAG 检索</h3>
              <p>通过 RAG 检索专业知识库，获取相关规范和案例参考。</p>
            </div>
          </div>
          <div className={styles.processArrow}>→</div>
          <div className={styles.processStep}>
            <div className={styles.processStepNum}>03</div>
            <div className={styles.processStepContent}>
              <h3>Subagent 评分</h3>
              <p>由 Subagent 逐段完成问题识别和四大维度独立评分。</p>
            </div>
          </div>
          <div className={styles.processArrow}>→</div>
          <div className={styles.processStep}>
            <div className={styles.processStepNum}>04</div>
            <div className={styles.processStepContent}>
              <h3>报告生成</h3>
              <p>汇总所有问题，生成结构化诊断报告与 before & after 对比分析。</p>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.flowchartSection}>
        <div className={styles.flowchartHeader}>
          <h2 className={`${styles.sectionTitle} font-serif-en`}>数据流程</h2>
          <p className={styles.sectionSubtitle}>从文档到诊断报告的完整路径</p>
        </div>
        <Flowchart />
      </section>

      <section className={styles.knowledge}>
        <div className={styles.knowledgeHeader}>
          <h2 className={`${styles.sectionTitle} font-serif-en`}>深度知识库</h2>
          <p className={styles.sectionSubtitle}>跨文化诊断的专业底气</p>
        </div>

        <div className={styles.knowledgeCards}>
          {knowledgeBaseCategories.map((cat) => (
            <div key={cat.title} className={styles.knowledgeCard}>
              <div className={styles.knowledgeCardTop}>
                <span className={styles.knowledgeIcon}>{cat.icon}</span>
                <span className={styles.knowledgeCount}>{cat.count}</span>
              </div>
              <h3 className={styles.knowledgeTitle}>{cat.title}</h3>
              <p className={styles.knowledgeSubtitle}>{cat.subtitle}</p>
              <div className={styles.knowledgeRegions}>
                {cat.regions.map((r) => (
                  <span key={r} className={styles.knowledgeRegion}>{r}</span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <KnowledgeTree />
      </section>

      <section className={styles.faq}>
        <div className={styles.faqHeader}>
          <h2 className={`${styles.sectionTitle} font-serif-en`}>FAQ</h2>
          <p className={styles.sectionSubtitle}>常见问题解答</p>
        </div>
        <FaqAccordion />
      </section>
    </div>
  );
}
