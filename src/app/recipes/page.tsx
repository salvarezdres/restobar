import AppShell from "@/components/app-shell";
import RecipeManager from "@/components/recipe-manager";

export default function RecipesPage() {
  return (
    <AppShell
      description="Define recetas reutilizables con ingredientes, unidades y porciones base."
      title="Recetas"
    >
      <RecipeManager />
    </AppShell>
  );
}
