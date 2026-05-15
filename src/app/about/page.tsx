import type { Metadata } from "next";
import styles from "./page.module.css";
import HeroFadeIn from "@/components/HeroFadeIn";

export const metadata: Metadata = {
  title: "关于文渡 — Wendo 团队与价值观",
  description: "了解 Wendo 文渡的创立故事、核心团队与价值观。我们是一支专注跨文化商务智能的团队，致力于帮助中国品牌温暖出海。",
  openGraph: {
    title: "关于文渡 — Wendo 团队与价值观",
    description: "了解 Wendo 文渡的创立故事、核心团队与价值观。",
  },
};

const team = [
  {
    name: "何睿",
    nameEn: "Rui He",
    role: "创始人 & 技术开发",
    bio: "文渡团队创始人，擅长AI辅助开发与人机协作，将技术转化为产品落地方案，为团队提供核心驱动力。",
    color: "#1943c1",
  },
  {
    name: "林莹涵",
    nameEn: "Yinghan Lin",
    role: "财务管理",
    bio: "团队财务与资源中枢，擅长精准预算管理、商务谈判落地，保障团队高效运转。",
    color: "#7c3aed",
  },
  {
    name: "黎胤欣",
    nameEn: "Yinxin Li",
    role: "市场调研",
    bio: "专注轻工出海市场调研，精准挖掘本地化痛点，为企业出海文化适配提供有力的数据支撑。",
    color: "#0891b2",
  },
  {
    name: "蒋京京",
    nameEn: "Jingjing Jiang",
    role: "产品设计 & 宣传运营",
    bio: "熟悉中西文化，拥有新媒体实战经验，擅长打通产品逻辑与品牌传播。",
    color: "#c2410c",
  },
  {
    name: "杨美惠",
    nameEn: "Meihui Yang",
    role: "用户体验优化",
    bio: "深耕表达性写作与用户心理研究，擅长精准捕捉出海诉求，为跨文化适配诊断提供用户体验支撑。",
    color: "#16a34a",
  },
];

const values = [
  {
    icon: "💛",
    title: "本地化即共情",
    desc: "翻译是文字的搬运，文化适配是情感的传递。我们相信每一次触达，都应让用户感受到被理解。",
  },
  {
    icon: "🌍",
    title: "文化智能 > 字面准确",
    desc: "字对字的翻译可能完美却冰冷，我们追求的是目标市场用户真正认可、喜欢、信任的沟通方式。",
  },
  {
    icon: "🔥",
    title: "温暖可跨越边界",
    desc: "好的品牌温度，不会因语言而流失。文渡让中国品牌的温度，跨越语言，触达每一个海外用户的心灵。",
  },
];

export default function AboutPage() {
  return (
    <div className={styles.page}>
      <HeroFadeIn
        title="关于文渡"
        align="center"
      />

      <section className={styles.story}>
        <div className={styles.storyContent}>
          <h2 className={`${styles.sectionTitle} font-serif-en`}>文渡的故事</h2>
          <div className={styles.storyText}>
            <p>
              当广货带着质优价实的底气走向全球，我们在服务广东中小轻工企业出海的过程中，却撞见了不少令人惋惜的现实：许多品牌投入重金布局海外营销，产品本身经得起市场检验，却因出海内容本地化不足，要么触碰了海外用户的文化禁忌，要么文案生硬刻板、充满"翻译腔"，在海外平台上被误解、调侃，让本该被看见的好产品，白白错失了市场机会。
            </p>
            <p>
              这让我们意识到，中国品牌出海的真正瓶颈不是产品质量，而是"文化温度"的传递。当一个品牌的英文官网让西方用户觉得"冷冰冰"时，再好的产品也会失去竞争力。
            </p>
            <p>
              于是文渡诞生了——我们不只是一个翻译工具，而是一个跨文化商务智能平台，帮助中国品牌发现并修复那些让海外用户"感觉不对"的细微之处。
            </p>
          </div>
        </div>
        <div className={styles.storyDecor} aria-hidden="true">
          <div className={styles.storyCircle} />
        </div>
      </section>

      <section className={styles.team}>
        <div className={styles.teamHeader}>
          <h2 className={`${styles.sectionTitle} font-serif-en`}>文渡团队</h2>
          <p className={styles.sectionSubtitle}>我们是一支专注跨文化商务智能的小团队</p>
        </div>
        <div className={styles.teamGrid}>
          {team.map((member) => (
            <div key={member.name} className={styles.memberCard}>
              <p className={styles.memberRole}>{member.role}</p>
              <div
                className={styles.memberAvatar}
                style={{ background: member.color }}
              >
                {member.name[0]}
              </div>
              <div className={styles.memberInfo}>
                <p className={styles.memberName}>{member.name}</p>
                <p className={styles.memberNameEn}>{member.nameEn}</p>
                <p className={styles.memberBio}>{member.bio}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.values}>
        <div className={styles.valuesHeader}>
          <h2 className={`${styles.sectionTitle} font-serif-en`}>团队价值观</h2>
        </div>
        <div className={styles.valuesGrid}>
          {values.map((v) => (
            <div key={v.title} className={styles.valueCard}>
              <span className={styles.valueIcon}>{v.icon}</span>
              <h3 className={styles.valueTitle}>{v.title}</h3>
              <p className={styles.valueDesc}>{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.cta}>
        <a href="/wendo-dev/contact" className={styles.ctaBtn}>
          加入体验计划，与我们同行
        </a>
      </section>
    </div>
  );
}
