# System Documentation — Patompong Tech Consultant Website

**Version:** 1.0  
**Date:** March 2026  
**Author:** AI-Assisted Development (Windsurf Cascade)  
**Purpose:** เอกสารเชิงลึกสำหรับนำไปปรึกษาผู้เชี่ยวชาญเฉพาะทาง

---

## 1. Executive Summary

ระบบนี้เป็นเว็บไซต์แสดงผลงาน (Portfolio) และระบบบริหารจัดการ (Admin Panel) สำหรับ **Patompong Tech Consultant** — นักวิชาการคอมพิวเตอร์ประจำหน่วยงานภาคท้องถิ่น ผู้มีประสบการณ์กว่า 13 ปี ในสายงานเทคโนโลยีสารสนเทศ

### Core Functions
- **Public Website** — แสดงผลงาน บริการ ประสบการณ์ แกลเลอรีภาพ ช่องทางติดต่อ
- **Admin Panel** — จัดการข้อมูลผลงาน ไทม์ไลน์ ภาพถ่าย ใบเสนอราคา รายงาน
- **Portfolio Repository** — คลังผลงานดิจิทัลที่บันทึก จัดหมวดหมู่ และแชร์ได้

---

## 2. Technology Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Framework** | Next.js | 16.1.6 | Full-stack React framework (App Router) |
| **Runtime** | React | 19.2.3 | UI rendering with Server Components |
| **Language** | TypeScript | 5.x | Type safety |
| **Bundler** | Turbopack | Built-in | Fast dev builds (Next.js default) |
| **Database** | SQLite | via Prisma | Lightweight embedded DB |
| **ORM** | Prisma | 5.22.0 | Type-safe database access |
| **CSS** | Tailwind CSS | 4.x | Utility-first styling |
| **Animation** | Framer Motion | 12.x | Page transitions, scroll animations |
| **3D** | Three.js / R3F | 0.183 / 8.18 | 3D network visualization |
| **Auth** | jose + bcryptjs | 6.x / 3.x | JWT tokens + password hashing |
| **Icons** | Lucide React | 0.575 | Icon library |
| **AI** | Google Generative AI | 0.24.1 | Optional AI integration |
| **Fonts** | Playfair Display, Noto Sans Thai, Prompt, JetBrains Mono | Google Fonts | Typography |

---

## 3. Project Structure

```
PatompongWebsite/
├── prisma/
│   ├── schema.prisma          # Database schema definition
│   └── dev.db                 # SQLite database file
├── public/
│   ├── logo-main.png          # Main brand logo
│   └── ...                    # Static assets
├── temp_photos/               # Local photo storage (by category)
│   ├── 01_CCTV_Surveillance/  # ~34 photos
│   ├── 02_Network_Server/
│   ├── 03_Wireless_Antenna/
│   ├── 04_Fiber_Optic_Cabling/
│   ├── 05_Broadcasting_AV/
│   ├── 06_Field_Operations/
│   └── 07_Drone_Survey/
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── layout.tsx         # Root layout (fonts, metadata, SEO)
│   │   ├── page.tsx           # Main public page
│   │   ├── globals.css        # Global styles + Tailwind
│   │   ├── admin/
│   │   │   ├── login/         # Admin login page + actions
│   │   │   └── (protected)/   # Auth-guarded admin routes
│   │   │       ├── layout.tsx # Session check → redirect if not auth'd
│   │   │       ├── page.tsx   # Admin dashboard entry
│   │   │       ├── actions.ts # All server actions (CRUD)
│   │   │       └── dashboard/
│   │   ├── api/
│   │   │   ├── local-photos/  # Serve temp_photos via HTTP
│   │   │   ├── upload/        # File upload endpoint
│   │   │   ├── portfolio-upload/ # Portfolio image upload
│   │   │   └── seed-gallery/  # Gallery DB seed (dev only)
│   │   └── share/             # Public share pages (/share/[slug])
│   ├── actions/
│   │   ├── galleryDb.ts       # Gallery CRUD + sync from disk
│   │   └── gallery.ts         # Cached gallery fetch for public
│   ├── components/
│   │   ├── Navbar.tsx          # Navigation bar with logo
│   │   ├── HeroSection.tsx     # Hero banner with featured photos
│   │   ├── HeroCarousel.tsx    # Photo carousel
│   │   ├── StatsBar.tsx        # Statistics counter
│   │   ├── ServicesSection.tsx  # Services offered
│   │   ├── WorkProcessSection.tsx
│   │   ├── CinematicGallery.tsx # Photo gallery with modal viewer
│   │   ├── PortfolioSection.tsx # Featured portfolio on main page
│   │   ├── TimelineSection.tsx  # Public timeline (filtered by isPublic)
│   │   ├── TimelineClient.tsx   # Client-side timeline rendering
│   │   ├── EducationSection.tsx # Qualifications & certifications
│   │   ├── CCTVDetailSection.tsx
│   │   ├── ContactSection.tsx   # Contact form
│   │   ├── Footer.tsx
│   │   ├── Network3D.tsx        # Three.js network visualization
│   │   ├── AdminDashboard.tsx   # Main admin dashboard component
│   │   └── admin/
│   │       ├── GalleryManager.tsx    # Photo management + sync
│   │       ├── PortfolioManager.tsx  # Portfolio CRUD + featured toggle
│   │       ├── TimelineManager.tsx   # Timeline CRUD + public toggle
│   │       ├── QuotationManager.tsx  # Invoice/quotation generator
│   │       ├── ReportGenerator.tsx   # Multi-format report generator
│   │       ├── FileUploader.tsx      # Reusable file upload widget
│   │       └── PortfolioUploader.tsx # Photo upload with auto-processing
│   ├── lib/
│   │   ├── prisma.ts           # Singleton Prisma client
│   │   └── auth.ts             # JWT auth utilities
│   ├── proxy.ts                # Request proxy (rate limiting, security)
│   └── types/
│       └── gallery.ts          # Gallery type definitions
├── package.json
├── next.config.ts
├── tsconfig.json
└── .env.local                 # Environment variables (secrets)
```

