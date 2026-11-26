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

From the repository root, install dependencies and create a local environment file:

```sh
npm ci
cp -n .env.example .env
```

Edit `.env` and replace `YOUR_PASSWORD` in `POSTGRES_DSN` and `MONGO_DSN` with the corresponding container passwords. Percent-encode reserved URL characters in the passwords, such as `@` as `%40` and `#` as `%23`.

Apply the [PostgreSQL migrations](#postgresql-migrations) before starting the development server.

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

1. Open the Pulsewire API collection in Postman. Its YAML files are in
   [`postman/PulsewireAPI/`](postman/PulsewireAPI/).
2. Select the **local development** environment. It sets `baseUrl` to
   `http://127.0.0.1:3000`.
3. With the application running, send `GET {{baseUrl}}/health` to check the
   database connections.
4. Send `POST {{baseUrl}}/auth/register` with the sample JSON body. Use an
   unused email for each successful registration (`201 Created`). Reusing an
   email returns `409 Conflict`.

To target a different server or port, set `baseUrl` in the selected environment
without a trailing slash. Keep tokens and passwords out of committed exports.

### PostgreSQL migrations

The migration command reads `POSTGRES_DSN` from the environment or `.env`. Run the following commands from the repository root to apply pending migrations. The `CreateUsers` migration creates the `users` table and its unique email constraint.

```sh
npm run build
npm exec -- typeorm migration:run -d dist/database/postgres/data-source.js
```

### Run tests

The [Vitest](https://vitest.dev) configuration defines `unit` and `integration` projects.

Run unit tests without a database:

```sh
npm test -- --project unit
```

Run unit tests in watch mode:

```sh
npm run test:watch -- --project unit
```

Run a specific test file:

```sh
npm test -- --project unit src/config/app.config.spec.ts
```

#### PostgreSQL integration tests

Create a dedicated role and database once in the local PostgreSQL container. Enter a test database password when prompted.

```sh
docker exec -it pulsewire-postgres createuser -U pulsewire_app --pwprompt pulsewire_test_app
docker exec pulsewire-postgres createdb -U pulsewire_app --owner=pulsewire_test_app pulsewire_test
cp -n .env.test.example .env.test
```

In `.env.test`, set `POSTGRES_TEST_DSN` to the connection string for `pulsewire_test`. Replace `YOUR_PASSWORD` with the test role password and percent-encode reserved URL characters. Vitest applies pending PostgreSQL migrations to the test database during integration setup.

```sh
npm test -- --project integration
```

With the test database configured, run both projects with `npm test` or generate a combined coverage report:

```sh
npm run test:cov
```

Before submitting changes, also run:

```sh
npm run lint
npm run build
```
