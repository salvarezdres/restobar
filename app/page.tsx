import Link from "next/link";
import { SectionHeading } from "@/components/section-heading";

const quickLinks = [
  {
    title: "Documentos",
    text: "Circulares, reglamentos, calendarios y material institucional siempre visible.",
    href: "#documentos",
  },
  {
    title: "Noticias",
    text: "Avisos recientes, actividades y hitos de la comunidad escolar.",
    href: "#noticias",
  },
  {
    title: "Contacto",
    text: "Canales de comunicación, teléfono, correo y ubicación del establecimiento.",
    href: "#contacto",
  },
  {
    title: "Plataforma EDUFÁCIL",
    text: "Acceso rápido para apoderados y comunidad a la plataforma externa.",
    href: "https://www.edufacil.cl/login.php",
  },
];

const communityRoles = [
  {
    role: "Dirección",
    name: "Equipo directivo",
    text: "Visión general, coordinación institucional y conducción del proyecto educativo.",
  },
  {
    role: "UTP",
    name: "Gestión pedagógica",
    text: "Planificación, evaluación, acompañamiento docente y soporte curricular.",
  },
  {
    role: "Inspectoría",
    name: "Convivencia y apoyo",
    text: "Orden escolar, seguimiento de asistencia y acompañamiento cotidiano.",
  },
];

const workshops = [
  "Folklore",
  "Danza y destreza",
  "Coro",
  "Canto",
  "Instrumentos musicales",
  "Tenis de mesa",
  "Artes marciales",
  "Basketball",
  "Handball",
  "Fútbol",
];

const news = [
  {
    date: "12 AGO",
    title: "Reunión de apoderados",
    text: "Se informan fechas, horarios y materiales para el cierre de semestre.",
  },
  {
    date: "18 AGO",
    title: "Muestra de talleres",
    text: "Presentación abierta de música, deporte y expresión artística de la escuela.",
  },
  {
    date: "24 AGO",
    title: "Jornada de convivencia",
    text: "Actividad comunitaria para reforzar pertenencia, cuidado y participación.",
  },
];

const menuGroups = [
  {
    label: "Escuela",
    items: ["Visión, misión y sellos", "Himno escolar", "Documentos"],
  },
  {
    label: "Comunidad",
    items: ["Dirección", "UTP", "Inspectoría", "Docentes", "Equipo multidisciplinario"],
  },
  {
    label: "Talleres",
    items: ["Folklore", "Danza y destreza", "Coro", "Canto", "Fútbol"],
  },
];