---

## 4. Database Schema

```prisma
model GalleryPhoto {
  id          String   @id @default(cuid())
  url         String
  category    String   @default("Uncategorized")
  description String?
  isHidden    Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model PortfolioProject {
  id          String       @id @default(cuid())
  title       String
  description String?
  url         String?
  imageUrl    String?
  tags        String?          // Comma-separated
  isFeatured  Boolean      @default(false)  // Show on main website
  shareSlug   String?      @unique
  attachments Attachment[]
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
}

model TimelineEvent {
  id          String       @id @default(cuid())
  title       String
  description String?
  date        DateTime
  category    String       // Training, Development, Event, etc.
  imageUrl    String?
  location    String?
  isPublic    Boolean      @default(false)  // Show on main website
  shareSlug   String?      @unique
  attachments Attachment[]
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
}

model Attachment {
  id          String            @id @default(cuid())
  filename    String
  url         String
  fileType    String            // image, document, video
  fileSize    Int?
  portfolioId String?
  timelineId  String?
  portfolio   PortfolioProject? @relation(...)
  timeline    TimelineEvent?    @relation(...)
  createdAt   DateTime          @default(now())
}
```

### Entity Relationships
```
PortfolioProject 1──M Attachment
TimelineEvent    1──M Attachment
```

---

## 5. Authentication & Security

### Authentication Flow
```
[User] → POST /admin/login
  → loginAction() validates credentials
  → bcrypt.compareSync() (constant-time)
  → createSession() → JWT token (HS256, 2hr expiry)
  → Set HttpOnly cookie "admin_session"
  → Redirect to /admin

[Admin Pages] → (protected)/layout.tsx
  → getSession() → reads cookie
  → jwtVerify() → validates JWT
  → If invalid → redirect to /admin/login
```

### Security Features
| Feature | Implementation |
|---------|---------------|
| **Password Storage** | bcrypt hashed (cost factor 10) |
| **Session Tokens** | JWT (HS256) with 2-hour expiration, unique JTI |
| **Cookie Security** | HttpOnly, Secure (production), SameSite=strict |
| **Rate Limiting** | In-memory: Login 5/min, Upload 20/min per IP |
| **Path Traversal** | Block `..` and `//` in URLs |
| **Upload Protection** | Session verification required for all uploads |
| **Username Enumeration** | Dummy bcrypt compare on unknown usernames |
| **Request IDs** | UUID per request via X-Request-Id header |

### Environment Variables (`.env.local`)
```
ADMIN_JWT_SECRET=        # 32+ char secret for JWT signing
ADMIN_USERNAME=          # Primary admin username
ADMIN_PASSWORD_HASH=     # bcrypt hash of primary admin password
SECONDARY_ADMIN_USERNAME=
SECONDARY_ADMIN_PASSWORD_HASH=
```

