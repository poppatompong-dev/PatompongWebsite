# 📚 Implementation Guide - Portfolio Projects System

**เว็บไซต์:** Next.js 16 + Turbopack
**Database:** SQLite + Prisma ORM
**Date:** March 11, 2026
**Total Projects:** 33

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Setup Instructions](#setup-instructions)
3. [Database Schema](#database-schema)
4. [API Endpoints](#api-endpoints)
5. [Data Structure](#data-structure)
6. [Usage Examples](#usage-examples)
7. [File Descriptions](#file-descriptions)

---

## Overview

This implementation provides a complete portfolio project management system with:

- **33 Projects** organized by type, category, and client
- **3 Clients** (Municipalities)
- **5 Categories** for project classification
- **Complete Metadata** with tags, keywords, and descriptions
- **RESTful API** endpoints for data access
- **Prisma ORM** for type-safe database operations
- **Search & Filter** capabilities

### Key Features

✅ **Structured Data** - 33 projects with complete metadata
✅ **Multiple Categories** - Mapping, Database, Analytics, Web, Automation
✅ **Client Management** - Track projects by municipality
✅ **Tags & Keywords** - Thai and categorized keywords
✅ **Status Tracking** - Project completion status
✅ **Date Management** - Start and completion dates
✅ **SEO Friendly** - URL slugs for all projects and clients

---

## Setup Instructions

### Step 1: Install Prisma CLI (if not already installed)

```bash
npm install -D prisma @prisma/client
```

### Step 2: Copy the Schema

Copy the `prisma.schema` file to your project:

```bash
cp prisma.schema ./prisma/schema.prisma
```

### Step 3: Copy the JSON Data

Copy `projects_optimized.json` to your `prisma` folder:

```bash
cp projects_optimized.json ./prisma/projects_optimized.json
```

### Step 4: Initialize Database

```bash
npx prisma migrate dev --name init
```

This will:
- Create SQLite database
- Run migrations
- Generate Prisma Client

### Step 5: Run Seed Script

Update your `package.json` to include seed configuration:

```json
{
  "prisma": {
    "seed": "node prisma/seed.js"
  }
}
```

Then run:

```bash
npx prisma db seed
```

Or run seed script directly:

```bash
node prisma/seed.js
```

### Step 6: Verify Setup

Check if data was imported successfully:

```bash
npx prisma studio
```

This opens a visual database browser at `http://localhost:5555`

---

## Database Schema

### Models Overview

#### 1. **Client**
```
- id (String, unique ID)
- clientId (String, unique reference)
- clientName (String)
- slug (String, unique URL-friendly)
- projectCount (Int)
- projects (Relation to Project)
```

#### 2. **Category**
```
- id (String, unique ID)
- categoryId (String, unique reference)
- name (String)
- projectCount (Int)
- color (String, hex color)
- projects (Relation to Project)
```

#### 3. **Project** (Main Model)
```
- id (String, unique ID)
- projectId (String, unique reference)
- projectNumber (Int)
- projectName (String)
- slug (String, unique URL-friendly)
- clientId (String, foreign key)
- type (String) - Google Earth Map, AppSheet, etc.
- categoryId (String, foreign key)
- subcategory (String)
- url (String, optional)
- description (String, text)
- tags (String, JSON array)
- keywords (String, JSON array)
- status (String) - completed, in_progress, planning
- startDate (DateTime, optional)
- completedDate (DateTime, optional)
- timestamps (createdAt, updatedAt)
```

#### 4. **PortfolioMetadata**
```
- owner (String)
- position (String)
- startDate (DateTime)
- description (String)
- totalProjects (Int)
- timestamps
```

#### 5. **ProjectStatistics**
```
- totalProjects (Int)
- byType (JSON)
- byCategory (JSON)
- byClient (JSON)
- byStatus (JSON)
```

---

## API Endpoints

### Base URL
```
http://localhost:3000/api
```

### Endpoints

#### 1. **Get All Projects**
```
GET /projects
```

**Query Parameters:**
- `clientId` - Filter by client ID
- `categoryId` - Filter by category ID
- `type` - Filter by project type
- `status` - Filter by status
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

**Example:**
```bash
GET /api/projects?clientId=client_002&categoryId=cat_web&page=1&limit=20
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "projectId": "proj_001",
      "projectName": "กล้อง (CCTV)",
      "slug": "cctv-installation",
      "client": { ... },
      "category": { ... },
      ...
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 33,
    "pages": 4
  }
}
```

#### 2. **Get Single Project**
```
GET /projects/[id]
```

**Example:**
```bash
GET /api/projects/proj_001
```

#### 3. **Create Project**
```
POST /projects
```

**Body:**
```json
{
  "projectId": "proj_034",
  "projectNumber": 34,
  "projectName": "New Project",
  "slug": "new-project",
  "clientId": "client_001",
  "type": "React/Netlify",
  "categoryId": "cat_web",
  "subcategory": "Web Application",
  "url": "https://example.com",
  "description": "Project description",
  "tags": ["react", "web"],
  "keywords": ["keyword1", "keyword2"],
  "status": "completed"
}
```

#### 4. **Update Project**
```
PUT /projects/[id]
```

#### 5. **Delete Project**
```
DELETE /projects/[id]
```

#### 6. **Get All Clients**
```
GET /clients
```

#### 7. **Get All Categories**
```
GET /categories
```

#### 8. **Get Statistics**
```
GET /statistics
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalProjects": 33,
    "clientCount": 3,
    "categoryCount": 5,
    "byType": {
      "Google Earth Map": 5,
      "AppSheet": 8,
      ...
    },
    "byCategory": {
      "Mapping & Location": 5,
      ...
    },
    "byClient": {
      "เทศบาลตำบลบ้านคลอง": 15,
      ...
    }
  }
}
```

#### 9. **Search Projects**
```
GET /search?q=keyword
```

**Example:**
```bash
GET /api/search?q=dashboard
```

---

## Data Structure

### Clients (3 Total)
```
1. เทศบาลตำบลบ้านคลอง (15 projects)
2. เทศบาลเมืองอุทัยธานี (17 projects)
3. เทศบาลนคร (1 project)
```

### Categories (5 Total)
```
1. Mapping & Location (5 projects)
2. Database & Data Management (8 projects)
3. Analytics & Reporting (7 projects)
4. Web Applications (7 projects)
5. Automation & Integration (6 projects)
```

### Project Types
```
- Google Earth Map (5)
- AppSheet (8)
- Google Looker Studio (7)
- React/Netlify (3)
- React/Vercel (3)
- Google Apps Script (6)
- Firebase (1)
```

### Tags & Keywords
Each project includes:
- **Tags** - English categorization (e.g., "react", "database", "automation")
- **Keywords** - Thai terms (e.g., "ระบบ", "จัดการ", "ข้อมูล")

### Example Project Structure
```json
{
  "id": "proj_001",
  "projectNumber": 1,
  "projectName": "กล้อง (CCTV)",
  "slug": "cctv-installation",
  "client": "เทศบาลตำบลบ้านคลอง",
  "clientId": "client_001",
  "type": "Google Earth Map",
  "category": "Mapping & Location",
  "subcategory": "CCTV Management",
  "url": "https://earth.google.com/earth/d/...",
  "description": "จุดติดตั้งกล้องวงจรปิด",
  "tags": ["mapping", "CCTV", "location", "infrastructure"],
  "keywords": ["กล้อง", "วงจรปิด", "ติดตั้ง", "จุดตั้ง"],
  "status": "completed",
  "startDate": "2564-05-01",
  "completedDate": "2564-06-15"
}
```

---

## Usage Examples

### Example 1: Fetch Projects from a Specific Client

```typescript
// React Component Example
const [projects, setProjects] = useState([]);

useEffect(() => {
  fetch(`/api/projects?clientId=client_002`)
    .then(res => res.json())
    .then(data => setProjects(data.data))
    .catch(err => console.error(err));
}, []);

return (
  <div>
    {projects.map(project => (
      <div key={project.id}>
        <h3>{project.projectName}</h3>
        <p>{project.description}</p>
        <a href={project.url}>View Project</a>
      </div>
    ))}
  </div>
);
```

### Example 2: Fetch Projects by Category

```typescript
const response = await fetch(
  `/api/projects?categoryId=cat_web&limit=20`
);
const { data, pagination } = await response.json();
console.log(`Found ${pagination.total} web projects`);
```

### Example 3: Search Projects

```typescript
const searchQuery = 'dashboard';
const response = await fetch(`/api/search?q=${searchQuery}`);
const { data } = await response.json();
console.log(`Found ${data.length} results for "${searchQuery}"`);
```

### Example 4: Create New Project

```typescript
const newProject = {
  projectId: "proj_034",
  projectNumber: 34,
  projectName: "New Portfolio Project",
  slug: "new-portfolio-project",
  clientId: "client_002",
  type: "React/Vercel",
  categoryId: "cat_web",
  subcategory: "Web Application",
  url: "https://example.com",
  description: "New web application",
  tags: ["react", "vercel"],
  keywords: ["แอปพลิเคชัน", "เว็บ"]
};

const response = await fetch('/api/projects', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(newProject)
});

const result = await response.json();
console.log('Project created:', result.data);
```

### Example 5: Get Statistics

```typescript
const response = await fetch('/api/statistics');
const { data } = await response.json();

console.log(`Total Projects: ${data.totalProjects}`);
console.log(`Total Clients: ${data.clientCount}`);
console.log(`Total Categories: ${data.categoryCount}`);
console.log(`By Type:`, data.byType);
```

---

## File Descriptions

### 1. **projects_optimized.json**
- Complete project data with metadata
- Includes 33 projects with all details
- Ready for database import
- Contains statistics and client/category information

### 2. **prisma.schema**
- Prisma database schema
- Defines all database models
- Ready to use with SQLite
- Copy to `prisma/schema.prisma`

### 3. **seed.js**
- Database seed script
- Imports all data from JSON
- Creates clients, categories, and projects
- Run with `npx prisma db seed`

### 4. **api-endpoints.example.ts**
- Example API endpoint implementations
- TypeScript/Next.js format
- Copy functions to your `app/api/` routes
- Includes CRUD operations and search

### 5. **IMPLEMENTATION_GUIDE.md**
- This file
- Complete setup and usage documentation

---

## Quick Start Checklist

- [ ] Copy `prisma.schema` to `prisma/schema.prisma`
- [ ] Copy `projects_optimized.json` to `prisma/`
- [ ] Copy `seed.js` to `prisma/`
- [ ] Run `npx prisma migrate dev --name init`
- [ ] Run `npx prisma db seed`
- [ ] Copy API endpoints to `app/api/` routes
- [ ] Update your Next.js components to use the API
- [ ] Test with `npx prisma studio`

---

## Troubleshooting

### Issue: Database file already exists
**Solution:** Delete `.sqlite` and `.sqlite-journal` files and run migration again

### Issue: Seed script fails
**Solution:** Ensure `projects_optimized.json` is in the same directory as `seed.js`

### Issue: API endpoints not working
**Solution:** Ensure Prisma Client is generated: `npx prisma generate`

### Issue: Tags/Keywords appear as strings
**Solution:** Parse JSON when displaying: `JSON.parse(project.tags)`

---

## Next Steps

1. **Create UI Components** - Build portfolio display pages
2. **Add Authentication** - Protect edit endpoints
3. **Add Filters** - Create filter UI for projects
4. **Add Search** - Build search functionality
5. **Add Pagination** - Implement pagination UI
6. **Add Sorting** - Allow sorting by different fields
7. **Add Export** - Export projects to CSV/PDF

---

**Generated:** March 11, 2026
**System:** Next.js 16 + Turbopack + SQLite + Prisma ORM
**Contact:** Patompongtec Consultant
