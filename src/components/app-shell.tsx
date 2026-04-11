'use client'

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import styles from "@/components/workspace.module.css";
import { useFirebaseSession } from "@/hooks/use-firebase-session";
import { useGsapReveal } from "@/hooks/use-gsap-reveal";
import { WorkspaceSessionProvider } from "@/components/workspace-session-provider";

const ADMIN_EMAIL = "seba.cornex@gmail.com";

const NAV_GROUPS = [
  {
    title: "General",
    items: [{ href: "/dashboard", label: "Dashboard" }],
  },
  {
    title: "Cocina",
    items: [
      { href: "/recipes", label: "Recetas" },
      { href: "/menus", label: "Menus" },
      { href: "/costs", label: "Costos" },
    ],
  },
  {
    title: "Equipo",
    items: [
      { href: "/employees", label: "Empleados" },
      { href: "/compliance", label: "Normativa" },
      { href: "/payroll", label: "Liquidaciones" },
      { href: "/schedule", label: "Agenda" },
    ],
  },
  {
    title: "Finanzas",
    items: [
      { href: "/operations", label: "Operacion" },
      { href: "/margin", label: "Margen" },
      { href: "/projections", label: "Proyecciones" },
    ],
  },
] as const;

const PAGE_COPY: Record<string, { description: string; title: string }> = {
  "/admin/sessions": {
    title: "Sesiones",
    description: "Vista restringida de usuarios que iniciaron sesion y sus datos basicos.",
  },
  "/compliance": {
    title: "Normativa Laboral",
    description:
      "Motor activo de normativa laboral chilena con alertas, riesgo y seguimiento preventivo.",
  },
  "/costs": {
    title: "Costos",
    description:
      "Carga costos base por ingrediente para calcular el costo por receta y por menu.",
  },
  "/dashboard": {
    title: "",
    description: "Resumen del sistema, estado de los modulos y accesos principales.",
  },
  "/employees": {
    title: "Empleados",
    description:
      "Gestion basica de empleados, roles y sueldos para ampliar operacion mas adelante.",
  },
  "/margin": {
    title: "Margen",
    description:
      "Cruza ventas, costo directo, nomina y operacion para calcular margen bruto y liquido.",
  },
  "/menus": {
    title: "Menus",
    description:
      "Arma menus a partir de recetas existentes y consolida la lista final de ingredientes.",
  },
  "/operations": {
    title: "Operacion",
    description:
      "Registra costos operacionales fijos y variables para entender la base real del negocio.",
  },
  "/payroll": {
    title: "Liquidaciones",
    description:
      "Calcula liquidaciones estimadas, costo total de nomina y carga mensual por empleado.",
  },
  "/projections": {
    title: "Proyecciones",
    description:
      "Proyecta ventas mensuales, punto de equilibrio y aporte estimado despues de costos fijos.",
  },
  "/recipes": {
    title: "Recetas",
    description: "Define recetas reutilizables con ingredientes, unidades y porciones base.",
  },
  "/schedule": {
    title: "Agenda",
    description:
      "Planifica reuniones, turnos o coordinaciones y crea la cita en Google Calendar.",
  },
};

function findGroupTitleByPath(pathname: string, groups: readonly { title: string; items: readonly { href: string; label: string }[] }[]) {
  return groups.find((group) => group.items.some((item) => item.href === pathname))?.title ?? groups[0]?.title ?? "";
}

export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const scopeRef = useGsapReveal<HTMLDivElement>({
    delay: 0.05,
    duration: 0.5,
    stagger: 0.05,
    y: 16,
  });
  const { user, isCheckingSession } = useFirebaseSession({
    onUnauthenticated: () => {
      router.replace("/");
    },
  });
  const isAdmin = user?.email === ADMIN_EMAIL;
  const navGroups = useMemo(
    () => [
      ...NAV_GROUPS,
      ...(isAdmin
        ? [
            {
              title: "Admin",
              items: [{ href: "/admin/sessions", label: "Sesiones" }],
            },
          ]
        : []),
    ],
    [isAdmin],
  );
  const [expandedGroup, setExpandedGroup] = useState(() => findGroupTitleByPath(pathname, navGroups));

  useEffect(() => {
    setExpandedGroup(findGroupTitleByPath(pathname, navGroups));
  }, [navGroups, pathname]);

  if (isCheckingSession) {
    return (
      <main className={styles.page}>
        <div className={styles.content}>
          <section className={styles.loadingCard} />
        </div>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  const pageCopy = PAGE_COPY[pathname] ?? {
    title: "Workspace",
    description: "Panel operativo de cocina y gestion.",
  };

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <aside className={styles.sidebar}>
          <div className={styles.brand}>
            <span className={styles.brandLabel}>Kitchen OS</span>
          </div>

          <nav className={styles.nav}>
            {navGroups.map((group) => (
              <div className={styles.navSection} key={group.title}>
                <button
                  aria-controls={`nav-group-${group.title}`}
                  aria-expanded={expandedGroup === group.title}
                  className={`${styles.navSectionToggle} ${
                    expandedGroup === group.title ? styles.navSectionToggleActive : ""
                  }`}
                  onClick={() =>
                    setExpandedGroup((current) => (current === group.title ? "" : group.title))
                  }
                  type="button"
                >
                  <span className={styles.navSectionTitle}>{group.title}</span>
                </button>

                <div
                  aria-hidden={expandedGroup !== group.title}
                  className={`${styles.navSectionItemsWrap} ${
                    expandedGroup === group.title ? styles.navSectionItemsWrapOpen : ""
                  }`}
                  id={`nav-group-${group.title}`}
                >
                  <div className={styles.navSectionItems}>
                    {group.items.map((item) => (
                      <Link
                        className={`${styles.navLink} ${
                          pathname === item.href ? styles.navLinkActive : ""
                        }`}
                        href={item.href}
                        key={item.href}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </nav>

        </aside>

        <div className={styles.content} ref={scopeRef}>
          <header className={styles.topbar}>
            <div className={styles.titleBlock}>
              <span className={styles.eyebrow}>Operacion de cocina</span>
              {pageCopy.title ? <h1 className={styles.pageTitle}>{pageCopy.title}</h1> : null}
              <p className={styles.pageDescription}>{pageCopy.description}</p>
            </div>
          </header>
          <WorkspaceSessionProvider user={user}>{children}</WorkspaceSessionProvider>
        </div>
      </div>
    </main>
  );
}