### ⚠️ Security Considerations for Production
1. **MUST** change `ADMIN_JWT_SECRET` from fallback default
2. **MUST** set strong bcrypt-hashed passwords via env vars
3. Rate limiting is in-memory — resets on server restart; consider Redis for production
4. No CSRF tokens implemented yet (mitigated by SameSite cookies)
5. SQLite is file-based — secure file permissions on server
6. `seed-gallery` API blocked in production mode

---

## 6. Server Actions (API)

All server actions are defined in `src/app/admin/(protected)/actions.ts`:

### Portfolio Actions
| Action | Parameters | Description |
|--------|-----------|-------------|
| `getPortfolioProjects()` | — | Fetch all projects with attachments |
| `createPortfolioProject(formData)` | title, description, url, imageUrl, tags | Create new project |
| `deletePortfolioProject(id)` | string | Delete project + cascade attachments |
| `togglePortfolioFeatured(id)` | string | Toggle `isFeatured` (show/hide on main page) |
| `generatePortfolioShareLink(id)` | string | Generate unique public share URL |

### Timeline Actions
| Action | Parameters | Description |
|--------|-----------|-------------|
| `getTimelineEvents()` | — | Fetch all events with attachments |
| `createTimelineEvent(formData)` | title, date, category, description, location, imageUrl | Create event |
| `deleteTimelineEvent(id)` | string | Delete event + cascade attachments |
| `toggleTimelinePublic(id)` | string | Toggle `isPublic` (show/hide on main page) |
| `generateTimelineShareLink(id)` | string | Generate unique public share URL |

### Attachment Actions
| Action | Parameters | Description |
|--------|-----------|-------------|
| `addAttachment(data)` | parentType, parentId, filename, url, fileType, fileSize | Attach file |
| `deleteAttachment(id)` | string | Remove attachment |

### Gallery Actions (`src/actions/galleryDb.ts`)
| Action | Description |
|--------|-------------|
| `syncGalleryFromDisk()` | Scan `temp_photos/` folders, create GalleryPhoto records |
| `getSavedPhotos()` | Fetch all photos from DB |
| `savePhotoMetadata(data)` | Upsert photo metadata (category, description, visibility) |
| `togglePhotoVisibility(id, isHidden)` | Show/hide photo on public site |
| `deletePortfolioPhoto(id)` | Delete photo record from DB |

### System Actions
| Action | Description |
|--------|-------------|
| `getSystemStats()` | OS info, Node version, RAM usage, storage usage |
| `getSharedItem(slug)` | Fetch shared portfolio/timeline item by slug |

---

## 7. Public Website Architecture

### Page Sections (rendered in order in `page.tsx`)
```
Navbar                    ← Fixed top navigation
HeroSection               ← Hero banner + featured photos carousel
StatsBar                  ← Animated statistics
CinematicGalleryWrapper   ← Photo gallery with categories + modal
ServicesSection            ← CCTV, Network, Software services
WorkProcessSection        ← 4-step work process
PortfolioSection          ← Featured projects (isFeatured=true only)
TimelineSection           ← Public events (isPublic=true only)
CCTVDetailSection         ← CCTV-specific details
ContactSection            ← Contact form
Footer
FloatingAction            ← Floating action buttons
SideDotNav                ← Side navigation dots
```

### Visibility Control Logic
- **PortfolioSection**: Only shows projects where `isFeatured = true`
- **TimelineSection**: Only shows events where `isPublic = true`
- **GalleryPhoto**: Only shows photos where `isHidden = false`
- If no items match → section returns `null` (auto-hides)

### Photo Serving Pipeline
```
temp_photos/01_CCTV_Surveillance/photo.jpg
  → /api/local-photos/01_CCTV_Surveillance/photo.jpg
  → GalleryPhoto record in DB (via syncGalleryFromDisk)
  → CinematicGallery renders from DB
```

---

## 8. Admin Panel Architecture

### Access: `http://localhost:3000/admin/login`

### Dashboard Tabs
1. **Dashboard** — System stats, storage tracker, quick links
2. **รูปภาพ (Gallery)** — Photo management with sync from disk
3. **ผลงาน/ระบบ (Portfolio)** — Project CRUD + featured toggle
4. **ไทม์ไลน์ (Timeline)** — Event CRUD + public toggle
5. **ใบเสนอราคา (Quotation)** — Invoice generator with PDF export
6. **รายงาน (Reports)** — Multi-format report generator

