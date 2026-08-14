# Escuela El Carmen Full Migration Design

**Status:** Approved
**Date:** 2026-08-11
**Source site:** https://escuelaelcarmen.cl/

## Objective

Replace the public WordPress site with a React application that reproduces its useful visual design and behavior, migrates all real school content and historical publications, and provides a focused administration panel for future maintenance.

The application must use Next.js, React, TypeScript, TailwindCSS, and Supabase while following hexagonal architecture, SOLID, clean code, KISS, accessibility, responsive design, and test-driven development.

## Scope

### Public Site

- Reproduce the top information bar, primary header, school logo, navigation, dropdown menus, search, hero carousel, school-life news carousel, contact block, and footer.
- Reproduce the relevant internal institutional, community, workshop, news, document, and contact pages.
- Preserve public links for telephone, EDUFACIL, maps, Facebook, Instagram, and YouTube.
- Preserve relevant legacy URLs through redirects.
- Match the original typography, colors, geometry, spacing, images, responsive behavior, and useful interactions.
- Correct broken icon fonts, invisible lazy-loaded content, excessive empty space, failed resources, and plugin-related delays instead of duplicating those defects.

### Administration Panel

- Provide an authenticated `/admin` application.
- Allow structured editing of pages, page sections, posts, categories, documents, navigation, site settings, and media.
- Support `draft` and `published` content states.
- Support stable slugs, authorship, publication dates, and SEO metadata.
- Provide a media library for images and PDF documents.
- Provide clear loading, empty, success, validation, permission, session-expiry, and failure states.

### Roles

- `administrator`: manage all content, settings, navigation, media, and users.
- `editor`: create, update, publish, and remove pages, posts, documents, and media, but cannot manage users.
- `public`: read published content only.

### Migrated Content

- Home page and navigation.
- Vision, mission, school values, and anthem.
- Direction, UTP, teachers, inspection, school coexistence, assistants, and multidisciplinary teams.
- Workshops and their galleries.
- Historical news posts, dates, authors, categories, and media.
- Institutional documents, circulars, school-supply lists, and PDF files.
- Contact details, social links, opening hours, external links, logo, and school imagery.

### Excluded Content

- Theme demo pages such as sample pages, shops, carts, checkout, course demos, component showcases, and other content not belonging to Escuela El Carmen.
- WordPress administration, plugins, theme code, WooCommerce, WPBakery, and other obsolete runtime dependencies.
- Submission of any contact form during implementation or verification.
- A free-form visual page builder.

## Architecture

The system is a modular Next.js application with two presentation surfaces: the public site and the administration panel. Domain and application code remain independent of Next.js and Supabase. Infrastructure adapters implement ports defined by the application core.

```text
Presentation
  Next.js public routes
  Next.js administration routes
  Route handlers and server actions

Application
  PublishContent
  EditPage
  ManageDocument
  ManageMedia
  ManageUser
  QueryPublishedContent

Domain
  Page
  PageSection
  Post
  Category
  Document
  MediaAsset
  User
  Role
  NavigationItem
  SiteSettings
  Redirect

Ports
  ContentRepository
  DocumentRepository
  MediaStorage
  UserRepository
  AuthenticationService
  MigrationSource

Adapters
  Supabase repositories
  Supabase Auth
  Supabase Storage
  WordPress REST migration source
  Local content repositories
```

Dependencies must point inward. Domain entities and application use cases cannot import framework, database, HTTP, storage, or UI modules.

## Data Model

The PostgreSQL schema contains these primary relations:

- `profiles`: application identity, display name, and role linked to Supabase Auth.
- `pages`: slug, title, excerpt, publication state, SEO metadata, author, and timestamps.
- `page_sections`: ordered structured sections owned by a page.
- `posts`: slug, title, excerpt, body, publication state, author, dates, and SEO metadata.
- `categories`: reusable post classification.
- `post_categories`: post-to-category relation.
- `documents`: title, description, file reference, category, publication state, and date.
- `document_categories`: reusable document classification.
- `media_assets`: storage path, public URL, type, size, dimensions, alt text, checksum, and original WordPress URL.
- `page_media` and `post_media`: ordered media associations.
- `navigation_items`: hierarchical public navigation.
- `site_settings`: contact details, social links, opening hours, notices, and external service links.
- `redirects`: legacy path and destination path.
- `migration_records`: source identifier, source URL, checksum, migrated entity, status, and error details.

All exposed tables must use Row Level Security. Anonymous users may read only published public content. Editors and administrators receive explicit policies for their permitted operations. User-management operations remain administrator-only and server-side.

## Content Editing

Page editing uses structured sections instead of a free-form visual builder. Supported section types include rich text, image, gallery, document list, staff list, link list, video embed, and callout. Each section validates a typed payload before persistence.

The administration interface includes list, create, edit, preview, publish, unpublish, and delete workflows where relevant. Destructive actions require explicit confirmation. Unsaved changes are surfaced before navigation.

