import DashboardShell from "@/components/dashboard-shell";
import styles from "./dashboard.module.css";

export default function DashboardPage() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <DashboardShell />
      </main>
    </div>
  );
}
