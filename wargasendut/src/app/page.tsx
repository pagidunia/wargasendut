'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import IuranRadialChart from '@/components/IuranRadialChart';

const NAV_ITEMS = [
  { key: 'ringkasan', label: 'Ringkasan' },
  { key: 'daftar', label: 'Daftar warga' },
  { key: 'iuran', label: 'Iuran warga' },
  { key: 'user-login', label: 'User login' },
  { key: 'profile', label: 'Profile' },
];

interface Warga {
  idwarga: string;
  namawarga: string;
  alamatwarga?: string;
  norumah: string;
  nohp?: string;
  status: string | null;
  jumlah: number | null;
}

interface DashboardData {
  displayName: string;
  userRole: string;
  bulan: string;
  tahun: number;
  stats: {
    terkumpul: number;
    terbayar: number;
    tertunggak: number;
    totalWarga: number;
  };
  warga: Warga[];
}

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState('');
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/dashboard');
        if (!res.ok) {
          if (res.status === 401) {
            router.replace('/masuk');
            return;
          }
          throw new Error('Failed to load dashboard');
        }
        const json = await res.json();
        setData(json);
        setDisplayName(json.displayName || 'User');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
        router.replace('/masuk');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [router]);


  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.replace('/masuk');
  }

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data) return null;

  let filteredNav = NAV_ITEMS;

  if (data.userRole === 'Bendahara') {
    filteredNav = NAV_ITEMS.filter((item) => ['ringkasan', 'iuran', 'profile'].includes(item.key));
  } else if (data.userRole === 'Sekretaris') {
    filteredNav = NAV_ITEMS.filter((item) => ['ringkasan', 'daftar', 'profile'].includes(item.key));
  } else if (['Warga', 'Ketua RT', 'Wakil Ketua RT', 'Penasehat RT', 'Koordinator Gang'].includes(data.userRole)) {
    filteredNav = NAV_ITEMS.filter((item) => ['ringkasan', 'profile'].includes(item.key));
  }

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">WS</div>
          <div className="sidebar-logo-text">Warga Sendut</div>
        </div>

        <nav className="sidebar-nav">
          {filteredNav.map((item) => (
            <button
              key={item.key}
              className="nav-item"
              onClick={() => {
                if (item.key === 'user-login') {
                  router.push('/user-management');
                } else if (item.key === 'daftar') {
                  router.push('/daftar-warga');
                } else if (item.key === 'iuran') {
                  router.push('/iuran-warga');
                } else if (item.key === 'profile') {
                  router.push('/profile');
                }
              }}
            >
              <div className="nav-dot"></div>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-profile">
          <div className="avatar"></div>
          <div>
            <div className="sidebar-profile-name">{displayName || 'User'}</div>
            <div className="sidebar-profile-role">{data?.userRole || 'Warga'}</div>
          </div>
          <button
            type="button"
            className="btn-ghost"
            onClick={handleLogout}
            style={{ marginLeft: 'auto', fontSize: 12 }}
          >
            keluar
          </button>
        </div>
      </aside>

      <main className="main-content">
        <div className="welcome-card">
          <h2>👋 Selamat datang kembali, {displayName}!</h2>
          <p>
            {data.stats.tertunggak > 0
              ? `Ada ${data.stats.tertunggak} iuran tertunggak bulan ini.`
              : 'Semua iuran lunas. Terima kasih! 🎉'}
          </p>
        </div>

        <div className="card">
          <h2>Ringkasan — {data.bulan} {data.tahun}</h2>
          <p>RT 02 · {data.stats.totalWarga} KK · periode lengkap</p>

          <div className="stats-grid">
            <div className="stat-box">
              <div className="stat-label">Terkumpul</div>
              <div className="stat-value">Rp {Number(data.stats.terkumpul).toLocaleString('id-ID')}</div>
              <div className="stat-subtext">dari {data.stats.terbayar} KK</div>
            </div>
            <div className="stat-box alt">
              <div className="stat-label">Sudah bayar</div>
              <div className="stat-value">{data.stats.terbayar} KK</div>
              <div className="stat-subtext">dari {data.stats.totalWarga} KK</div>
            </div>
            <div className="stat-box alt">
              <div className="stat-label">Belum bayar</div>
              <div className="stat-value">{data.stats.tertunggak} KK</div>
              <div className="stat-subtext">perlu tindakan</div>
            </div>
          </div>
        </div>

        <div className="card">
          <h2>Status Pembayaran — Visual</h2>
          <p>Persentase warga yang sudah dan belum membayar iuran</p>
          <IuranRadialChart
            terbayar={data.stats.terbayar}
            tertunggak={data.stats.tertunggak}
            total={data.stats.totalWarga}
          />
        </div>

        <div className="card">
          <h2>Daftar iuran warga</h2>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Nama Warga</th>
                  <th>Status iuran</th>
                </tr>
              </thead>
              <tbody>
                {data.warga.map((warga, i) => (
                  <tr key={i}>
                    <td>
                      {warga.namawarga}
                    </td>
                    <td>
                      {warga.status === 'lunas' ? (
                        <span className="badge badge-success">✓ Lunas</span>
                      ) : (
                        <span className="badge badge-danger">● Belum bayar</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
