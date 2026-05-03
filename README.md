# Acquisitions API

API Node.js (Express), PostgreSQL, Drizzle, auth JWT (cookie HTTP-only).

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

Aucune URL ni secret ne doit être codé en dur dans le code : tout passe par l’environnement.

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

Exécute `npm run db:migrate` (ou un job CI) avec `DATABASE_URL` pointant vers la base de **production**, **avant** ou selon ta stratégie de déploiement. L’image Docker de prod n’inclut pas `drizzle-kit` (dépendance de dev).

---

## Bascule dev / prod

| Environnement | Fichier env | `DATABASE_URL` |
|---------------|-------------|----------------|
| Docker dev | `.env.development` + compose | Injectée par `docker-compose.dev.yml` vers `postgres:5432` |
| Local sans Docker | `.env.development` | `localhost` ou ton host Postgres |
| Production | `.env.production` | URL complète vers ton Postgres de prod |

Le code lit toujours `process.env.DATABASE_URL` via `src/configs/database.js` ; seul le **fournisseur de variables** change.

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
