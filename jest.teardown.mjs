/** Close DB pool so Jest can exit (pg keeps sockets open otherwise). */
export default async function globalTeardown() {
  if (!process.env.DATABASE_URL) return;
  try {
    const { pool } = await import('./src/configs/database.js');
    await pool.end();
  } catch {
    // ignore
  }
}
