import Link from "next/link";
import styles from "./Footer.module.css";

const footerLinks = [
  { href: "/", label: "首页" },
  { href: "/product", label: "产品" },
  { href: "/pricing", label: "定价" },
  { href: "/about", label: "关于" },
  { href: "/wendo-dev/contact", label: "联系我们" },
];

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <span className={styles.tagline}>Where Words Warm the World</span>
          <span className={styles.chinese}>让出海有温度</span>
        </div>

        <nav className={styles.links} aria-label="Footer navigation">
          {footerLinks.map((link) => (
            <Link key={link.href} href={link.href} className={styles.link}>
              {link.label}
            </Link>
          ))}
        </nav>

        <p className={styles.copyright}>
          © 2026 文渡 版权所有
        </p>
      </div>
    </footer>
  );
}
