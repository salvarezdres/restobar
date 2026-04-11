'use client'

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "firebase/auth";

import styles from "@/components/workspace.module.css";
import { useFirebaseSession } from "@/hooks/use-firebase-session";
import { useGsapReveal } from "@/hooks/use-gsap-reveal";
import { getFirebaseAuth } from "@/lib/auth";

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

export default function AppShell({
  children,
  description,
  title,
}: {
  children: React.ReactNode;
  description: string;
  title: string;
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

  const handleSignOut = () => {
    const auth = getFirebaseAuth();
    void signOut(auth).finally(() => {
      router.replace("/");
    });
  };

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

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <aside className={styles.sidebar}>
          <div className={styles.brand}>
            <span className={styles.brandLabel}>Kitchen OS</span>
            <strong className={styles.brandTitle}>Carta Studio</strong>
          </div>

          <nav className={styles.nav}>
            {NAV_GROUPS.map((group) => (
              <div className={styles.navSection} key={group.title}>
                <span className={styles.navSectionTitle}>{group.title}</span>
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
            ))}
          </nav>

          <div className={styles.sidebarFooter}>
            <span className={styles.smallLabel}>Sesion</span>
            <p className={styles.sessionText}>{user.email ?? "Sin correo"}</p>
            <button
              className={styles.ghostButton}
              onClick={handleSignOut}
              type="button"
            >
              Cerrar sesion
            </button>
          </div>
        </aside>

        <div className={styles.content} ref={scopeRef}>
          <header className={styles.topbar}>
            <div className={styles.titleBlock}>
              <span className={styles.eyebrow}>Operacion de cocina</span>
              <h1 className={styles.pageTitle}>{title}</h1>
              <p className={styles.pageDescription}>{description}</p>
            </div>
          </header>
          {children}
        </div>
      </div>
    </main>
  );
}
