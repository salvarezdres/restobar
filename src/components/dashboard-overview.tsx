'use client'

import Link from "next/link";

import styles from "@/components/workspace.module.css";
import {
  useCostCatalog,
  useEmployees,
  useMenus,
  useRecipes,
} from "@/hooks/use-kitchen-queries";
import { useFirebaseSession } from "@/hooks/use-firebase-session";
import { calculateMenuCosts } from "@/lib/kitchen/calculations";

export default function DashboardOverview() {
  const { user } = useFirebaseSession();
  const ownerId = user?.uid;
  const recipesQuery = useRecipes(ownerId);
  const menusQuery = useMenus(ownerId);
  const costsQuery = useCostCatalog(ownerId);
  const employeesQuery = useEmployees(ownerId);

  const latestMenu = menusQuery.data?.[0];
  const latestMenuCost = latestMenu
    ? calculateMenuCosts(
        latestMenu,
        recipesQuery.data ?? [],
        costsQuery.data ?? [],
      ).totalCost
    : 0;

  return (
    <div className={styles.stack}>
      <section className={styles.summaryGrid}>
        <article className={styles.summaryCard}>
          <span className={styles.smallLabel}>Recetas</span>
          <strong className={styles.summaryValue}>{recipesQuery.data?.length ?? 0}</strong>
        </article>
        <article className={styles.summaryCard}>
          <span className={styles.smallLabel}>Menus</span>
          <strong className={styles.summaryValue}>{menusQuery.data?.length ?? 0}</strong>
        </article>
        <article className={styles.summaryCard}>
          <span className={styles.smallLabel}>Equipo</span>
          <strong className={styles.summaryValue}>
            {employeesQuery.data?.length ?? 0}
          </strong>
        </article>
      </section>

      <div className={styles.workspaceGrid}>
        <section className={styles.panel}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Estado del MVP</h2>
              <p className={styles.sectionDescription}>
                Colecciones separadas por modulo, calculo reutilizable y base lista
                para evolucionar a inventario y operacion.
              </p>
            </div>
          </div>

          <div className={styles.stack}>
            <div className={styles.listCard}>
              <span className={styles.cardTitle}>Receta mas reciente</span>
              <p className={styles.cardMeta}>
                {recipesQuery.data?.[0]?.name ?? "Todavia no hay recetas"}
              </p>
            </div>
            <div className={styles.listCard}>
              <span className={styles.cardTitle}>Menu mas reciente</span>
              <p className={styles.cardMeta}>
                {latestMenu?.name ?? "Todavia no hay menus"}
              </p>
            </div>
            <div className={styles.listCard}>
              <span className={styles.cardTitle}>Costo menu actual</span>
              <p className={styles.cardMeta}>${latestMenuCost.toFixed(2)}</p>
            </div>
          </div>
        </section>

        <section className={styles.panel}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Accesos rapidos</h2>
              <p className={styles.sectionDescription}>
                Flujo recomendado para poblar el sistema sin friccion.
              </p>
            </div>
          </div>

          <div className={styles.buttonRow}>
            <Link className={styles.primaryButton} href="/recipes">
              Crear receta
            </Link>
            <Link className={styles.secondaryButton} href="/menus">
              Construir menu
            </Link>
            <Link className={styles.secondaryButton} href="/costs">
              Completar costos
            </Link>
            <Link className={styles.secondaryButton} href="/employees">
              Agregar empleado
            </Link>
            <Link className={styles.secondaryButton} href="/payroll">
              Liquidaciones
            </Link>
            <Link className={styles.secondaryButton} href="/margin">
              Ver margen
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
