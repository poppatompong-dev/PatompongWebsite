-- Database Query Examples for Portfolio System
-- Database: SQLite
-- These are direct SQL queries if you need to bypass Prisma ORM

-- ============================================
-- BASIC QUERIES
-- ============================================

-- 1. Get all projects with client and category information
SELECT
  p.projectId,
  p.projectNumber,
  p.projectName,
  p.description,
  p.url,
  c.clientName,
  cat.name as categoryName,
  p.type,
  p.status,
  p.startDate,
  p.completedDate
FROM "Project" p
LEFT JOIN "Client" c ON p.clientId = c.clientId
LEFT JOIN "Category" cat ON p.categoryId = cat.categoryId
ORDER BY p.projectNumber ASC;

-- 2. Get project count by client
SELECT
  c.clientName,
  c.clientId,
  COUNT(p.id) as projectCount
FROM "Client" c
LEFT JOIN "Project" p ON c.clientId = p.clientId
GROUP BY c.clientId
ORDER BY projectCount DESC;

-- 3. Get project count by category
SELECT
  cat.name,
  cat.categoryId,
  COUNT(p.id) as projectCount
FROM "Category" cat
LEFT JOIN "Project" p ON cat.categoryId = p.categoryId
GROUP BY cat.categoryId
ORDER BY projectCount DESC;

-- 4. Get project count by type
SELECT
  type,
  COUNT(*) as count
FROM "Project"
GROUP BY type
ORDER BY count DESC;

-- 5. Get all projects for a specific client
SELECT *
FROM "Project"
WHERE clientId = 'client_002'
ORDER BY projectNumber ASC;

-- 6. Get all projects in a specific category
SELECT *
FROM "Project"
WHERE categoryId = 'cat_web'
ORDER BY projectNumber ASC;

-- 7. Get completed projects only
SELECT *
FROM "Project"
WHERE status = 'completed'
ORDER BY completedDate DESC;

-- ============================================
-- SEARCH QUERIES
-- ============================================

-- 8. Search projects by name (case-insensitive)
SELECT *
FROM "Project"
WHERE projectName LIKE '%dashboard%'
   OR description LIKE '%dashboard%'
ORDER BY projectNumber ASC;

-- 9. Search projects by type
SELECT *
FROM "Project"
WHERE type LIKE '%React%'
ORDER BY projectNumber ASC;

-- 10. Full-text search in multiple fields
SELECT *
FROM "Project"
WHERE projectName LIKE '%ระบบ%'
   OR description LIKE '%ระบบ%'
   OR tags LIKE '%ระบบ%'
ORDER BY projectNumber ASC;

-- ============================================
-- STATISTICS QUERIES
-- ============================================

-- 11. Get summary statistics
SELECT
  COUNT(*) as totalProjects,
  COUNT(DISTINCT clientId) as totalClients,
  COUNT(DISTINCT categoryId) as totalCategories,
  COUNT(DISTINCT type) as totalTypes
FROM "Project";

-- 12. Get project completion statistics
SELECT
  status,
  COUNT(*) as count
FROM "Project"
GROUP BY status;

-- 13. Get average project duration (for completed projects)
SELECT
  ROUND(AVG(CAST((julianday(completedDate) - julianday(startDate)) AS FLOAT)), 2) as avgDaysToComplete
FROM "Project"
WHERE status = 'completed'
  AND completedDate IS NOT NULL
  AND startDate IS NOT NULL;

-- 14. Get projects completed by month
SELECT
  strftime('%Y-%m', completedDate) as month,
  COUNT(*) as projectsCompleted
FROM "Project"
WHERE status = 'completed'
GROUP BY month
ORDER BY month DESC;

-- ============================================
-- ADVANCED QUERIES
-- ============================================

-- 15. Get top clients by project count
SELECT
  c.clientName,
  COUNT(p.id) as projectCount
FROM "Client" c
LEFT JOIN "Project" p ON c.clientId = p.clientId
GROUP BY c.clientId
ORDER BY projectCount DESC
LIMIT 10;

