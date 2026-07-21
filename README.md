# Neural Network Model for Machine Translation

A web-based English, Tagalog, and Teduray translation system built with Next.js, TypeScript, Prisma, and PostgreSQL.

## Local installation (Windows PC/laptop)

### 1. Install the required software

Install these programs before setting up the project:

- [Git](https://git-scm.com/downloads)
- [Node.js](https://nodejs.org/) **20.9 or newer** (the LTS release is recommended)
- [PostgreSQL](https://www.postgresql.org/download/windows/) (PostgreSQL 15 or newer is recommended)
- A code editor such as [Visual Studio Code](https://code.visualstudio.com/) (optional)

You do **not** need to install the JavaScript libraries one by one. They are listed in `package.json` and installed together by npm.

Check that the required command-line tools are available:

```powershell
git --version
node --version
npm --version
psql --version
```

If `psql` is not recognized, use PostgreSQL's **SQL Shell (psql)** from the Start menu or add PostgreSQL's `bin` directory to your Windows `PATH`.

### 2. Download the project

Using Git:

```powershell
git clone <YOUR-GITHUB-REPOSITORY-URL>
cd "Neural Network Model for Machine Translation"
```

Replace `<YOUR-GITHUB-REPOSITORY-URL>` with this repository's HTTPS URL. If you downloaded a ZIP instead, extract it and open PowerShell in the extracted project folder.

### 3. Install the project libraries

```powershell
npm install
```

This installs Next.js, React, Prisma, the PostgreSQL driver, authentication libraries, Excel dataset support, Tailwind CSS, TypeScript, and the other exact versions recorded in `package-lock.json`.

### 4. Create the PostgreSQL database

Open **SQL Shell (psql)** or pgAdmin and create an empty database:

```sql
CREATE DATABASE machine_translation;
```

Keep your PostgreSQL username, password, host, and port. A normal local installation commonly uses:

- Username: `postgres`
- Host: `localhost`
- Port: `5432`
- Database: `machine_translation`

### 5. Configure environment variables

Copy the example file:

```powershell
Copy-Item .env.example .env
```

Open `.env` and replace the example values:

```dotenv
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/machine_translation?schema=public"
JWT_SECRET="replace-this-with-a-long-random-secret"
```

To generate a random JWT secret in PowerShell, you can run:

```powershell
[Convert]::ToBase64String((1..48 | ForEach-Object { Get-Random -Maximum 256 }))
```

If the database password contains characters such as `@`, `:`, `/`, `?`, or `#`, URL-encode them in `DATABASE_URL`. Never commit the real `.env` file; it is ignored by Git.

### 6. Create the database tables

Apply the migrations already included in the repository, then generate the Prisma client:

```powershell
npx prisma migrate deploy
npx prisma generate
```

### 7. Create the initial administrator

```powershell
node prisma/seed.js
```

The seed currently creates this local administrator account:

- Email: `admin@gmail.com`
- Password: `admin123`

Change this default password before using the system with real or sensitive data.

### 8. Import the translation dataset

The repository includes `datasets/7KPlus-Final-Datasets.xlsx`. Import it with:

```powershell
node scripts/import-dataset.js
```

Warning: the import script clears all existing translation dataset entries before importing the spreadsheet again. User accounts and translation history are not cleared.

### 9. Start the system

```powershell
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in a browser. Stop the server with `Ctrl+C`.

## Starting the system again later

Make sure the PostgreSQL service is running, open PowerShell in the project folder, and run:

```powershell
npm run dev
```

The installation, migration, seed, and dataset import steps do not need to be repeated unless dependencies, the database schema, or the dataset have changed.

## Production-style local test

To verify that the optimized application can build and run:

```powershell
npm run build
npm run start
```

## Available commands

| Command | Purpose |
| --- | --- |
| `npm install` | Install all libraries from `package.json` |
| `npm run dev` | Start the development server |
| `npm run build` | Generate Prisma Client and build the production app |
| `npm run start` | Run a completed production build |
| `npm run lint` | Check the source code with ESLint |
| `npx prisma migrate deploy` | Apply the included database migrations |
| `npx prisma generate` | Generate Prisma Client |
| `node prisma/seed.js` | Create or update the initial administrator |
| `node scripts/import-dataset.js` | Replace and import the translation dataset |

## Main libraries

The exact versions are maintained in `package.json` and `package-lock.json`. Major libraries include:

- Next.js and React for the web application
- TypeScript for type-safe source code
- Tailwind CSS for styling
- Prisma ORM, `pg`, and the Prisma PostgreSQL adapter for database access
- `bcryptjs`, `jose`, `jsonwebtoken`, and `cookie` for authentication
- `xlsx` for reading the included Excel dataset

## Troubleshooting

### `npm` or `node` is not recognized

Restart the terminal after installing Node.js. If it still fails, reinstall Node.js and enable the option that adds it to `PATH`.

### Cannot connect to PostgreSQL

Confirm that the PostgreSQL Windows service is running and that the username, password, port, and database name in `DATABASE_URL` are correct.

### Prisma reports that `DATABASE_URL` is missing

Confirm that `.env` is in the project root (beside `package.json`) and is named exactly `.env`, not `.env.txt`.

### Port 3000 is already in use

Start the development server on another port:

```powershell
npm run dev -- -p 3001
```

Then open `http://localhost:3001`.

### Reset a disposable local database

Only use this during local development because it deletes existing database data:

```powershell
npx prisma migrate reset
node prisma/seed.js
node scripts/import-dataset.js
```

## Security notes

- Do not upload `.env` or database passwords to GitHub.
- Use a unique, long `JWT_SECRET` outside local development.
- Replace the seeded administrator password immediately.
- Do not use real personal or sensitive records in an unsecured development database.
