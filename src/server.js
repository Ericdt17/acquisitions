import app from './app.js';
import { runMigrationsIfEnabled } from './configs/run-migrations.js';

const PORT = process.env.PORT || 3001;

async function start() {
  await runMigrationsIfEnabled();
  app.listen(PORT, () => {
    console.log(`Listening on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