export default function Page() {
  return (
    <main className="page-shell">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 pb-10 pt-3 sm:px-6 lg:px-8">
        <div className="glass summary-card flex flex-col gap-3 rounded-[1.4rem] px-4 py-3 text-[0.78rem] text-sand-100/80 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="text-sand-200/90">Fono: +56 9 3336 4380</span>
            <span className="hidden h-4 w-px bg-white/10 md:block" />
            <span className="text-sand-100/76">
              Nuestra escuela no cuenta con Programa de Integración Escolar (PIE)
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link className="text-sand-200/90 transition hover:text-white" href="https://www.facebook.com/escuela270elcarmen/" target="_blank">
              Facebook
            </Link>
            <Link className="text-sand-200/90 transition hover:text-white" href="https://www.instagram.com/escuela270elcarmen/" target="_blank">
              Instagram
            </Link>
            <Link className="text-sand-200/90 transition hover:text-white" href="https://www.youtube.com/channel/UCL8yhM-LZwbeBexux1c1aig?disable_polymer=true" target="_blank">
              YouTube
            </Link>
          </div>
        </div>

        <header className="sticky top-3 z-30 mt-4">
          <div className="glass noise rounded-[1.6rem] px-4 py-4 shadow-glow">
            <div className="flex items-center justify-between gap-4">
              <Link href="#inicio" className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-sand-200/20 bg-sand-100/10 text-center font-[family-name:var(--font-display)] text-xl text-sand-100">
                  270
                </div>
                <div>
                  <p className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight text-sand-50">
                    Escuela El Carmen
                  </p>
                  <p className="text-xs uppercase tracking-[0.32em] text-sand-200/70">
                    Creciendo juntos en Conchalí
                  </p>
                </div>
              </Link>

              <nav className="hidden items-center gap-1 lg:flex">
                <Link className="rounded-full px-4 py-2 text-sm text-sand-100/85 transition hover:bg-white/7 hover:text-white" href="#inicio">
                  Inicio
                </Link>
                {menuGroups.map((group) => (
                  <details key={group.label} className="group relative">
                    <summary className="list-none rounded-full px-4 py-2 text-sm text-sand-100/85 transition hover:bg-white/7 hover:text-white">
                      {group.label}
                    </summary>
                    <div className="glass absolute left-0 top-[calc(100%+0.5rem)] w-64 rounded-2xl p-3">
                      {group.items.map((item) => (
                        <div key={item} className="rounded-xl px-3 py-2 text-sm text-sand-100/78 transition hover:bg-white/5 hover:text-white">
                          {item}
                        </div>
                      ))}
                    </div>
                  </details>
                ))}
                <Link className="rounded-full px-4 py-2 text-sm text-sand-100/85 transition hover:bg-white/7 hover:text-white" href="#noticias">
                  Noticias
                </Link>
                <Link className="rounded-full px-4 py-2 text-sm text-sand-100/85 transition hover:bg-white/7 hover:text-white" href="#contacto">
                  Contacto
                </Link>
              </nav>

              <Link
                href="#contacto"
                className="hidden rounded-full border border-sand-200/25 bg-sand-200/10 px-5 py-2.5 text-sm font-semibold text-sand-50 transition hover:bg-sand-200/18 lg:inline-flex"
              >
                Hablemos
              </Link>

              <details className="relative lg:hidden">
                <summary className="list-none rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-sand-50">
                  Menú
                </summary>
                <div className="glass absolute right-0 mt-3 w-[min(90vw,320px)] rounded-3xl p-4">
                  <div className="space-y-2">
                    <Link className="block rounded-2xl px-3 py-2 text-sm text-sand-100/84 hover:bg-white/5 hover:text-white" href="#inicio">
                      Inicio
                    </Link>
                    <Link className="block rounded-2xl px-3 py-2 text-sm text-sand-100/84 hover:bg-white/5 hover:text-white" href="#comunidad">
                      Comunidad
                    </Link>
                    <Link className="block rounded-2xl px-3 py-2 text-sm text-sand-100/84 hover:bg-white/5 hover:text-white" href="#talleres">
                      Talleres
                    </Link>
                    <Link className="block rounded-2xl px-3 py-2 text-sm text-sand-100/84 hover:bg-white/5 hover:text-white" href="#noticias">
                      Noticias
                    </Link>
                    <Link className="block rounded-2xl px-3 py-2 text-sm text-sand-100/84 hover:bg-white/5 hover:text-white" href="#contacto">
                      Contacto
                    </Link>
                  </div>
                </div>
              </details>
            </div>
          </div>
        </header>

        <section id="inicio" className="relative grid flex-1 items-center gap-10 pb-8 pt-10 lg:grid-cols-[1.2fr_0.8fr] lg:pt-16">
          <div className="absolute inset-x-0 top-4 -z-10 mx-auto h-[34rem] max-w-5xl rounded-full bg-[radial-gradient(circle_at_center,rgba(215,182,108,0.20),transparent_60%)] blur-3xl" />

          <div className="relative z-10">
            <p className="section-label text-xs font-semibold text-sand-200/70">Sitio institucional</p>
            <h1 className="mt-4 max-w-3xl font-[family-name:var(--font-display)] text-6xl leading-[0.92] font-semibold tracking-tight text-sand-50 md:text-7xl">
              Una escuela viva, luminosa y cercana.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-sand-100/82 md:text-lg">
              Una versión React inspirada en la portada de Escuela El Carmen 270, con una composición editorial,
              accesos rápidos y secciones pensadas para apoderados, estudiantes y equipo docente.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="#noticias"
                className="rounded-full bg-sand-200 px-6 py-3 text-sm font-semibold text-ink-950 transition hover:bg-sand-100"
              >
                Ver noticias
              </Link>
              <Link
                href="https://www.edufacil.cl/login.php"
                target="_blank"
                className="rounded-full border border-white/12 bg-white/5 px-6 py-3 text-sm font-semibold text-sand-50 transition hover:bg-white/10"
              >
                Acceder a EDUFÁCIL
              </Link>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                ["1.2K+", "familias conectadas"],
                ["10", "talleres activos"],
                ["24/7", "información visible"],
              ].map(([value, label]) => (
                <div key={value} className="glass summary-card rounded-[1.4rem] p-5">
                  <div className="text-3xl font-[family-name:var(--font-display)] font-semibold text-sand-50">{value}</div>
                  <div className="mt-2 text-sm text-sand-100/75">{label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-8 top-10 h-28 w-28 rounded-full bg-sand-300/20 blur-2xl" />
            <div className="glass noise summary-card relative overflow-hidden rounded-[2rem] p-6">
              <div className="absolute inset-x-0 top-0 h-px gold-line" />

              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-sand-200/60">Panel rápido</p>
                  <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold text-sand-50">
                    Todo lo importante a un vistazo.
                  </h2>
                </div>
                <div className="rounded-full border border-sand-200/20 bg-sand-100/10 px-3 py-1 text-xs text-sand-100/75">
                  Activo
                </div>
              </div>

              <div className="mt-6 grid gap-4">
                <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-sand-200/60">Contacto</p>
                  <p className="mt-2 text-2xl font-semibold text-sand-50">+56 9 3336 4380</p>
                  <p className="mt-1 text-sm text-sand-100/72">Atención institucional y consultas generales.</p>
                </div>
                <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-sand-200/60">Ubicación</p>
                  <p className="mt-2 text-xl font-semibold text-sand-50">Conchalí, Santiago</p>
                  <p className="mt-1 text-sm text-sand-100/72">Comunidad escolar en el corazón del barrio.</p>
                </div>
                <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-sand-200/60">Sello</p>
                  <p className="mt-2 text-xl font-semibold text-sand-50">Formación, cultura y convivencia</p>
                  <p className="mt-1 text-sm text-sand-100/72">Un relato institucional más claro y contemporáneo.</p>
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="glass rounded-[1.6rem] p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-sand-200/60">Acceso</p>
                <p className="mt-2 text-lg font-semibold text-sand-50">EDUFÁCIL</p>
                <p className="mt-1 text-sm text-sand-100/72">Entrada externa para apoderados y gestión diaria.</p>
              </div>
              <div className="glass rounded-[1.6rem] p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-sand-200/60">Horario</p>
                <p className="mt-2 text-lg font-semibold text-sand-50">Lunes a viernes</p>
                <p className="mt-1 text-sm text-sand-100/72">Actividades académicas, talleres y atención.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-8">
          <SectionHeading
            eyebrow="Accesos directos"
            title="La ruta rápida hacia la información del colegio."
            description="Estos bloques reemplazan la experiencia dispersa del WordPress con una navegación más clara y una lectura más limpia para familias y comunidad."
          />

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {quickLinks.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                target={item.href.startsWith("http") ? "_blank" : undefined}
                className="glass group rounded-[1.5rem] p-6 transition duration-300 hover:-translate-y-1 hover:border-sand-200/20 hover:bg-white/[0.08]"
              >
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-xl font-semibold text-sand-50">{item.title}</h3>
                  <span className="text-sand-200/60 transition group-hover:text-sand-100">↗</span>
                </div>
                <p className="mt-4 text-sm leading-7 text-sand-100/74">{item.text}</p>
              </Link>
            ))}
          </div>
        </section>

        <section id="comunidad" className="py-8">
          <SectionHeading
            eyebrow="Comunidad"
            title="Áreas institucionales visibles en una sola pantalla."
            description="La estructura reproduce el espíritu del sitio original, pero en una grilla más robusta y legible para una futura mantención sin WordPress."
          />

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {communityRoles.map((item) => (
              <article key={item.role} className="glass rounded-[1.6rem] p-6">
                <p className="text-xs uppercase tracking-[0.24em] text-sand-200/60">{item.role}</p>
                <h3 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold text-sand-50">
                  {item.name}
                </h3>
                <p className="mt-4 text-sm leading-7 text-sand-100/76">{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="talleres" className="py-8">
          <SectionHeading
            eyebrow="Talleres"
            title="La parte más expresiva del colegio, presentada con más ritmo."
            description="Los talleres se muestran como una constelación de módulos, para que el sitio tenga energía sin perder orden visual."
          />

          <div className="mt-8 flex flex-wrap gap-3">
            {workshops.map((item) => (
              <span
                key={item}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-sand-100/80"
              >
                {item}
              </span>
            ))}
          </div>
        </section>

        <section id="noticias" className="py-8">
          <SectionHeading
            eyebrow="Noticias"
            title="Avisos recientes con formato editorial."
            description="En lugar de depender de un carrusel pesado, el contenido clave se presenta en tarjetas simples, rápidas de editar y fáciles de sostener."
          />

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {news.map((item) => (
              <article key={item.title} className="glass rounded-[1.6rem] p-6">
                <p className="inline-flex rounded-full border border-sand-200/20 bg-sand-100/10 px-3 py-1 text-xs font-semibold text-sand-100/80">
                  {item.date}
                </p>
                <h3 className="mt-4 text-2xl font-semibold text-sand-50">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-sand-100/76">{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="documentos" className="py-8">
          <div className="glass overflow-hidden rounded-[2rem] border border-white/10">
            <div className="grid gap-0 lg:grid-cols-[1fr_0.95fr]">
              <div className="p-8 md:p-10">
                <p className="section-label text-xs font-semibold text-sand-200/70">Documentos</p>
                <h2 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight text-sand-50">
                  Un bloque claro para normativas, descargas y publicaciones.
                </h2>
                <p className="mt-5 max-w-2xl text-sm leading-7 text-sand-100/76 md:text-base">
                  Este módulo puede crecer con PDFs, circulares y recursos institucionales sin romper la composición general.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  {["Reglamento interno", "Calendario", "Circulares", "Material pedagógico"].map((item) => (
                    <span key={item} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-sand-100/80">
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="border-t border-white/10 p-8 md:p-10 lg:border-l lg:border-t-0">
                <div className="rounded-[1.7rem] bg-[linear-gradient(180deg,rgba(215,182,108,0.18),rgba(215,182,108,0.06))] p-6">
                  <p className="text-xs uppercase tracking-[0.3em] text-sand-100/70">Llamado a la acción</p>
                  <h3 className="mt-3 text-3xl font-semibold text-sand-50">¿Quieres que lo deje listo para producción?</h3>
                  <p className="mt-4 text-sm leading-7 text-sand-100/78">
                    Puedo seguir con una segunda pasada para replicar páginas internas, adaptar colores, o convertir esto en un sitio completo con rutas reales.
                  </p>
                  <Link
                    href="#contacto"
                    className="mt-6 inline-flex rounded-full bg-sand-200 px-5 py-3 text-sm font-semibold text-ink-950 transition hover:bg-sand-100"
                  >
                    Ir a contacto
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="contacto" className="py-8">
          <SectionHeading
            eyebrow="Contacto"
            title="Cierre con información práctica."
            description="Mantengo el contenido útil del sitio original, pero con una presentación que facilita operar y mantener la web desde React."
          />

          <div className="mt-8 grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="glass rounded-[1.7rem] p-6">
              <div className="grid gap-4">
                <div className="rounded-[1.3rem] border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-sand-200/60">Teléfono</p>
                  <p className="mt-2 text-xl font-semibold text-sand-50">+56 9 3336 4380</p>
                </div>
                <div className="rounded-[1.3rem] border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-sand-200/60">Correo</p>
                  <p className="mt-2 text-xl font-semibold text-sand-50">Canal institucional por definir</p>
                </div>
                <div className="rounded-[1.3rem] border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-sand-200/60">Dirección</p>
                  <p className="mt-2 text-xl font-semibold text-sand-50">Conchalí, Región Metropolitana</p>
                </div>
              </div>
            </div>

            <div className="glass rounded-[1.7rem] p-6">
              <div className="grid h-full gap-4 md:grid-cols-[1fr_0.95fr]">
                <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
                  <p className="text-xs uppercase tracking-[0.24em] text-sand-200/60">Visión React</p>
                  <p className="mt-3 text-2xl font-semibold text-sand-50">Más limpio, más rápido y menos dependiente de plugins.</p>
                  <p className="mt-3 text-sm leading-7 text-sand-100/75">
                    La base queda lista para seguir agregando páginas internas, formularios o una CMS moderna si después la necesitas.
                  </p>
                </div>
                <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
                  <p className="text-xs uppercase tracking-[0.24em] text-sand-200/60">Estado</p>
                  <p className="mt-3 text-2xl font-semibold text-sand-50">Clon funcional de portada</p>
                  <p className="mt-3 text-sm leading-7 text-sand-100/75">
                    Si quieres, el siguiente paso es copiar también páginas internas o conectarlo a datos reales.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <footer className="mt-8 border-t border-white/10 py-6 text-sm text-sand-100/65">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p>Escuela El Carmen 270. Versión React inspirada en la portada pública del sitio original.</p>
            <p>Diseñado para migrar fuera de WordPress.</p>
          </div>
        </footer>
      </div>
    </main>
  );
}
