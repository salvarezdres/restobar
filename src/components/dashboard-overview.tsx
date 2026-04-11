'use client'

import { useMemo } from "react";
import Link from "next/link";

import styles from "@/components/workspace.module.css";
import { useWorkspaceSession } from "@/components/workspace-session-provider";
import {
  useCostCatalog,
  useEmployees,
  useMenus,
  useRecipes,
} from "@/hooks/use-kitchen-queries";
import { calculateMenuCosts } from "@/lib/kitchen/calculations";

function getSetupScore(values: {
  recipes: number;
  menus: number;
  costs: number;
  employees: number;
}) {
  let score = 0;

  if (values.recipes > 0) score += 30;
  if (values.menus > 0) score += 30;
  if (values.costs > 0) score += 25;
  if (values.employees > 0) score += 15;

  return score;
}

export default function DashboardOverview() {
  const { ownerId } = useWorkspaceSession();
  const recipesQuery = useRecipes(ownerId);
  const menusQuery = useMenus(ownerId);
  const costsQuery = useCostCatalog(ownerId);
  const employeesQuery = useEmployees(ownerId);

  const recipesCount = recipesQuery.data?.length ?? 0;
  const menusCount = menusQuery.data?.length ?? 0;
  const costsCount = costsQuery.data?.length ?? 0;
  const employeesCount = employeesQuery.data?.length ?? 0;
  const latestMenu = menusQuery.data?.[0];
  const latestRecipe = recipesQuery.data?.[0];
  const latestMenuCost = useMemo(
    () =>
      latestMenu
        ? calculateMenuCosts(
            latestMenu,
            recipesQuery.data ?? [],
            costsQuery.data ?? [],
          ).totalCost
        : 0,
    [costsQuery.data, latestMenu, recipesQuery.data],
  );
  const setupScore = useMemo(
    () =>
      getSetupScore({
        recipes: recipesCount,
        menus: menusCount,
        costs: costsCount,
        employees: employeesCount,
      }),
    [costsCount, employeesCount, menusCount, recipesCount],
  );
  const unresolvedCosts = Math.max(recipesCount - costsCount, 0);
  const summaryCards = [
    {
      hint: "Base reusable para menus, compras y estandarizacion.",
      key: "recipes",
      label: "Recetas activas",
      value: recipesCount,
    },
    ...(menusCount > 0
      ? [
          {
            hint: "Configuraciones listas para escalar produccion.",
            key: "menus",
            label: "Menus armados",
            value: menusCount,
          },
        ]
      : []),
    {
      hint: "Catalogo economico para medir margen sin hojas aparte.",
      key: "costs",
      label: "Items con costo",
      value: costsCount,
    },
    {
      hint: "Dotacion disponible para agenda, sueldos y operacion.",
      key: "employees",
      label: "Equipo cargado",
      value: employeesCount,
    },
  ] as const;

  return (
    <div className={styles.stack}>
      <section className={styles.heroPanel} data-reveal>
        <div className={styles.heroHeader}>
          <span className={styles.statusPill}>Operacion activa</span>
          <h2 className={styles.heroTitle}>
            Gestiona cocina, costos y equipo desde una sola capa operativa.
          </h2>
          <p className={styles.heroDescription}>
            El objetivo no es llenar formularios: es pasar de receta a produccion
            con menos friccion, costos visibles y decisiones claras.
          </p>
        </div>

        <div className={styles.heroMeta}>
          <span className={styles.heroPill}>Setup del sistema: {setupScore}%</span>
          <span className={styles.heroPill}>
            Ultimo menu: {latestMenu?.name ?? "Sin menu activo"}
          </span>
          <span className={styles.heroPill}>
            Costos pendientes: {unresolvedCosts > 0 ? unresolvedCosts : 0}
          </span>
        </div>
      </section>

      <section className={styles.summaryGrid}>
        {summaryCards.map((card) => (
          <article className={styles.summaryCard} data-reveal key={card.key}>
            <span className={styles.smallLabel}>{card.label}</span>
            <strong className={styles.summaryValue}>{card.value}</strong>
            <p className={styles.summaryHint}>{card.hint}</p>
          </article>
        ))}
      </section>

      <div className={styles.dashboardGrid}>
        <section className={styles.highlightPanel} data-reveal>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Pulso del sistema</h2>
              <p className={styles.sectionDescription}>
                Lo importante primero: cobertura, costos y capacidad operativa.
              </p>
            </div>
          </div>

          <div className={styles.splitMetrics}>
            <article className={styles.insightCard}>
              <span className={styles.smallLabel}>Receta reciente</span>
              <strong className={styles.insightValue}>
                {latestRecipe?.name ?? "Aun no cargas recetas"}
              </strong>
              <p className={styles.insightText}>
                {latestRecipe
                  ? `Alias @${latestRecipe.alias} con base para ${latestRecipe.baseServings} porciones.`
                  : "Empieza estandarizando una receta base antes de construir menus."}
              </p>
            </article>
            <article className={styles.insightCard}>
              <span className={styles.smallLabel}>Costo del menu actual</span>
              <strong className={styles.insightValue}>${latestMenuCost.toFixed(2)}</strong>
              <p className={styles.insightText}>
                {latestMenu
                  ? "Calculado desde ingredientes consolidados y catalogo de costos."
                  : "Aparecera cuando armes un menu con recetas existentes."}
              </p>
            </article>
          </div>

          <section className={styles.spotlightCard}>
            <div className={styles.sectionHeader}>
              <div>
                <h3 className={styles.sectionTitle}>Ruta recomendada</h3>
                <p className={styles.sectionDescription}>
                  Secuencia minima para pasar de setup a control operativo.
                </p>
              </div>
            </div>

            <div className={styles.processGrid}>
              {[
                {
                  step: "01",
                  title: "Estandariza recetas",
                  description:
                    "Define alias y cantidades base para dejar de depender de memoria.",
                },
                {
                  step: "02",
                  title: "Cruza costos",
                  description:
                    "Carga catalogo base para detectar margenes antes de producir.",
                },
                {
                  step: "03",
                  title: "Arma menus",
                  description:
                    "Escala porciones y consolida compras sin recalcular a mano.",
                },
                {
                  step: "04",
                  title: "Coordina equipo",
                  description:
                    "Agenda personas y sueldos sobre una operacion ya cuantificada.",
                },
              ].map((item) => (
                <article className={styles.processCard} key={item.step}>
                  <span className={styles.processNumber}>{item.step}</span>
                  <div>
                    <h4 className={styles.processTitle}>{item.title}</h4>
                    <p className={styles.processDescription}>{item.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </section>

        <section className={styles.highlightPanel} data-reveal>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Acciones que mueven negocio</h2>
              <p className={styles.sectionDescription}>
                Menos clics, mas avance real en la operacion.
              </p>
            </div>
          </div>

          <div className={styles.actionGrid}>
            <Link className={styles.actionCard} href="/recipes">
              <span className={styles.smallLabel}>Base de produccion</span>
              <strong className={styles.actionCardTitle}>Crear receta</strong>
              <p className={styles.actionDescription}>
                Estandariza preparaciones reutilizables con alias y cantidades base.
              </p>
            </Link>
            <Link className={styles.actionCard} href="/menus">
              <span className={styles.smallLabel}>Planificacion</span>
              <strong className={styles.actionCardTitle}>Construir menu</strong>
              <p className={styles.actionDescription}>
                Escala recetas existentes y consolida ingredientes automaticamente.
              </p>
            </Link>
            <Link className={styles.actionCard} href="/costs">
              <span className={styles.smallLabel}>Finanzas</span>
              <strong className={styles.actionCardTitle}>Actualizar costos</strong>
              <p className={styles.actionDescription}>
                Asegura trazabilidad entre ingredientes, compras y margen bruto.
              </p>
            </Link>
            <Link className={styles.actionCard} href="/schedule">
              <span className={styles.smallLabel}>Equipo</span>
              <strong className={styles.actionCardTitle}>Programar agenda</strong>
              <p className={styles.actionDescription}>
                Coordina colaboradores y genera citas conectadas a Google Calendar.
              </p>
            </Link>
          </div>

          <section className={styles.spotlightCard}>
            <div className={styles.sectionHeader}>
              <div>
                <h3 className={styles.sectionTitle}>Alertas operativas</h3>
                <p className={styles.sectionDescription}>
                  Lo que hoy sigue restando claridad al sistema.
                </p>
              </div>
            </div>

            <div className={styles.statusGrid}>
              <div className={styles.statusRow}>
                <div>
                  <strong className={styles.cardTitle}>Cobertura de costos</strong>
                  <p className={styles.cardMeta}>
                    {costsCount > 0
                      ? "Ya existe una base economica, pero debe mantenerse viva."
                      : "Sin catalogo de costos no hay lectura financiera confiable."}
                  </p>
                </div>
                <span className={styles.miniPill}>
                  {costsCount > 0 ? "En marcha" : "Pendiente"}
                </span>
              </div>
              <div className={styles.statusRow}>
                <div>
                  <strong className={styles.cardTitle}>Menus reutilizables</strong>
                  <p className={styles.cardMeta}>
                    {menusCount > 0
                      ? "Ya puedes proyectar compras y produccion sin rehacer calculos."
                      : "Aun no tienes un menu armado para medir compras consolidadas."}
                  </p>
                </div>
                <span className={styles.miniPill}>
                  {menusCount > 0 ? "Listo" : "Falta"}
                </span>
              </div>
              <div className={styles.statusRow}>
                <div>
                  <strong className={styles.cardTitle}>Equipo conectado</strong>
                  <p className={styles.cardMeta}>
                    {employeesCount > 0
                      ? "Ya tienes base para liquidaciones, agenda y costos laborales."
                      : "Carga colaboradores para unificar operacion y sueldos."}
                  </p>
                </div>
                <span className={styles.miniPill}>
                  {employeesCount > 0 ? "Activo" : "Pendiente"}
                </span>
              </div>
            </div>
          </section>
        </section>
      </div>
    </div>
  );
}
