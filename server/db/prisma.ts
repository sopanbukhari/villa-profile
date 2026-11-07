import { db } from './jsonDb.js';

// Export JSON Database instance as default and named prisma export
// This allows zero-setup file-based persistence without requiring PostgreSQL connection strings
export const prisma = db as any;
export default prisma;
