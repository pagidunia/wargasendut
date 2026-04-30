#!/bin/bash

# PostgreSQL setup script
# Usage: ./db/setup-postgres.sh

DB_USER=${DB_USER:-postgres}
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_NAME="wargasendut"
DB_PASSWORD=${DB_PASSWORD:-}

echo "🗄️  PostgreSQL Database Setup for Warga Sendut"
echo "================================================"
echo "Host: $DB_HOST:$DB_PORT"
echo "User: $DB_USER"
echo ""

# Drop existing database if it exists
echo "1️⃣  Dropping existing database (if any)..."
if [ -z "$DB_PASSWORD" ]; then
  PGPASSWORD='' psql -h $DB_HOST -p $DB_PORT -U $DB_USER -tc "DROP DATABASE IF EXISTS $DB_NAME;"
else
  PGPASSWORD="$DB_PASSWORD" psql -h $DB_HOST -p $DB_PORT -U $DB_USER -tc "DROP DATABASE IF EXISTS $DB_NAME;"
fi

# Create database
echo "2️⃣  Creating database..."
if [ -z "$DB_PASSWORD" ]; then
  PGPASSWORD='' psql -h $DB_HOST -p $DB_PORT -U $DB_USER -tc "CREATE DATABASE $DB_NAME;"
else
  PGPASSWORD="$DB_PASSWORD" psql -h $DB_HOST -p $DB_PORT -U $DB_USER -tc "CREATE DATABASE $DB_NAME;"
fi

# Run schema
echo "3️⃣  Creating tables..."
if [ -z "$DB_PASSWORD" ]; then
  PGPASSWORD='' psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f db/schema.sql
else
  PGPASSWORD="$DB_PASSWORD" psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f db/schema.sql
fi

# Run setup (seed data)
echo "4️⃣  Seeding demo data..."
if [ -z "$DB_PASSWORD" ]; then
  PGPASSWORD='' psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f db/setup.sql
else
  PGPASSWORD="$DB_PASSWORD" psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f db/setup.sql
fi

echo ""
echo "✅ Database setup complete!"
echo ""
echo "Demo credentials:"
echo "  Username: pak_rt_07"
echo "  Password: warga123"
echo ""
