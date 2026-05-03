# Acquisitions API

API Node.js (Express), PostgreSQL, Drizzle, auth JWT (cookie HTTP-only).

Les routes métier sont sous **`/api/v1`** (ex. `POST /api/v1/auth/signup`, `GET /api/v1/users`). `GET /api` renvoie `version` et `basePath` ; `GET /api/health` reste disponible sans version pour les sondes.

## Prérequis

- Node.js 20+
- Docker **Compose v2.24+** (fichier `.env.development` optionnel en dev)
- PostgreSQL 16+ (local, Docker, ou managé)
- Fichiers d’environnement (voir ci-dessous)

## Variables d’environnement

| Variable | Rôle |
|----------|------|
| `DATABASE_URL` | Connexion PostgreSQL (`postgresql://…`) |
| `JWT_SECRET` | Clé de signature des JWT |
| `JWT_EXPIRES_IN` | Durée du token (ex. `1d`) |
| `PORT` | Port HTTP (défaut `3001`) |
| `NODE_ENV` | `development` ou `production` |
| `LOG_LEVEL` | Niveau Winston (ex. `info`) |
| `AUTO_MIGRATE` | Optionnel : `0` ou `false` pour **ne pas** exécuter les migrations au démarrage du serveur (par défaut : migrations appliquées au boot, sauf si `NODE_ENV=test`) |

Aucune URL ni secret ne doit être codé en dur dans le code : tout passe par l’environnement.

---

## Rôles et RBAC

| Rôle | Signup public | Usage |
|------|----------------|--------|
| `user` | Oui (défaut) | Membre standard |
| `admin` | Oui (corps de requête) | Administrateur (ex. tontine) |
| `super_admin` | **Non** | Plateforme globale — création **hors** `POST /api/v1/auth/signup` |

Constantes : [`src/constants/roles.js`](src/constants/roles.js).

**Middleware** (après `requireAuth`) :

- `requireAdmin` — autorise `admin` **et** `super_admin`.
- `requireSuperAdmin` — autorise uniquement `super_admin`.

Exemple de route réservée aux super admins : `router.get('/platform/…', requireAuth, requireSuperAdmin, handler)`.

### Créer un premier `super_admin`

1. Créer un compte classique (signup) ou utiliser un utilisateur existant (noter son `id` ou `email`).
2. En base : `UPDATE users SET role = 'super_admin' WHERE email = 'ton@email.com';`
3. Se déconnecter / se reconnecter pour obtenir un JWT contenant le nouveau rôle.

Pour un nouvel utilisateur **sans** passer par l’API, insérer une ligne avec mot de passe **hashé** (bcrypt) — le plus simple reste signup puis `UPDATE` du rôle.

---

## Développement local avec Docker (Postgres + API)

Le fichier `docker-compose.dev.yml` lance :

1. **postgres** — PostgreSQL 16 (volume persistant `pg_dev_data`)
2. **app** — image cible `development` (`npm run dev` + rechargement via montage de `./src`)

### Démarrage

Compose charge d’abord **`.env.development.example`** (versionné), puis **`.env.development`** s’il existe (secrets locaux, optionnel).

```bash
# Optionnel : cp .env.development.example .env.development puis personnaliser
docker compose -f docker-compose.dev.yml up --build
```

**Équivalent npm** (préparation une fois : `npm run setup:docker`) :

```bash
npm run setup:docker   # chmod + scripts, copie .env.development si absent
npm run dev:docker     # Postgres + migrations + API (voir script/dev.sh)
```

L’API écoute sur `http://localhost:3001` (ou `APP_PORT` si tu l’exportes).  
`DATABASE_URL` est **définie par Compose** pour pointer vers le service `postgres` (hostname interne : `postgres`, port `5432`).

### Migrations Drizzle (depuis ta machine, Postgres exposé en 5432)

```bash
export DATABASE_URL=postgresql://acquisitions:acquisitions_dev@localhost:5432/acquisitions
npm run db:migrate
```

(Identifiants alignés sur les valeurs par défaut du compose ; adapte si tu as changé `POSTGRES_*`.)

### Développement sans Docker

