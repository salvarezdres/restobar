# Escuela El Carmen Public Site and WordPress Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete local, visually faithful React replacement for the public Escuela El Carmen site using migrated WordPress content and downloaded school assets.

**Architecture:** Domain and application modules define content behavior and repository ports. A WordPress migration adapter produces validated local fixtures, while Next.js presentation modules render the public site through application use cases. Supabase and the administration panel remain separate follow-up plans.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, TailwindCSS, Vitest, Testing Library, Playwright, Zod.

## Global Constraints

- Use local task commits in the isolated feature worktree and push only verified branch history to the configured GitHub repository.
- Do not submit the contact form in automated or manual verification.
- Download only public resources used by real Escuela El Carmen content.
- Exclude WordPress theme demos, WooCommerce, sample pages, course demos, and component showcases.
- Follow hexagonal architecture, SOLID, clean code, KISS, accessibility, and red-green-refactor TDD.
- Preserve Spanish copy and UTF-8 encoding.
- Use Server Components by default and isolate interactive widgets as Client Components.

---

### Task 1: Test Tooling and Module Skeleton

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`
- Create: `tests/setup.ts`
- Create: `src/domain/content/publication.ts`
- Test: `src/domain/content/publication.test.ts`

**Interfaces:**
- Produces: `ContentStatus`, `PublicationState`, and `isPubliclyVisible(state, now)` for later content use cases.

- [ ] **Step 1: Install test and validation dependencies**

```powershell
npm.cmd install zod clsx cheerio sanitize-html
npm.cmd install -D vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event eslint eslint-config-next @playwright/test tsx @types/sanitize-html
```

- [ ] **Step 2: Add scripts to `package.json`**

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "migrate:wordpress": "tsx scripts/migrate-wordpress.ts"
  }
}
```

- [ ] **Step 3: Configure Vitest**

```ts
// vitest.config.ts
import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: { alias: { "@": path.resolve(__dirname, ".") } },
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    include: ["**/*.test.{ts,tsx}"],
  },
});
```

```ts
// tests/setup.ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 4: Write the failing publication behavior test**

```ts
import { describe, expect, it } from "vitest";
import { isPubliclyVisible } from "./publication";

describe("isPubliclyVisible", () => {
  it("hides drafts even when they have a publication date", () => {
    expect(
      isPubliclyVisible(
        { status: "draft", publishedAt: new Date("2026-01-01T00:00:00Z") },
        new Date("2026-08-11T00:00:00Z"),
      ),
    ).toBe(false);
  });

  it("shows published content once its publication date arrives", () => {
    expect(
      isPubliclyVisible(
        { status: "published", publishedAt: new Date("2026-01-01T00:00:00Z") },
        new Date("2026-08-11T00:00:00Z"),
      ),
    ).toBe(true);
  });
});
```

- [ ] **Step 5: Run the test and verify RED**

Run: `npm.cmd test -- src/domain/content/publication.test.ts`
Expected: FAIL because `isPubliclyVisible` is missing.

- [ ] **Step 6: Implement the minimal domain behavior**

```ts
export type ContentStatus = "draft" | "published";

export interface PublicationState {
  status: ContentStatus;
  publishedAt: Date | null;
}

export function isPubliclyVisible(state: PublicationState, now: Date): boolean {
  return state.status === "published" && state.publishedAt !== null && state.publishedAt <= now;
}
```

- [ ] **Step 7: Run verification**

Run: `npm.cmd test -- src/domain/content/publication.test.ts`
Expected: tests pass.

Run: `npm.cmd run typecheck`
Expected: TypeScript exits with code 0.

---

### Task 2: Domain Models and Repository Ports

**Files:**
- Create: `src/domain/content/content.ts`
- Create: `src/domain/content/section.ts`
- Create: `src/domain/content/slug.ts`
- Create: `src/domain/navigation/navigation-item.ts`
- Create: `src/application/ports/content-repository.ts`
- Create: `src/application/use-cases/get-public-site.ts`
- Test: `src/domain/content/slug.test.ts`
- Test: `src/application/use-cases/get-public-site.test.ts`

**Interfaces:**
- Produces: `Page`, `Post`, `Document`, `MediaAsset`, `SiteSettings`, `NavigationItem`, `ContentRepository`, and `getPublicSite(repository, now)`.

- [ ] **Step 1: Write failing slug and publication-filter tests**

```ts
// src/domain/content/slug.test.ts
import { expect, it } from "vitest";
import { createSlug } from "./slug";