## Public Rendering

- Use Server Components by default.
- Isolate carousels, mobile navigation, search controls, and admin interactions as Client Components.
- Render public content statically where possible and use revalidation after publication changes.
- Generate metadata and canonical URLs from content records.
- Use responsive images and locally controlled assets.
- Provide not-found and controlled service-error states without exposing internal details.

## Visual Fidelity

The original site is the visual source of truth for intended design. Verification targets desktop, tablet, and mobile viewports.

Required visual elements include:

- Black utility bar with phone, institutional notice, EDUFACIL, and social links.
- White header with school crest, primary navigation, dropdowns, and search.
- Blue and yellow hero carousel with school photographs, large white labels, controls, and timed transitions.
- White `Vida Escolar` section with news cards and carousel controls.
- Blue and yellow contact section.
- Yellow information footer and blue copyright bar.
- Equivalent internal-page headers, content widths, typography, spacing, and imagery.

Visual comparison focuses on layout dimensions, spacing, typography, colors, borders, shadows, image crops, breakpoints, and interaction states. WordPress rendering defects are not fidelity requirements.

## Migration

The migration pipeline must be deterministic and idempotent.

1. Read public WordPress REST endpoints and relevant rendered pages.
2. Classify real school content and exclude theme-demo content.
3. Normalize HTML, entities, dates, links, slugs, and embedded media.
4. Download referenced school images and PDF documents.
5. Compute checksums and deduplicate media.
6. Map content to typed domain import records.
7. Import into a local fixture adapter for development.
8. Import the same records into Supabase through repository ports.
9. Record success, omission, and failure outcomes in a migration report.
10. Generate redirects for relevant original paths.

Failed items must not abort the entire migration. Each failure records its source URL and cause, and a rerun processes only missing or changed records.

## Local and Supabase Adapters

`LocalContentAdapter` provides migrated fixture content so the public application and automated tests run without Supabase credentials. It is a development and test adapter, not a production authentication substitute.

`SupabaseContentAdapter` provides production persistence, authentication, and file storage. Adapter selection is explicit through validated server-side environment variables. Secret and service-role keys must never be included in browser bundles.

The initial target is the Supabase Free plan. Current planning constraints are 500 MB database storage, 1 GB file storage, limited egress, no automatic backups, and possible pausing after low activity. The migration report must include total database payload and media size before production activation. If the content exceeds free limits, media optimization or a paid plan decision is required rather than silently dropping content.

## Contact Form

The contact form must reproduce the original appearance and provide accessible labels and local input validation. Its delivery adapter is configured separately through environment variables. Implementation and verification must not submit the form or transmit test data.

## Error Handling

- Missing public content returns a branded not-found page.
- Missing media uses an accessible fallback and records a diagnostic event.
- Public repository failures show controlled fallback content where available.
- Administration failures preserve user input and provide retry guidance.
- Expired sessions redirect to sign-in without losing the intended destination.
- Upload validation rejects unsupported type, excessive size, and missing alt text before persistence.
- Migration failures are isolated per source item and included in the report.

## Testing Strategy

Development follows red-green-refactor TDD for new behavior.

- Unit tests cover entities, value objects, roles, publication rules, slugs, section validation, mapping, deduplication, and migration decisions.
- Integration tests cover use cases against local repositories and Supabase-compatible contracts.
- Component tests cover navigation, dropdowns, mobile menu, carousel controls, content states, admin forms, validation, and permission-aware UI.
- End-to-end tests cover public navigation, legacy redirects, search, login boundaries, and administration workflows.
- Visual tests compare original and local screenshots at representative desktop, tablet, and mobile viewports.
- Accessibility checks cover semantic landmarks, keyboard navigation, focus states, labels, contrast, and reduced motion.
- Verification includes tests, lint, TypeScript, production build, browser console review, and architecture validation.
- Contact-form submission is explicitly excluded from automated and manual tests.

## Quality Constraints

- Prefer simple, focused modules with one reason to change.
- Keep business rules out of React components and persistence adapters.
- Use small interfaces owned by their consumers.
- Avoid framework inheritance, service locators, global mutable state, and speculative abstractions.
- Reuse components only when repetition or a stable shared concept exists.
- Use explicit types at every boundary and validate external data.
- Preserve user-facing Spanish copy and correct character encoding.

## Completion Criteria

- Every real public page and historical publication selected by the migration inventory is available locally.
- Relevant images and documents are downloaded, deduplicated, and referenced locally or in Supabase Storage.
- Original public URLs resolve directly or redirect to an equivalent route.
- Public and administration surfaces work on desktop, tablet, and mobile.
- Administrator and editor permissions are enforced in application code and database policies.
- Visual comparison shows close correspondence with the intended original design.
- Automated tests, lint, TypeScript, production build, accessibility checks, and architecture validation pass.
- No form submission occurs during implementation or verification.