-- 16. Get projects by client and category
SELECT
  c.clientName,
  cat.name as categoryName,
  COUNT(p.id) as projectCount
FROM "Client" c
LEFT JOIN "Project" p ON c.clientId = p.clientId
LEFT JOIN "Category" cat ON p.categoryId = cat.categoryId
GROUP BY c.clientId, p.categoryId
ORDER BY c.clientName, cat.name;

-- 17. Get projects grouped by type and status
SELECT
  type,
  status,
  COUNT(*) as count
FROM "Project"
GROUP BY type, status
ORDER BY type, status;

-- 18. Get projects with longest duration
SELECT
  projectName,
  startDate,
  completedDate,
  CAST((julianday(completedDate) - julianday(startDate)) AS INTEGER) as daysToComplete
FROM "Project"
WHERE status = 'completed'
  AND completedDate IS NOT NULL
  AND startDate IS NOT NULL
ORDER BY daysToComplete DESC
LIMIT 10;

-- 19. Get recent projects (last 30 days)
SELECT *
FROM "Project"
WHERE completedDate >= date('now', '-30 days')
ORDER BY completedDate DESC;

-- 20. Get projects by client and get their URLs
SELECT
  c.clientName,
  p.projectName,
  p.url,
  p.type
FROM "Client" c
LEFT JOIN "Project" p ON c.clientId = p.clientId
WHERE p.url IS NOT NULL
ORDER BY c.clientName, p.projectNumber;

-- ============================================
-- UPDATE QUERIES
-- ============================================

-- 21. Update project status
UPDATE "Project"
SET status = 'completed'
WHERE projectId = 'proj_001';

-- 22. Update project completion date
UPDATE "Project"
SET completedDate = '2026-03-11'
WHERE projectId = 'proj_001';

-- 23. Bulk update status for specific client projects
UPDATE "Project"
SET status = 'completed'
WHERE clientId = 'client_001';

-- 24. Update project description
UPDATE "Project"
SET description = 'Updated description'
WHERE projectId = 'proj_001';

-- ============================================
-- DATA INTEGRITY QUERIES
-- ============================================

-- 25. Check for orphaned projects (no client)
SELECT *
FROM "Project"
WHERE clientId NOT IN (SELECT clientId FROM "Client");

-- 26. Check for projects with missing categories
SELECT *
FROM "Project"
WHERE categoryId NOT IN (SELECT categoryId FROM "Category");

-- 27. Check for duplicate project numbers
SELECT projectNumber, COUNT(*) as count
FROM "Project"
GROUP BY projectNumber
HAVING count > 1;

-- 28. Check for projects with missing URLs
SELECT projectId, projectName
FROM "Project"
WHERE url IS NULL;

-- 29. Check for projects with missing descriptions
SELECT projectId, projectName
FROM "Project"
WHERE description IS NULL OR description = '';

-- 30. Find projects without tags
SELECT projectId, projectName
FROM "Project"
WHERE tags IS NULL OR tags = '';

-- ============================================
-- EXPORT QUERIES
-- ============================================

-- 31. Export all projects with details (for CSV)
SELECT
  p.projectNumber,
  p.projectName,
  c.clientName,
  p.type,
  cat.name as category,
  p.subcategory,
  p.status,
  strftime('%Y-%m-%d', p.startDate) as startDate,
  strftime('%Y-%m-%d', p.completedDate) as completedDate,
  p.url,
  p.description
FROM "Project" p
LEFT JOIN "Client" c ON p.clientId = c.clientId
LEFT JOIN "Category" cat ON p.categoryId = cat.categoryId
ORDER BY p.projectNumber;

-- 32. Export client summary
SELECT
  c.clientName,
  COUNT(p.id) as projectCount,
  GROUP_CONCAT(DISTINCT p.type) as projectTypes
FROM "Client" c
LEFT JOIN "Project" p ON c.clientId = p.clientId
GROUP BY c.clientId
ORDER BY c.clientName;

-- 33. Export category summary
SELECT
  cat.name as category,
  cat.color,
  COUNT(p.id) as projectCount,
  GROUP_CONCAT(DISTINCT p.type) as projectTypes
