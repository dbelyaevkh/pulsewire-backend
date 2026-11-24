# Pulsewire Backend

Pulsewire is a backend application built with NestJS.

## Requirements

- Node.js 22.23.4 (see [`.nvmrc`](.nvmrc))
- npm
- Docker Engine 20.10 or later, or Docker Desktop

## Local Development

### PostgreSQL

With Docker running, create the local PostgreSQL container once. Replace `YOUR_PASSWORD` with a local development password.

```sh
docker run -d \
    --name pulsewire-postgres \
    -e POSTGRES_DB=pulsewire \
    -e POSTGRES_USER=pulsewire_app \
    -e POSTGRES_PASSWORD='YOUR_PASSWORD' \
    -p 127.0.0.1:15432:5432 \
    -v pulsewire-postgres-data:/var/lib/postgresql/data \
    postgres:17
```

If the container already exists but is stopped, start it with `docker start pulsewire-postgres` or from Docker Desktop.

Verify that PostgreSQL is ready to accept connections:

```sh
docker exec pulsewire-postgres pg_isready \
    -U pulsewire_app \
    -d pulsewire
```

To stop and remove the container:

```sh
docker stop pulsewire-postgres
docker rm pulsewire-postgres
```

To also remove the local PostgreSQL data and start with a clean database:

```sh
docker volume rm pulsewire-postgres-data
```

Removing the volume permanently deletes all data stored in the local PostgreSQL database.

### MongoDB

With Docker running, create the local MongoDB container once. Replace `YOUR_PASSWORD` with a local development password.

```sh
docker run -d \
    --name pulsewire-mongo \
    -p 127.0.0.1:27017:27017 \
    -e MONGO_INITDB_ROOT_USERNAME=pulsewire \
    -e MONGO_INITDB_ROOT_PASSWORD='YOUR_PASSWORD' \
    -v pulsewire-mongo-data:/data/db \
    mongo:8
```

If the container already exists but is stopped, start it with `docker start pulsewire-mongo` or from Docker Desktop.

Verify that MongoDB is ready to accept connections:

```sh
docker exec pulsewire-mongo mongosh \
    --username pulsewire \
    --password 'YOUR_PASSWORD' \
    --authenticationDatabase admin \
    --eval 'db.runCommand({ ping: 1 })'
```

The command succeeds when its output contains `ok: 1`.

Use the following DSN to connect the application to the local MongoDB container:

```dotenv
MONGO_DSN=mongodb://pulsewire:YOUR_PASSWORD@127.0.0.1:27017/pulsewire?authSource=admin
```

The database name is `pulsewire`. The `authSource=admin` parameter is required because the root user created by the MongoDB image is stored in the `admin` database. Percent-encode reserved URL characters in the password, such as `@` as `%40` and `#` as `%23`.

To stop and remove the container:

```sh
docker stop pulsewire-mongo
docker rm pulsewire-mongo
```

To also remove the local MongoDB data and start with a clean database:

```sh
docker volume rm pulsewire-mongo-data
```

Removing the volume permanently deletes all data stored in the local MongoDB database. MongoDB migrations and seed data are not configured yet.

### Start the application

From the repository root, install dependencies and start the development server:

```sh
npm ci
cp -n .env.example .env
```

Edit `.env` and replace `YOUR_PASSWORD` in `POSTGRES_DSN` and `MONGO_DSN` with the corresponding container passwords. Percent-encode reserved URL characters in the passwords, such as `@` as `%40` and `#` as `%23`.

```sh
npm run start:dev
```

Alternatively, build the application and pass its configuration through command-line arguments:

```sh
npm run build && node dist/main.js --host=127.0.0.1 --port=4000 --app-name=pulsewire-backend --postgres-dsn=postgresql://pulsewire_app:YOUR_PASSWORD@127.0.0.1:15432/pulsewire --mongo-dsn='mongodb://pulsewire:YOUR_PASSWORD@127.0.0.1:27017/pulsewire?authSource=admin'
```

With the settings from `.env.example`, the server listens at <http://127.0.0.1:3000>. The CLI example uses port `4000`.

### API documentation

After starting the application, open [Swagger UI](http://127.0.0.1:3000/swagger) or download the [OpenAPI JSON](http://127.0.0.1:3000/swagger/openapi.json).

### Postman

1. In Postman, import [the Pulsewire API collection](postman/PulsewireAPI.postman_collection.json).
2. Open the collection's **Variables** tab and set `baseUrl` to
   `http://127.0.0.1:3000` without a trailing slash.
3. With the application running, send `GET {{baseUrl}}/health`.

To target a different server or port, change `baseUrl` in the collection.
For multiple servers, you can set `baseUrl` in each Postman environment and select
the environment you want to use. Keep tokens and passwords out of committed exports.

### PostgreSQL migrations

The migration command reads `POSTGRES_DSN` from the environment or `.env`. No migrations are registered yet.

```sh
npm run build
npm exec -- typeorm migration:run -d dist/database/postgres/data-source.js
```

### Run tests

Unit tests use [Vitest](https://vitest.dev).

Run all unit tests once:

```sh
npm test
```

Run tests in watch mode during development:

```sh
npm run test:watch
```

Run a specific test file:

```sh
npm test -- src/config/app.config.spec.ts
```

Run tests and generate a coverage report:

```sh
npm run test:cov
```

Before submitting changes, also run:

```sh
npm run lint
npm run build
```
