import styles from "./Card.module.css";

export default function Card({ title, children, full = false, className = "" }) {
  return (
    <section className={`${styles.card} ${full ? styles.full : ""} ${className}`.trim()}>
      {title ? <h2 className={styles.title}>{title}</h2> : null}
      {children}
    </section>
  );
}
