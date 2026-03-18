import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
try {
  const tables = await p.$queryRawUnsafe("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name");
  console.log('Tables:', tables.map(x => x.name).join(', '));
  const projects = await p.project.count();
  console.log('Projects count:', projects);
} catch(e) {
  console.error('Error:', e.message);
} finally {
  await p.$disconnect();
}