it("normalizes Spanish titles into stable URL slugs", () => {
  expect(createSlug("Visión, Misión y Sellos de nuestra escuela 270")).toBe(
    "vision-mision-y-sellos-de-nuestra-escuela-270",
  );
});
```

```ts
// src/application/use-cases/get-public-site.test.ts
import { expect, it } from "vitest";
import { getPublicSite } from "./get-public-site";
import { InMemoryContentRepository } from "@/tests/fakes/in-memory-content-repository";

it("returns published posts newest first and excludes drafts", async () => {
  const repository = new InMemoryContentRepository({
    posts: [
      { id: "draft", slug: "draft", title: "Draft", excerpt: "", body: "", status: "draft", publishedAt: null, categoryIds: [] },
      { id: "old", slug: "old", title: "Old", excerpt: "", body: "", status: "published", publishedAt: "2025-01-01T00:00:00Z", categoryIds: [] },
      { id: "new", slug: "new", title: "New", excerpt: "", body: "", status: "published", publishedAt: "2026-01-01T00:00:00Z", categoryIds: [] },
    ],
  });

  const site = await getPublicSite(repository, new Date("2026-08-11T00:00:00Z"));

  expect(site.posts.map((post) => post.id)).toEqual(["new", "old"]);
});
```

- [ ] **Step 2: Run tests and verify RED**

Run: `npm.cmd test -- src/domain/content/slug.test.ts src/application/use-cases/get-public-site.test.ts`
Expected: FAIL because the domain types, port, use case, and fake do not exist.

- [ ] **Step 3: Define focused domain types**

```ts
export interface MediaAsset {
  id: string;
  sourceUrl: string;
  localPath: string;
  alt: string;
  mimeType: string;
  checksum: string;
}

export interface Page {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  status: "draft" | "published";
  publishedAt: string | null;
  sections: PageSection[];
}

export interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  status: "draft" | "published";
  publishedAt: string | null;
  featuredMediaId?: string;
  categoryIds: string[];
}
```

- [ ] **Step 4: Define the application-owned port**

```ts
export interface ContentRepository {
  getPages(): Promise<Page[]>;
  getPosts(): Promise<Post[]>;
  getDocuments(): Promise<Document[]>;
  getMedia(): Promise<MediaAsset[]>;
  getNavigation(): Promise<NavigationItem[]>;
  getSiteSettings(): Promise<SiteSettings>;
}
```

- [ ] **Step 5: Implement slug normalization and the public query use case**

```ts
export function createSlug(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
```

`getPublicSite` must filter through `isPubliclyVisible`, sort posts descending by publication date, and return pages, posts, documents, media, navigation, and settings in a `PublicSiteContent` result.

- [ ] **Step 6: Add a real in-memory fake at `tests/fakes/in-memory-content-repository.ts`**

The fake implements every `ContentRepository` method and stores complete domain records. Tests assert consumer-visible results, not calls against the fake.

- [ ] **Step 7: Run verification**

Run: `npm.cmd test -- src/domain src/application`
Expected: all domain and application tests pass.

Run: `npm.cmd run typecheck`
Expected: TypeScript reports no errors.

---

### Task 3: Validated Local Content Adapter

**Files:**
- Create: `src/infrastructure/local/content-schema.ts`
- Create: `src/infrastructure/local/local-content-repository.ts`
- Create: `src/infrastructure/local/fixtures/site-content.json`
- Create: `tests/fixtures/content.ts`
- Test: `src/infrastructure/local/local-content-repository.test.ts`

**Interfaces:**
- Consumes: domain models and `ContentRepository` from Task 2.
- Produces: `LocalContentRepository.fromFileData(input)` and validated local fixture loading.

- [ ] **Step 1: Write a failing malformed-fixture test**

```ts
import { expect, it } from "vitest";
import { createPublishedPost, createValidLocalFixture } from "@/tests/fixtures/content";
import { LocalContentRepository } from "./local-content-repository";

it("rejects a published post without a publication date", () => {
  const fixture = createValidLocalFixture();
  fixture.posts = [{ ...createPublishedPost(), publishedAt: null }];

  expect(() => LocalContentRepository.fromFileData(fixture)).toThrow(/publishedAt/);
});
```

- [ ] **Step 2: Run the test and verify RED**

Run: `npm.cmd test -- src/infrastructure/local/local-content-repository.test.ts`
Expected: FAIL because the adapter does not exist.

- [ ] **Step 3: Implement Zod schemas at the external boundary**

Define complete schemas for every fixture record. Add a refinement requiring `publishedAt` when `status` is `published`. Transform parsed records into domain types; do not import Zod into domain modules.

- [ ] **Step 4: Implement `LocalContentRepository`**

```ts
export class LocalContentRepository implements ContentRepository {
  static fromFileData(input: unknown): LocalContentRepository;
  getPages(): Promise<Page[]>;
  getPosts(): Promise<Post[]>;
  getDocuments(): Promise<Document[]>;
  getMedia(): Promise<MediaAsset[]>;
  getNavigation(): Promise<NavigationItem[]>;
  getSiteSettings(): Promise<SiteSettings>;
}
```

Every getter returns a defensive copy so presentation code cannot mutate repository state.

- [ ] **Step 5: Seed a minimal valid fixture**

Include the current contact details, social URLs, EDUFACIL link, empty content collections, and navigation roots. The WordPress migration replaces the empty collections in Task 4.

- [ ] **Step 6: Run verification**

Run: `npm.cmd test -- src/infrastructure/local`
Expected: all local-adapter tests pass.

Run: `npm.cmd run typecheck`
Expected: TypeScript reports no errors.

---

### Task 4: Idempotent WordPress Migration and Asset Download

**Files:**
- Create: `src/infrastructure/wordpress/wordpress-types.ts`
- Create: `src/infrastructure/wordpress/wordpress-client.ts`
- Create: `src/infrastructure/wordpress/classify-content.ts`
- Create: `src/infrastructure/wordpress/map-content.ts`
- Create: `src/infrastructure/wordpress/download-asset.ts`
- Create: `src/infrastructure/wordpress/migration-report.ts`
- Create: `scripts/migrate-wordpress.ts`
- Create: `data/migration-report.json`
- Create: `data/redirects.json`
- Modify: `src/infrastructure/local/fixtures/site-content.json`
- Create: `public/assets/original/`
- Test: `src/infrastructure/wordpress/classify-content.test.ts`
- Test: `src/infrastructure/wordpress/map-content.test.ts`
- Test: `src/infrastructure/wordpress/download-asset.test.ts`

**Interfaces:**
- Consumes: local fixture schema from Task 3.
- Produces: `migrateWordPress(options): Promise<MigrationReport>` and deterministic fixture/assets output.

- [ ] **Step 1: Write failing content-classification tests**

```ts
import { expect, it } from "vitest";
import { classifyWordPressPage } from "./classify-content";

it.each([
  ["vision-mision-y-sellos", "school"],
  ["taller-de-futbol", "school"],
  ["sample-page", "excluded"],
  ["shop", "excluded"],
  ["elements", "excluded"],
] as const)("classifies %s as %s", (slug, expected) => {
  expect(classifyWordPressPage({ slug, parent: 0 })).toBe(expected);
});
```

- [ ] **Step 2: Write a failing mapping test with a complete WordPress fixture**

The fixture includes `id`, `date`, `slug`, `status`, `link`, `title.rendered`, `content.rendered`, `excerpt.rendered`, `featured_media`, `_embedded`, and category identifiers. Assert decoded Spanish text, normalized internal links, preserved date, and mapped media ID.

- [ ] **Step 3: Run migration tests and verify RED**

Run: `npm.cmd test -- src/infrastructure/wordpress`
Expected: FAIL because classification, mapping, and asset functions are missing.

- [ ] **Step 4: Implement the public WordPress client**

Use paginated requests against:

```text
https://escuelaelcarmen.cl/wp-json/wp/v2/pages
https://escuelaelcarmen.cl/wp-json/wp/v2/posts
https://escuelaelcarmen.cl/wp-json/wp/v2/categories
https://escuelaelcarmen.cl/wp-json/wp/v2/media
```

The client accepts a `fetch` dependency and base URL, checks HTTP status, validates JSON shape, follows `X-WP-TotalPages`, and applies a bounded retry only for `429` and `5xx` responses.

- [ ] **Step 5: Implement asset deduplication**

`downloadAsset` downloads to a temporary file, computes SHA-256, validates image/PDF MIME types, and moves unique content to `public/assets/original/<checksum>.<extension>`. Existing checksums are reused and no resource is downloaded twice.

- [ ] **Step 6: Implement the migration script**

```ts
await migrateWordPress({
  baseUrl: "https://escuelaelcarmen.cl",
  fixturePath: "src/infrastructure/local/fixtures/site-content.json",
  assetDirectory: "public/assets/original",
  redirectsPath: "data/redirects.json",
  reportPath: "data/migration-report.json",
});
```

The script writes sorted arrays and stable JSON formatting so rerunning without source changes produces identical outputs.

- [ ] **Step 7: Run unit tests and verify GREEN**

Run: `npm.cmd test -- src/infrastructure/wordpress`
Expected: all migration unit tests pass without accessing the network.

- [ ] **Step 8: Run the real migration**

Run: `npm.cmd run migrate:wordpress`
Expected: exit code 0; report contains counts for migrated, excluded, deduplicated, and failed items; no theme-demo page appears in the fixture.

- [ ] **Step 9: Verify migration idempotence**

Run `npm.cmd run migrate:wordpress` a second time and compare fixture/report checksums from both completed runs.
Expected: fixture and redirects checksums are unchanged; assets are reused.

---

### Task 5: Public Shell, Navigation, and Responsive Header

**Files:**
- Modify: `app/layout.tsx`
- Replace: `app/globals.css`
- Replace: `app/page.tsx`
- Create: `src/presentation/public/site-shell.tsx`
- Create: `src/presentation/public/utility-bar.tsx`
- Create: `src/presentation/public/site-header.tsx`
- Create: `src/presentation/public/mobile-navigation.tsx`
- Create: `src/presentation/public/site-footer.tsx`
- Create: `src/presentation/public/social-links.tsx`
- Test: `src/presentation/public/site-header.test.tsx`
- Test: `src/presentation/public/mobile-navigation.test.tsx`

**Interfaces:**
- Consumes: `NavigationItem` and `SiteSettings` from Task 2.
- Produces: reusable site chrome for every public route.

- [ ] **Step 1: Write failing accessible-navigation tests**

```tsx
it("opens a keyboard-accessible Escuela submenu", async () => {
  const user = userEvent.setup();
  render(<SiteHeader navigation={navigationFixture} settings={settingsFixture} />);

  await user.click(screen.getByRole("button", { name: "Escuela" }));

  expect(screen.getByRole("link", { name: "Visión, Misión y Sellos" })).toBeVisible();
});
```

```tsx
it("closes the mobile menu with Escape and restores focus", async () => {
  const user = userEvent.setup();
  render(<MobileNavigation navigation={navigationFixture} />);
  const trigger = screen.getByRole("button", { name: "Abrir menú" });
  await user.click(trigger);
  await user.keyboard("{Escape}");
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(trigger).toHaveFocus();
});
```

- [ ] **Step 2: Run component tests and verify RED**

Run: `npm.cmd test -- src/presentation/public/site-header.test.tsx src/presentation/public/mobile-navigation.test.tsx`
Expected: FAIL because the components do not exist.

- [ ] **Step 3: Implement the shell with original visual tokens**

Define CSS custom properties for the observed black, white, royal blue, deep blue, and warm yellow palette. Use the original logo asset, matching content width, header heights, typography scale, focus rings, and sticky behavior.

- [ ] **Step 4: Implement desktop and mobile navigation**

Desktop dropdowns open by pointer and keyboard. Mobile navigation uses a controlled dialog, body-scroll locking, Escape handling, focus restoration, nested section expansion, and link navigation.

- [ ] **Step 5: Implement utility and footer links**

Use semantic `tel:` and external anchors with safe target attributes. Preserve the displayed school notice, phone, address, hours, EDUFACIL, and social URLs from migrated settings.

- [ ] **Step 6: Run verification**

Run: `npm.cmd test -- src/presentation/public`
Expected: all public-shell tests pass.

Run: `npm.cmd run typecheck`
Expected: TypeScript reports no errors.

---

### Task 6: Faithful Home Page and Carousels

**Files:**
- Create: `src/presentation/public/home/home-page.tsx`
- Create: `src/presentation/public/home/hero-carousel.tsx`
- Create: `src/presentation/public/home/news-carousel.tsx`
- Create: `src/presentation/public/home/contact-panel.tsx`
- Create: `src/presentation/hooks/use-carousel.ts`
- Modify: `app/page.tsx`
- Test: `src/presentation/hooks/use-carousel.test.tsx`
- Test: `src/presentation/public/home/hero-carousel.test.tsx`
- Test: `src/presentation/public/home/contact-panel.test.tsx`

**Interfaces:**
- Consumes: `PublicSiteContent` from Task 2 and migrated media from Task 4.
- Produces: complete home route with useful original behavior.

- [ ] **Step 1: Write failing carousel behavior tests**

```tsx
it("moves to the next slide and wraps to the first", async () => {
  const user = userEvent.setup();
  render(<HeroCarousel slides={threeSlides} autoplay={false} />);
  const next = screen.getByRole("button", { name: "Siguiente diapositiva" });

  await user.click(next);
  await user.click(next);
  await user.click(next);

  expect(screen.getByRole("group", { name: "Diapositiva 1 de 3" })).toBeVisible();
});
```

Write a second test proving autoplay is disabled when `prefers-reduced-motion` is active.

- [ ] **Step 2: Write a failing non-submitting contact test**

```tsx
it("shows local validation without submitting contact data", async () => {
  const user = userEvent.setup();
  render(<ContactPanel />);
  await user.click(screen.getByRole("button", { name: "Enviar" }));
  expect(screen.getByText("Ingresa tu nombre")).toBeVisible();
  expect(screen.getByText("Ingresa un correo válido")).toBeVisible();
});
```

- [ ] **Step 3: Run tests and verify RED**

Run: `npm.cmd test -- src/presentation/hooks/use-carousel.test.tsx src/presentation/public/home`
Expected: FAIL because carousel and contact components are missing.

- [ ] **Step 4: Implement a reusable carousel state hook**

The hook accepts item count, interval, autoplay flag, and reduced-motion flag. It returns current index, `next`, `previous`, `goTo`, and pause/resume handlers. Timers are cleaned up on unmount and pause while focus or pointer is inside the carousel.

- [ ] **Step 5: Implement the original home composition**

Match the hero's blue/yellow background, framed school photos, oversized white text, navigation arrows, and indicators. Match the `Vida Escolar` whitespace, heading, news cards, metadata, and controls. Match the blue/yellow contact panel and footer transition.

- [ ] **Step 6: Keep the contact form side-effect free**

The local implementation validates name, email, and phone and displays errors. It must not call `fetch`, a server action, email provider, or Supabase.

- [ ] **Step 7: Run verification**

Run: `npm.cmd test -- src/presentation/public/home src/presentation/hooks`
Expected: all home and carousel tests pass.

Run: `npm.cmd run typecheck`
Expected: TypeScript reports no errors.

---

### Task 7: Internal Pages, News, Documents, Search, and Redirects

**Files:**
- Create: `app/[slug]/page.tsx`
- Create: `app/noticias/page.tsx`
- Create: `app/noticias/[slug]/page.tsx`
- Create: `app/documentos/page.tsx`
- Create: `app/buscar/page.tsx`
- Create: `src/application/use-cases/find-page.ts`
- Create: `src/application/use-cases/search-public-content.ts`
- Create: `src/presentation/public/content/page-renderer.tsx`
- Create: `src/presentation/public/content/post-list.tsx`
- Create: `src/presentation/public/content/document-list.tsx`
- Create: `src/presentation/public/content/search-results.tsx`
- Modify: `next.config.mjs`
- Test: `src/application/use-cases/search-public-content.test.ts`
- Test: `src/presentation/public/content/page-renderer.test.tsx`

**Interfaces:**
- Consumes: repository and local migrated fixture.
- Produces: all relevant legacy public routes and normalized search behavior.

- [ ] **Step 1: Write a failing accent-insensitive search test**

```ts
it("finds misión when the query omits the accent", async () => {
  const results = await searchPublicContent(repository, "mision", fixedNow);
  expect(results.map((item) => item.title)).toContain("Visión, Misión y Sellos");
});
```

- [ ] **Step 2: Write failing structured-section rendering tests**

Render rich text, image, gallery, document list, staff list, link list, video embed, and callout fixtures. Assert semantic output and accessible image alternatives.

- [ ] **Step 3: Run tests and verify RED**

Run: `npm.cmd test -- src/application/use-cases/search-public-content.test.ts src/presentation/public/content/page-renderer.test.tsx`
Expected: FAIL because search and renderers are missing.

- [ ] **Step 4: Implement public content search**

Normalize query and searchable text with Unicode decomposition, lowercase conversion, and whitespace folding. Search published page titles/excerpts, post titles/excerpts, and document titles/descriptions. Return typed result kinds and stable URLs.

- [ ] **Step 5: Implement dynamic public routes**

Use server-side repository access, `generateStaticParams`, generated metadata, `notFound()` for unknown slugs, and reusable section renderers. Sanitize migrated rich HTML during migration; do not render unvalidated raw source content.

- [ ] **Step 6: Configure legacy redirects**

Load `data/redirects.json` in `next.config.mjs` and map each source path to its local destination with permanent redirects. External WordPress URLs inside migrated content must point to equivalent local routes when available.

- [ ] **Step 7: Run verification**

Run: `npm.cmd test`
Expected: all tests pass.

Run: `npm.cmd run typecheck`
Expected: TypeScript reports no errors.

Run: `npm.cmd run build`
Expected: the production build exits with code 0.

---

### Task 8: Browser, Accessibility, and Visual-Fidelity Iteration

**Files:**
- Create: `playwright.config.ts`
- Create: `tests/e2e/public-navigation.spec.ts`
- Create: `tests/e2e/responsive-layout.spec.ts`
- Create: `tests/e2e/contact-validation.spec.ts`
- Create: `tests/visual/original/`
- Create: `tests/visual/local/`
- Create: `data/visual-comparison-report.md`

**Interfaces:**
- Consumes: completed public application.
- Produces: repeatable browser coverage and documented visual-difference closure.

- [ ] **Step 1: Write failing public navigation E2E coverage**

```ts
test("desktop navigation reaches institutional content", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Escuela" }).click();
  await page.getByRole("link", { name: "Visión, Misión y Sellos" }).click();
  await expect(page.getByRole("heading", { name: /Visión, Misión y Sellos/i })).toBeVisible();
});
```

- [ ] **Step 2: Write contact validation E2E without submission**

The test clicks `Enviar` with empty values and checks validation messages. It must not fill valid personal data and must not wait for or assert any network submission.

- [ ] **Step 3: Run E2E and verify RED against missing behavior**

Run: `npm.cmd run test:e2e`
Expected: at least one test fails for an unimplemented or mismatched public behavior, not from environment setup.

- [ ] **Step 4: Capture original and local screenshots**

Capture the original and local home page plus one institutional page, news listing, news detail, documents page, and mobile navigation at `1440x1000`, `1024x768`, and `390x844`. Scroll the original incrementally before full-page capture so lazy-loaded media is visible. Do not interact with any form.

- [ ] **Step 5: Iterate visual differences**

For each route and viewport, compare header height, content width, section height, typography, colors, image crop, spacing, carousel state, footer geometry, focus styles, and overflow. Record each observed mismatch and its correction in `data/visual-comparison-report.md`.

- [ ] **Step 6: Inspect browser logs and broken resources**

Expected: no React hydration errors, uncaught exceptions, missing local assets, mixed-content warnings, or repeated network failures.

- [ ] **Step 7: Run final phase verification**

Run each command separately:

```powershell
npm.cmd test
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run build
npm.cmd run test:e2e
```

Expected: every command exits with code 0; no test submits the contact form.

## Follow-up Plans

After this plan is verified, write and execute these separate plans in order:

1. `2026-08-11-supabase-schema-and-adapters.md`: PostgreSQL schema, migrations, RLS policies, Auth integration, Storage adapter, repository contract tests, environment validation, and fixture import.
2. `2026-08-11-administration-panel.md`: authenticated admin shell, administrator/editor authorization, structured content CRUD, media library, users, settings, navigation, preview, and admin E2E coverage.