FROM "Category" cat
LEFT JOIN "Project" p ON cat.categoryId = p.categoryId
GROUP BY cat.categoryId
ORDER BY cat.name;

-- ============================================
-- MAINTENANCE QUERIES
-- ============================================

-- 34. Delete projects from specific client
DELETE FROM "Project"
WHERE clientId = 'client_001';

-- 35. Update statistics cache
INSERT OR REPLACE INTO "ProjectStatistics" (id, totalProjects, byType, byCategory, byClient, byStatus, lastUpdated)
SELECT
  'stat_1',
  COUNT(DISTINCT p.id),
  json_object('Google Earth Map', SUM(CASE WHEN p.type = 'Google Earth Map' THEN 1 ELSE 0 END)),
  json_object('Mapping & Location', SUM(CASE WHEN cat.categoryId = 'cat_mapping' THEN 1 ELSE 0 END)),
  json_object('Client', COUNT(DISTINCT p.clientId)),
  json_object('completed', SUM(CASE WHEN p.status = 'completed' THEN 1 ELSE 0 END)),
  datetime('now')
FROM "Project" p
LEFT JOIN "Category" cat ON p.categoryId = cat.categoryId;

-- 36. Get database size and stats
SELECT
  COUNT(*) as total_projects,
  COUNT(DISTINCT clientId) as total_clients,
  COUNT(DISTINCT categoryId) as total_categories
FROM "Project";

-- ============================================
-- TESTING QUERIES (for verification)
-- ============================================

-- 37. Verify all data types and constraints
SELECT
  p.projectId,
  p.projectNumber,
  p.projectName,
  p.clientId,
  p.categoryId,
  p.type,
  p.status,
  CASE
    WHEN p.startDate IS NULL THEN 'Missing startDate'
    WHEN p.completedDate IS NULL AND p.status = 'completed' THEN 'Completed but no date'
    ELSE 'OK'
  END as validation
FROM "Project" p
ORDER BY p.projectNumber;

-- 38. Count records in each table
SELECT
  'Client' as table_name,
  COUNT(*) as record_count
FROM "Client"
UNION ALL
SELECT 'Category', COUNT(*) FROM "Category"
UNION ALL
SELECT 'Project', COUNT(*) FROM "Project"
UNION ALL
SELECT 'PortfolioMetadata', COUNT(*) FROM "PortfolioMetadata"
UNION ALL
SELECT 'ProjectStatistics', COUNT(*) FROM "ProjectStatistics";

-- 39. Get oldest and newest projects
SELECT
  'Oldest' as type,
  projectName,
  startDate
FROM "Project"
WHERE startDate IS NOT NULL
ORDER BY startDate ASC
LIMIT 1
UNION ALL
SELECT
  'Newest',
  projectName,
  startDate
FROM "Project"
WHERE startDate IS NOT NULL
ORDER BY startDate DESC
LIMIT 1;

-- 40. Performance test - complex query
SELECT
  c.clientName,
  cat.name as category,
  p.type,
  COUNT(p.id) as projectCount,
  COUNT(CASE WHEN p.status = 'completed' THEN 1 END) as completedCount,
  COUNT(CASE WHEN p.status = 'in_progress' THEN 1 END) as inProgressCount
FROM "Client" c
CROSS JOIN "Category" cat
LEFT JOIN "Project" p ON c.clientId = p.clientId AND cat.categoryId = p.categoryId
GROUP BY c.clientId, cat.categoryId
ORDER BY c.clientName, cat.name;

-- ============================================
-- INDEX INFORMATION
-- ============================================

-- 41. List all indexes
SELECT name, tbl_name, sql
FROM sqlite_master
WHERE type = 'index'
ORDER BY tbl_name;

-- 42. Get query execution plan (for optimization)
EXPLAIN QUERY PLAN
SELECT *
FROM "Project" p
LEFT JOIN "Client" c ON p.clientId = c.clientId
WHERE c.clientId = 'client_002'
ORDER BY p.projectNumber;
