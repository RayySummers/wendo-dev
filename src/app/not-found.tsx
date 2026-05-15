import Link from "next/link";
import styles from "./not-found.module.css";

export const metadata = {
  title: "页面未找到 — Wendo 文渡",
  description: "抱歉，您访问的页面不存在。返回 Wendo 文渡首页或浏览我们的产品与服务。",
};

export default function NotFoundPage() {
  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <h1 className={styles.title}>404</h1>
        <p className={styles.subtitle}>页面未找到</p>
        <p className={styles.text}>
          抱歉，您访问的页面不存在或已被移除。
        </p>
        <div className={styles.actions}>
          <Link href="/" className={styles.primaryBtn}>
            返回首页
          </Link>
          <Link href="/wendo-dev/contact" className={styles.secondaryBtn}>
            联系我们
          </Link>
        </div>
      </div>
    </div>
  );
}