Lance Postgres comme tu veux, puis :

```bash
cp .env.development.example .env.development
# Définir DATABASE_URL=postgresql://…@localhost:5432/…
npm install
npm run dev
```

---

## Production avec Docker (API seule + Postgres externe)

En production, **PostgreSQL n’est pas dans ce compose** : tu utilises une base managée ou un serveur dédié (ex. Contabo). Seule l’application tourne dans le conteneur.

### Déploiement

Le fichier **`.env.production` est obligatoire** (non versionné).

```bash
npm run setup:docker:prod
# Si le fichier vient d’être créé : éditer .env.production, puis relancer setup:docker:prod (vérif) ou passer directement aux migrations + prod:docker

# Migrations vers la base de prod (depuis une machine avec drizzle-kit et .env.production rempli) :
set -a && source .env.production && set +a && npm run db:migrate

npm run prod:docker
```

Équivalent manuel : `docker compose -f docker-compose.prod.yml up --build -d`.

`docker-compose.prod.yml` charge **uniquement** `.env.production` et démarre le service `app` (image cible `production`, `npm run start`).

### Migrations

Au **démarrage du serveur** (`npm run dev`, `npm start`, conteneur prod), les migrations SQL sous `drizzle/` sont appliquées automatiquement via Drizzle (sauf `NODE_ENV=test` ou si `AUTO_MIGRATE=0` / `false`). Tu peux toujours lancer **`npm run db:migrate`** à la main (même effet). L’image Docker de **production** inclut le dossier `drizzle/` mais pas `drizzle-kit` ; en multi-réplicas, prévoir un job de migration unique ou désactiver le boot migrate avec `AUTO_MIGRATE=false` et migrer en CI.

---

## Bascule dev / prod

| Environnement | Fichier env | `DATABASE_URL` |
|---------------|-------------|----------------|
| Docker dev | `.env.development` + compose | Injectée par `docker-compose.dev.yml` vers `postgres:5432` |
| Local sans Docker | `.env.development` | `localhost` ou ton host Postgres |
| Production | `.env.production` | URL complète vers ton Postgres de prod |

Le code lit toujours `process.env.DATABASE_URL` via `src/configs/database.js` ; seul le **fournisseur de variables** change.

---

## Tests

- `npm test` — Jest (ESM + `supertest`). `jest.setup.mjs` charge `.env` pour `DATABASE_URL`.
- [`tests/integration/app.integration.test.js`](tests/integration/app.integration.test.js) — santé + 404 (sans DB requise pour la logique HTTP).
- [`tests/integration/users.integration.test.js`](tests/integration/users.integration.test.js) — CRUD `/api/v1/users` avec une vraie base : **ignoré** (`describe.skip`) si `DATABASE_URL` est absent. Après les suites, `jest.teardown.mjs` ferme le pool Postgres pour que Jest quitte proprement.

---

## Fichiers utiles

| Fichier | Rôle |
|---------|------|
| `Dockerfile` | Stages `development` et `production` |
| `docker-compose.dev.yml` | Postgres local + app dev |
| `docker-compose.prod.yml` | App prod seule |
| `script/dev.sh` | Orchestration dev Docker |
| `script/prod.sh` | Orchestration prod Docker |
| `script/setup-docker.sh` / `setup-docker-prod.sh` | Préparation des env locaux |
| `.env.development.example` | Modèle dev |
| `.env.production.example` | Modèle prod |

---

## Scripts npm

| Script | Description |
|--------|-------------|
| `npm run dev` | Serveur avec `--watch` |
| `npm start` | Serveur prod (utilisé par l’image Docker prod) |
| `npm run setup:docker` | Prépare le dev Docker (`.env.development`, permissions) |
| `npm run dev:docker` | Postgres + migrations + API dev (`script/dev.sh`) |
| `npm run setup:docker:prod` | Prépare la prod Docker (`.env.production` depuis l’exemple) |
| `npm run prod:docker` | Build + démarrage conteneur prod (`script/prod.sh`) |
| `npm run db:migrate` | Migrations Drizzle |
| `npm run db:generate` | Générer des migrations |
