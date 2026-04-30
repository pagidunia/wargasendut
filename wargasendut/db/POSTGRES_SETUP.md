# PostgreSQL Setup untuk Warga Sendut

## Opsi 1: Menggunakan Shell Script (Recommended)

```bash
./db/setup-postgres.sh
```

## Opsi 2: Manual psql Commands

### Step 1: Drop database (jika ada)
```bash
psql -U postgres -c "DROP DATABASE IF EXISTS wargasendut;"
```

### Step 2: Create database
```bash
psql -U postgres -c "CREATE DATABASE wargasendut;"
```

### Step 3: Create tables (schema)
```bash
psql -U postgres -d wargasendut -f db/schema.sql
```

### Step 4: Seed data
```bash
psql -U postgres -d wargasendut -f db/setup.sql
```

## Opsi 3: Single psql Session

```bash
psql -U postgres
```

Kemudian di psql prompt, jalankan:

```sql
DROP DATABASE IF EXISTS wargasendut;
CREATE DATABASE wargasendut;
\c wargasendut
\i db/schema.sql
\i db/setup.sql
```

## Verify Setup

```bash
psql -U postgres -d wargasendut -c "SELECT * FROM warga;"
psql -U postgres -d wargasendut -c "SELECT * FROM iuran;"
psql -U postgres -d wargasendut -c "SELECT * FROM login_attempts;"
```

## Jika Ada Password

Ganti `-U postgres` dengan user yang benar, dan set password:

```bash
PGPASSWORD='your_password' psql -U postgres -h localhost -d wargasendut -f db/setup.sql
```

Atau gunakan `.pgpass` file untuk credentials.

## Environment Variables

Script shell support environment variables:

```bash
export DB_USER=postgres
export DB_HOST=localhost
export DB_PORT=5432
export DB_PASSWORD=your_password

./db/setup-postgres.sh
```
