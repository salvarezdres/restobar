'use client'

import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { useRouter } from "next/navigation";

import styles from "@/app/dashboard/dashboard.module.css";
import { getFirebaseAuth } from "@/lib/auth";
import {
  createDish,
  deleteDish,
  subscribeToDishes,
  type Dish,
} from "@/lib/dishes";

export default function DashboardShell() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [isSavingDish, setIsSavingDish] = useState(false);
  const [deletingDishId, setDeletingDishId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const auth = getFirebaseAuth();
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setIsCheckingSession(false);

      if (!nextUser) {
        setDishes([]);
        router.replace("/");
      }
    });

    return unsubscribe;
  }, [router]);

  useEffect(() => {
    if (!user) {
      return;
    }

    return subscribeToDishes(
      (nextDishes) => {
        setDishes(nextDishes);
      },
      (snapshotError) => {
        setError(snapshotError.message);
      },
    );
  }, [user]);

  const handleSignOut = () => {
    const auth = getFirebaseAuth();
    setIsSigningOut(true);

    void signOut(auth).finally(() => {
      router.replace("/");
    });
  };

  const handleCreateDish = () => {
    if (!user) {
      return;
    }

    const trimmedName = name.trim();
    const trimmedDescription = description.trim();

    if (!trimmedName || !trimmedDescription) {
      setError("Cada platillo necesita nombre y descripcion.");
      return;
    }

    setError(null);
    setIsSavingDish(true);

    void createDish({
      name: trimmedName,
      description: trimmedDescription,
      createdBy: user.uid,
    })
      .then(() => {
        setName("");
        setDescription("");
        setIsComposerOpen(false);
      })
      .catch((createError: unknown) => {
        setError(
          createError instanceof Error
            ? createError.message
            : "No se pudo guardar el platillo.",
        );
      })
      .finally(() => {
        setIsSavingDish(false);
      });
  };

  const handleDeleteDish = (dishId: string) => {
    setError(null);
    setDeletingDishId(dishId);

    void deleteDish(dishId)
      .catch((deleteError: unknown) => {
        setError(
          deleteError instanceof Error
            ? deleteError.message
            : "No se pudo borrar el platillo.",
        );
      })
      .finally(() => {
        setDeletingDishId(null);
      });
  };

  if (isCheckingSession) {
    return (
      <section className={styles.dashboardCard}>
        <p className={styles.overline}>Menu Creator</p>
        <h1 className={styles.stateTitle}>Validando sesion...</h1>
      </section>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <section className={styles.dashboardCard}>
      <div className={styles.header}>
        <div className={styles.headerActions}>
          <button
            className={styles.addButton}
            onClick={() => {
              setError(null);
              setIsComposerOpen(true);
            }}
            type="button"
          >
            Anadir platillos
          </button>

          <button
            className={styles.signOutButton}
            disabled={isSigningOut}
            onClick={handleSignOut}
            type="button"
          >
            {isSigningOut ? "Saliendo..." : "Cerrar sesion"}
          </button>
        </div>
      </div>

      {error ? <p className={styles.errorBanner}>{error}</p> : null}

      {isComposerOpen ? (
        <section className={styles.composer}>
          <div className={styles.composerHeader}>
            <div>
              <p className={styles.sectionLabel}>Nuevo platillo</p>
              <h2 className={styles.sectionTitle}>Anadir a la carta</h2>
            </div>

            <button
              className={styles.dismissButton}
              onClick={() => {
                setIsComposerOpen(false);
                setError(null);
              }}
              type="button"
            >
              Cerrar
            </button>
          </div>

          <label className={styles.field}>
            <span>Nombre</span>
            <input
              onChange={(event) => setName(event.target.value)}
              placeholder="Ej. Ravioles de ricotta ahumada"
              value={name}
            />
          </label>

          <label className={styles.field}>
            <span>Descripcion</span>
            <textarea
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Describe el plato con un tono editorial y apetitoso."
              rows={4}
              value={description}
            />
          </label>

          <button
            className={styles.saveButton}
            disabled={isSavingDish}
            onClick={handleCreateDish}
            type="button"
          >
            {isSavingDish ? "Guardando..." : "Guardar platillo"}
          </button>
        </section>
      ) : null}

      <div className={styles.menuPaper}>
        <div className={styles.menuHeader}>
          <span className={styles.menuWord}>Menu</span>
          <p className={styles.menuLead}>
            Una carta viva conectada con Firestore para editar platillos sin
            tocar codigo.
          </p>
        </div>

        {dishes.length ? (
          <div className={styles.menuList}>
            {dishes.map((dish, index) => (
              <article className={styles.menuItem} key={dish.id}>
                <div className={styles.menuItemHeader}>
                  <div className={styles.menuIdentity}>
                    <span className={styles.menuIndex}>
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h2 className={styles.dishName}>{dish.name}</h2>
                  </div>

                  <button
                    className={styles.deleteButton}
                    disabled={deletingDishId === dish.id}
                    onClick={() => handleDeleteDish(dish.id)}
                    type="button"
                  >
                    {deletingDishId === dish.id ? "Borrando..." : "Borrar"}
                  </button>
                </div>
                <p className={styles.dishDescription}>{dish.description}</p>
              </article>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <p className={styles.sectionLabel}>Carta vacia</p>
            <h2 className={styles.sectionTitle}>
              Tu menu todavia no tiene platillos.
            </h2>
            <p className={styles.emptyHint}>
              Usa el boton <strong>Anadir platillos</strong> para crear el primer
              elemento y verlo aparecer en esta carta.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
