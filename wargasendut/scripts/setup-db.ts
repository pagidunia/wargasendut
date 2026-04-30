import { Pool } from 'pg';
import bcryptjs from 'bcryptjs';
import fs from 'fs';
import path from 'path';

const PASSWORD = 'warga123';

async function main() {
  // Connect to default postgres database first
  const adminPool = new Pool({
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 5432),
    user: process.env.DB_USER ?? 'postgres',
    password: process.env.DB_PASSWORD ?? '',
    database: 'postgres',
  });

  try {
    // Create database
    console.log('Creating database wargasendut...');
    const adminClient = await adminPool.connect();
    try {
      await adminClient.query(`DROP DATABASE IF EXISTS wargasendut`);
      await adminClient.query(`CREATE DATABASE wargasendut`);
      console.log('✓ Database created');
    } finally {
      adminClient.release();
    }

    // Connect to the new database
    const pool = new Pool({
      host: process.env.DB_HOST ?? 'localhost',
      port: Number(process.env.DB_PORT ?? 5432),
      user: process.env.DB_USER ?? 'postgres',
      password: process.env.DB_PASSWORD ?? '',
      database: 'wargasendut',
    });

    const client = await pool.connect();
    try {
      // Read and execute schema
      console.log('Creating tables...');
      const schemaPath = path.join(__dirname, '..', 'db', 'setup.sql');
      const schema = fs.readFileSync(schemaPath, 'utf-8');
      const statements = schema.split(';').filter(s => s.trim() && !s.trim().startsWith('--') && !s.trim().startsWith('\\c'));

      for (const stmt of statements) {
        const cleanStmt = stmt.trim();
        if (cleanStmt) {
          await client.query(cleanStmt);
        }
      }
      console.log('✓ Tables created');

      // Hash password
      const hash = await bcryptjs.hash(PASSWORD, 10);

      // Insert demo users
      console.log('Inserting demo users...');
      const users = [
        {
          username: 'pak_rt_07',
          display_name: 'Pak Slamet',
          honorific: 'Pak Slamet',
          role: 'Ketua RT 07',
          nomor_rumah: 7,
        },
        {
          username: 'bu_bendahara',
          display_name: 'Bu Siti',
          honorific: 'Bu Siti',
          role: 'Bendahara RT 07',
          nomor_rumah: 3,
        },
        {
          username: 'pak_ketua_rw',
          display_name: 'Pak Budi',
          honorific: 'Pak Budi',
          role: 'Ketua RW 03',
          nomor_rumah: 1,
        },
        {
          username: 'bu_ketua_rt',
          display_name: 'Bu Ani',
          honorific: 'Bu Ani',
          role: 'Sekretaris RT 07',
          nomor_rumah: 5,
        },
        {
          username: 'pak_warga_1',
          display_name: 'Pak Joko',
          honorific: 'Pak Joko',
          role: 'Warga',
          nomor_rumah: 12,
        },
        {
          username: 'pak_warga_2',
          display_name: 'Pak Rudi',
          honorific: 'Pak Rudi',
          role: 'Warga',
          nomor_rumah: 18,
        },
        {
          username: 'bu_warga_1',
          display_name: 'Bu Rina',
          honorific: 'Bu Rina',
          role: 'Warga',
          nomor_rumah: 14,
        },
        {
          username: 'bu_warga_2',
          display_name: 'Bu Siska',
          honorific: 'Bu Siska',
          role: 'Warga',
          nomor_rumah: 21,
        },
      ];

      for (const user of users) {
        await client.query(
          `INSERT INTO warga
           (username, password_hash, display_name, honorific, role, nomor_rumah)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (username) DO NOTHING`,
          [user.username, hash, user.display_name, user.honorific, user.role, user.nomor_rumah]
        );
      }
      console.log('✓ Demo users inserted');

      // Get warga IDs and insert dummy iuran data
      console.log('Inserting iuran data...');
      const result = await client.query('SELECT id FROM warga ORDER BY id LIMIT 8');
      const wargaList = result.rows;
      const bulanList = ['Januari', 'Februari', 'Maret', 'April'];
      const tahun = 2026;

      for (const warga of wargaList) {
        for (const bulan of bulanList) {
          const status = Math.random() > 0.3 ? 'lunas' : 'belum';
          await client.query(
            `INSERT INTO iuran
             (warga_id, bulan, tahun, jumlah, status, tanggal_bayar)
             VALUES ($1, $2, $3, 150000, $4, $5)
             ON CONFLICT (warga_id, bulan, tahun) DO NOTHING`,
            [warga.id, bulan, tahun, status, status === 'lunas' ? new Date().toISOString().split('T')[0] : null]
          );
        }
      }
      console.log('✓ Iuran data inserted');

      console.log('✓ Database setup complete!');
      console.log(`\nDemo credentials:\nUsername: pak_rt_07\nPassword: ${PASSWORD}\n`);
    } finally {
      client.release();
      await pool.end();
    }
  } finally {
    await adminPool.end();
  }
}

main().catch(err => {
  console.error('✗ Error:', err.message);
  process.exit(1);
});
