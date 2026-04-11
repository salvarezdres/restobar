import AppShell from "@/components/app-shell";
import MenuManager from "@/components/menu-manager";

export default function MenusPage() {
  return (
    <AppShell
      description="Arma menus a partir de recetas existentes y consolida la lista final de ingredientes."
      title="Menus"
    >
      <MenuManager />
    </AppShell>
  );
}
