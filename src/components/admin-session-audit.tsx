'use client'

import styles from "@/components/workspace.module.css";
import { useSessionAuditUsers } from "@/hooks/use-kitchen-queries";
import { useFirebaseSession } from "@/hooks/use-firebase-session";

const ADMIN_EMAIL = "seba.cornex@gmail.com";

export default function AdminSessionAudit() {
  const { user } = useFirebaseSession();
  const isAdmin = user?.email === ADMIN_EMAIL;
  const auditQuery = useSessionAuditUsers(isAdmin);

  if (!isAdmin) {
    return (
      <section className={styles.emptyCard}>
        No tienes permiso para ver este modulo.
      </section>
    );
  }

  if (auditQuery.isLoading) {
    return <section className={styles.loadingCard} />;
  }

  return (
    <div className={styles.stack}>
      <section className={styles.summaryGrid}>
        <article className={styles.summaryCard}>
          <span className={styles.smallLabel}>Usuarios registrados</span>
          <strong className={styles.summaryValue}>
            {auditQuery.data?.length ?? 0}
          </strong>
        </article>
        <article className={styles.summaryCard}>
          <span className={styles.smallLabel}>Ultimo acceso</span>
          <strong className={styles.summaryValue}>
            {auditQuery.data?.[0]?.email ?? "Sin datos"}
          </strong>
        </article>
        <article className={styles.summaryCard}>
          <span className={styles.smallLabel}>Total inicios</span>
          <strong className={styles.summaryValue}>
            {auditQuery.data?.reduce((sum, item) => sum + item.signInCount, 0) ?? 0}
          </strong>
        </article>
      </section>

      <section className={styles.tableCard}>
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={styles.sectionTitle}>Sesiones registradas</h2>
            <p className={styles.sectionDescription}>
              Usuarios que iniciaron sesion y su metadata basica.
            </p>
          </div>
        </div>

        <div className={styles.table}>
          <div className={styles.tableHeadSix}>
            <span>Nombre</span>
            <span>Email</span>
            <span>UID</span>
            <span>Proveedores</span>
            <span>Ingresos</span>
            <span>Ultimo acceso</span>
          </div>

          {auditQuery.data?.length ? (
            auditQuery.data.map((item) => (
              <div className={styles.tableRowSix} key={item.id}>
                <span>{item.displayName}</span>
                <span>{item.email}</span>
                <span className={styles.truncate}>{item.uid}</span>
                <span>{item.providerIds.join(", ") || "n/a"}</span>
                <span>{item.signInCount}</span>
                <span>{item.lastLoginAt ?? item.updatedAt ?? "Sin fecha"}</span>
              </div>
            ))
          ) : (
            <div className={styles.emptyCard}>
              No hay sesiones registradas todavia.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
