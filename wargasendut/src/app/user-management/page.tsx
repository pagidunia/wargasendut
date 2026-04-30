'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface LoginUser {
  idwarga: string;
  namalogin: string;
  rolelogin: string;
}

export default function UserManagement() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState('');
  const [userRole, setUserRole] = useState('');
  const [userList, setUserList] = useState<LoginUser[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [editMode, setEditMode] = useState(false);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<LoginUser | null>(null);
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [editForm, setEditForm] = useState({
    idwarga: '',
    namalogin: '',
    rolelogin: 'Warga',
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const dashRes = await fetch('/api/dashboard');
        if (!dashRes.ok) {
          if (dashRes.status === 401) {
            router.replace('/masuk');
            return;
          }
          throw new Error('Failed to load data');
        }
        const dashJson = await dashRes.json();
        setDisplayName(dashJson.displayName || 'User');
        setUserRole(dashJson.userRole || 'User');

        // Fetch users from loginwarga
        const usersRes = await fetch('/api/auth/list-users');
        if (usersRes.ok) {
          const usersData = await usersRes.json();
          setUserList(usersData.users || []);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [router]);

  async function handleResetPassword(idwarga: string) {
    setSubmitMessage(null);
    try {
      const res = await fetch('/api/auth/reset-password-v2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idwarga, newPassword: 'sendut123' }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setSubmitMessage({ type: 'success', text: '✓ Password berhasil direset untuk: ' + idwarga });
    } catch (err) {
      setSubmitMessage({ type: 'error', text: err instanceof Error ? err.message : 'Gagal reset password' });
    }
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.replace('/masuk');
  }

  function handleOpenEdit(user: LoginUser) {
    setEditForm({
      idwarga: user.idwarga,
      namalogin: user.namalogin,
      rolelogin: user.rolelogin || 'Warga',
    });
    setSelectedUserForEdit(user);
    setEditMode(true);
    setSubmitMessage(null);
  }

  async function handleEditUser(e: React.FormEvent) {
    e.preventDefault();
    setSubmitMessage(null);
    try {
      const res = await fetch('/api/auth/update-user-v2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setSubmitMessage({ type: 'success', text: '✓ User berhasil diupdate: ' + editForm.namalogin });
      setEditMode(false);
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      setSubmitMessage({ type: 'error', text: err instanceof Error ? err.message : 'Gagal update user' });
    }
  }

  async function handleDeleteUser(idwarga: string, namalogin: string) {
    if (!confirm(`Yakin hapus user "${namalogin}"?`)) return;
    try {
      const res = await fetch('/api/auth/delete-user-v2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idwarga }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setSubmitMessage({ type: 'success', text: '✓ User berhasil dihapus: ' + namalogin });
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      setSubmitMessage({ type: 'error', text: err instanceof Error ? err.message : 'Gagal hapus user' });
    }
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
            <div className="sidebar-profile-name">{displayName || 'User'}</div>
            <div className="sidebar-profile-role">{userRole || 'User'}</div>
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
          <h2>🔐 User Login Management</h2>
          <p>Kelola user login, buat user baru, dan reset password</p>

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

          {editMode && selectedUserForEdit && (
            <form onSubmit={handleEditUser} style={{ marginBottom: '24px', padding: '16px', backgroundColor: '#fef3c7', borderRadius: '4px' }}>
              <h3>Edit User: {selectedUserForEdit.idwarga}</h3>
              <div style={{ marginBottom: '12px' }}>
                <label>Nama Login *</label>
                <input
                  type="text"
                  value={editForm.namalogin}
                  onChange={(e) => setEditForm({ ...editForm, namalogin: e.target.value })}
                  placeholder="Nama login"
                  required
                />
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label>Role</label>
                <select value={editForm.rolelogin} onChange={(e) => setEditForm({ ...editForm, rolelogin: e.target.value })}>
                  <option>Warga</option>
                  <option>Ketua RT</option>
                  <option>Wakil Ketua RT</option>
                  <option>Sekretaris</option>
                  <option>Bendahara</option>
                  <option>Penasehat RT</option>
                  <option>Koordinator Gang</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="submit" className="btn-primary">Update User</button>
                <button
                  type="button"
                  style={{
                    padding: '10px 16px',
                    background: '#999',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                  onClick={() => setEditMode(false)}
                >
                  Batal
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="card">
          <h2>Daftar User Terdaftar</h2>
          <p>Total {userList.length} user</p>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID Warga</th>
                  <th>Nama Login</th>
                  <th>Role</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {userList.map((user) => (
                  <tr key={user.idwarga}>
                    <td><code style={{ fontSize: '12px' }}>{user.idwarga}</code></td>
                    <td>{user.namalogin}</td>
                    <td>{user.rolelogin}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          type="button"
                          style={{
                            padding: '4px 8px',
                            fontSize: '12px',
                            backgroundColor: '#2563eb',
                            color: 'white',
                            border: 'none',
                            borderRadius: '3px',
                            cursor: 'pointer',
                          }}
                          onClick={() => handleOpenEdit(user)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          style={{
                            padding: '4px 8px',
                            fontSize: '12px',
                            backgroundColor: '#f59e0b',
                            color: 'white',
                            border: 'none',
                            borderRadius: '3px',
                            cursor: 'pointer',
                          }}
                          onClick={() => handleResetPassword(user.idwarga)}
                        >
                          Reset
                        </button>
                        <button
                          type="button"
                          style={{
                            padding: '4px 8px',
                            fontSize: '12px',
                            backgroundColor: '#dc2626',
                            color: 'white',
                            border: 'none',
                            borderRadius: '3px',
                            cursor: 'pointer',
                          }}
                          onClick={() => handleDeleteUser(user.idwarga, user.namalogin)}
                        >
                          Hapus
                        </button>
                      </div>
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