### Admin Dashboard Features
- **Real-time System Stats** — RAM, storage, Node.js version (auto-refresh 30s)
- **Storage Capacity Tracker** — Progress bar with color-coded warnings
- **isFeatured Toggle** — Eye icon button controls main page visibility
- **isPublic Toggle** — Same for timeline events
- **File Attachments** — Upload and attach files to portfolio/timeline items
- **Share Links** — Generate unique public URLs for individual items
- **Sync from Disk** — Button to populate DB from `temp_photos/` folder

### Report Types
| Type | Content |
|------|---------|
| **สรุปผู้บริหาร (Executive)** | Stats + Security + Portfolio + Timeline + Tech Stack |
| **รายงานผลงาน (Portfolio)** | Detailed portfolio list with descriptions + tags |
| **รายงานกิจกรรม (Timeline)** | Training/event history with dates + locations |
| **รายงานระบบ (System)** | Server stats + storage breakdown + tech stack |

All reports support **print/PDF export** via `window.print()`.

### Quotation System
- Form-based invoice creation
- Real-time preview (WYSIWYG)
- Thai Baht text conversion (`numberToThaiText`)
- Company logo in header (`/logo-main.png`)
- VAT calculation (configurable %)
- Print/PDF export

---

## 9. Data Flow Diagrams

### Photo Upload Flow
```
[Admin] → PortfolioUploader widget
  → Client-side processing (resize, WebP, EXIF rotate)
  → POST /api/portfolio-upload (or /api/upload)
  → Save file to temp_photos/ or external
  → Create GalleryPhoto record in DB
  → Revalidate paths
```

### Gallery Sync Flow
```
[Admin] clicks "ซิงค์จาก Disk"
  → syncGalleryFromDisk()
  → Scan temp_photos/ subdirectories
  → For each image file:
    → Generate stable ID: local-{folder}-{filename}
    → Generate URL: /api/local-photos/{folder}/{filename}
    → Map folder name → category (CCTV & Security, etc.)
    → Upsert to GalleryPhoto table
  → Return count of synced/skipped
```

### Share Link Flow
```
[Admin] clicks Share icon
  → generatePortfolioShareLink(id) or generateTimelineShareLink(id)
  → Generate slug: portfolio-{id8}-{timestamp36}
  → Save slug to DB
  → Copy URL to clipboard: /share/{slug}

[Public User] visits /share/{slug}
  → getSharedItem(slug)
  → Try PortfolioProject.findUnique({shareSlug: slug})
  → If not found, try TimelineEvent.findUnique({shareSlug: slug})
  → Render shared item page
```

---

## 10. Deployment

### Development
```bash
npm install
npx prisma db push        # Apply schema to SQLite
npx prisma generate        # Generate Prisma client
npm run dev                # Start dev server (Turbopack)
```

### Production Build
```bash
npm run build              # Next.js production build
npm run start              # Start production server
```

### Storage Constraints
- SQLite DB: `prisma/dev.db` (embedded, file-based)
- Photo storage: `temp_photos/` (local filesystem)
- GitHub repo soft limit: **1 GB** — tracked in admin dashboard
- Recommended: Move photos to cloud storage (Cloudinary/S3) for production

### Environment Requirements
- Node.js 20+ (LTS recommended)
- npm 10+
- Disk space for photos (~500MB+ depending on portfolio size)

---

## 11. Known Limitations & Technical Debt

| Item | Severity | Description | Recommendation |
|------|----------|-------------|----------------|
| SQLite | Medium | Single-file DB, no concurrent writes, no cloud backup | Migrate to PostgreSQL for production |
| In-memory Rate Limiting | Medium | Resets on server restart | Use Redis/Upstash for persistent rate limiting |
| No CSRF Protection | Low | Mitigated by SameSite cookies | Add CSRF tokens for form submissions |
| Local Photo Storage | High | Photos stored in repo → bloats Git | Migrate to Cloudinary/S3/Supabase Storage |
| No Image CDN | Medium | Images served directly from Node.js | Use Cloudinary or Vercel Image Optimization |
| No Backup System | High | DB and photos have no automated backup | Implement scheduled backups |
| Single Server | Medium | No horizontal scaling | Deploy to Vercel/Railway with managed DB |
| No Search | Low | No full-text search on portfolio/timeline | Add search with SQLite FTS or Algolia |
| No i18n | Low | Thai-only interface | Add English support if needed |
| Prisma 5.x | Low | Newer version 7.x available | Upgrade when stable |

