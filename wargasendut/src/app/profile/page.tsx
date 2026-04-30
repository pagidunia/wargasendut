'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface UserProfile {
  idwarga: string;
  namawarga: string;
  alamatwarga?: string;
  norumah: string;
  nohp?: string;
  displayName?: string;
  userRole?: string;
}

export default function Profile() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/user/profile');
        if (!res.ok) {
          if (res.status === 401) {
            router.replace('/masuk');
            return;
          }
          throw new Error('Failed to load data');
        }
        const json = await res.json();
        setProfile(json);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [router]);

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setSubmitMessage(null);

    if (!newPassword.trim()) {
      setSubmitMessage({ type: 'error', text: 'Password tidak boleh kosong' });
      return;
    }

    try {
      const res = await fetch('/api/auth/reset-password-v2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idwarga: profile?.idwarga, newPassword }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setSubmitMessage({ type: 'success', text: '✓ Password berhasil direset' });
      setNewPassword('');
      setShowResetPassword(false);
    } catch (err) {
      setSubmitMessage({ type: 'error', text: err instanceof Error ? err.message : 'Gagal reset password' });
    }
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.replace('/masuk');
  }

  if (loading) return <div>Loading...</div>;

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">WS</div>
          <div className="sidebar-logo-text">Warga Sendut</div>
        </div>

        <nav className="sidebar-nav">
          <button
            type="button"
            className="nav-item"
            onClick={() => router.back()}
          >
            <div className="nav-dot"></div>
            ← Kembali
          </button>
        </nav>

        <div className="sidebar-profile">
          <div className="avatar"></div>
          <div>
            <div className="sidebar-profile-name">{profile?.displayName || 'User'}</div>
            <div className="sidebar-profile-role">{profile?.userRole || 'User'}</div>
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
        <div className="card">
          <h2>👤 Profile Anda</h2>
          <p>Informasi data pribadi dan login</p>

          {submitMessage && (
            <div style={{
              padding: '12px 16px',
              marginBottom: '16px',
              borderRadius: '4px',
              backgroundColor: submitMessage.type === 'success' ? '#d4edda' : '#f8d7da',
              color: submitMessage.type === 'success' ? '#155724' : '#721c24',
            }}>
              {submitMessage.text}
            </div>
          )}

          <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
            <h3 style={{ marginTop: 0 }}>Data Pribadi</h3>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px' }}>Nama</label>
              <div style={{ fontSize: '14px', fontWeight: '500' }}>{profile?.namawarga}</div>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px' }}>Alamat Rumah</label>
              <div style={{ fontSize: '14px', fontWeight: '500' }}>{profile?.alamatwarga || '-'}</div>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px' }}>No. Rumah</label>
              <div style={{ fontSize: '14px', fontWeight: '500' }}>{profile?.norumah || '-'}</div>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px' }}>No. HP</label>
              <div style={{ fontSize: '14px', fontWeight: '500' }}>{profile?.nohp || '-'}</div>
            </div>
          </div>

          <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: '#f0f7ff', borderRadius: '4px' }}>
            <h3 style={{ marginTop: 0 }}>Keamanan</h3>
            <p style={{ fontSize: '14px', color: '#666' }}>Kelola password akun login Anda</p>
            <button
              type="button"
              className="btn-primary"
              onClick={() => setShowResetPassword(true)}
              style={{ marginBottom: '12px' }}
            >
              🔑 Reset Password
            </button>
          </div>
        </div>
      </main>

      {showResetPassword && (
        <div className="modal-overlay" onClick={() => setShowResetPassword(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Reset Password</h2>
            <form onSubmit={handleResetPassword}>
              <div className="form-group">
                <label>Password Baru *</label>
                <input
                  type="password"
                  placeholder="Masukkan password baru Anda"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>

              {submitMessage && (
                <div style={{
                  padding: '12px',
                  marginBottom: '12px',
                  borderRadius: '4px',
                  backgroundColor: submitMessage.type === 'success' ? '#d4edda' : '#f8d7da',
                  color: submitMessage.type === 'success' ? '#155724' : '#721c24',
                  fontSize: '14px',
                }}>
                  {submitMessage.text}
                </div>
              )}

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowResetPassword(false)}>
                  Batal
                </button>
                <button type="submit" className="btn-primary">
                  Simpan Password Baru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          padding: 30px;
          border-radius: 8px;
          width: 90%;
          max-width: 500px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        }

        .modal-content h2 {
          margin-top: 0;
          margin-bottom: 20px;
        }

        .form-group {
          margin-bottom: 15px;
        }

        .form-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: 600;
          color: #333;
        }

        .form-group input {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
          box-sizing: border-box;
        }

        .form-group input:focus {
          outline: none;
          border-color: #4CAF50;
          box-shadow: 0 0 5px rgba(76, 175, 80, 0.3);
        }

        .modal-actions {
          display: flex;
          gap: 10px;
          justify-content: flex-end;
          margin-top: 20px;
        }

        .btn-primary {
          background: #4CAF50;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }

        .btn-primary:hover {
          background: #45a049;
        }

        .btn-secondary {
          background: #999;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }

        .btn-secondary:hover {
          background: #888;
        }
      `}</style>
    </div>
  );
}