---

## 12. Recommended Improvements (Portfolio Repository)

### Priority 1 — Data Integrity & Backup
1. **Automated DB Backup** — Schedule daily SQLite backup to cloud storage
2. **Photo Cloud Migration** — Move `temp_photos/` to Cloudinary or S3
3. **PostgreSQL Migration** — For concurrent access and better scalability

### Priority 2 — Portfolio Features
4. **Project Categorization** — Add category field to PortfolioProject (e.g., CCTV, Network, Software)
5. **Before/After Photos** — Support paired images for installation projects
6. **Client Testimonials** — New model for client reviews linked to projects
7. **Project Status Tracking** — Add status field (Planning, In Progress, Completed, Maintenance)
8. **Cost/Revenue Tracking** — Private financial data per project (admin only)
9. **Full-text Search** — Search across portfolio titles, descriptions, tags

### Priority 3 — Admin Enhancements
10. **Bulk Operations** — Select multiple items for batch show/hide/delete
11. **Drag & Drop Ordering** — Custom sort order for portfolio/timeline
12. **Draft Mode** — Save items as draft before publishing
13. **Activity Log** — Track admin actions (who did what, when)
14. **Multi-user Roles** — Admin, Editor, Viewer roles with permissions
15. **Dashboard Charts** — Visual graphs for portfolio growth, storage usage over time

### Priority 4 — Public Website
16. **Portfolio Filtering** — Filter by category, technology, year on public page
17. **Related Projects** — Show similar projects based on tags
18. **PDF Portfolio Export** — Generate downloadable PDF portfolio for clients
19. **QR Code Generation** — QR codes for share links on printed materials
20. **SEO Optimization** — Dynamic meta tags per shared portfolio/timeline item

---

## 13. File-Level Reference

### Critical Files (ต้องระวังเป็นพิเศษเมื่อแก้ไข)
| File | Risk | Description |
|------|------|-------------|
| `src/lib/auth.ts` | 🔴 HIGH | Authentication logic — ห้ามแก้ไขโดยไม่เข้าใจ JWT |
| `src/proxy.ts` | 🔴 HIGH | Security middleware — rate limiting, path protection |
| `prisma/schema.prisma` | 🟡 MEDIUM | DB schema — changes require migration |
| `prisma/dev.db` | 🔴 HIGH | Live database — NEVER delete without backup |
| `src/app/admin/(protected)/actions.ts` | 🟡 MEDIUM | All server actions — test after changes |
| `.env.local` | 🔴 HIGH | Secrets — NEVER commit to Git |

### Safe to Modify
| File | Description |
|------|-------------|
| `src/components/*.tsx` | UI components — visual changes only |
| `src/app/page.tsx` | Main page section ordering |
| `src/app/globals.css` | Styling |
| `tailwind.config.ts` | Theme configuration |
| `public/*` | Static assets |

---

## 14. Glossary

| Term | Description |
|------|-------------|
| **Server Action** | Next.js function that runs on the server, called from client components |
| **App Router** | Next.js routing system using file-system based routing |
| **Server Component** | React component that renders on the server (default in Next.js 13+) |
| **Client Component** | React component marked with `"use client"` that runs in the browser |
| **Prisma** | Type-safe ORM for database access |
| **JWT** | JSON Web Token — stateless authentication token |
| **bcrypt** | Password hashing algorithm with built-in salt |
| **Turbopack** | Next.js bundler for fast development builds |
| **Share Slug** | Unique URL-safe identifier for public sharing |
| **isFeatured** | Boolean flag controlling portfolio visibility on main page |
| **isPublic** | Boolean flag controlling timeline visibility on main page |

---

## 15. Contact for Technical Support

- **Developer Environment:** Windsurf IDE with Cascade AI
- **Repository:** GitHub (private)
- **Database:** SQLite at `prisma/dev.db`
- **Admin URL:** `http://localhost:3000/admin/login`

---

*เอกสารนี้จัดทำขึ้นเพื่อนำไปปรึกษาผู้เชี่ยวชาญเฉพาะทาง สามารถแก้ไขเพิ่มเติมได้ตามความเหมาะสม*
