'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Warga {
  idwarga: string;
  namawarga: string;
  alamatwarga?: string;
  norumah: string;
  nohp?: string;
}

export default function DaftarWarga() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState('');
  const [userRole, setUserRole] = useState('');
  const [wargaList, setWargaList] = useState<Warga[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedWargaForEdit, setSelectedWargaForEdit] = useState<Warga | null>(null);
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [createForm, setCreateForm] = useState({
    nama: '',
    alamatRumah: '',
    nomorRumah: '',
    noHp: '',
  });

  const [editForm, setEditForm] = useState({
    namawarga: '',
    alamatwarga: '',
    norumah: '',
    nohp: '',
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/dashboard');
        if (!res.ok) {
          if (res.status === 401) {
            router.replace('/masuk');
            return;
          }
          throw new Error('Failed to load data');
        }
        const json = await res.json();
        setDisplayName(json.displayName || 'User');
        setUserRole(json.userRole || 'User');

        // Fetch warga list dengan all fields
        const wargaRes = await fetch('/api/warga/list');
        if (wargaRes.ok) {
          const wargaData = await wargaRes.json();
          setWargaList(wargaData.warga || []);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
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

  function handleOpenEdit(warga: Warga) {
    setEditForm({
      namawarga: warga.namawarga,
      alamatwarga: warga.alamatwarga || '',
      norumah: warga.norumah,
      nohp: warga.nohp || '',
    });
    setSelectedWargaForEdit(warga);
    setEditMode(true);
    setShowCreateModal(false);
    setSubmitMessage(null);
  }

  async function handleEditWarga(e: React.FormEvent) {
    e.preventDefault();
    setSubmitMessage(null);
    if (!selectedWargaForEdit) return;
    try {
      const res = await fetch('/api/warga/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idwarga: selectedWargaForEdit.idwarga,
          ...editForm,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setSubmitMessage({ type: 'success', text: '✓ Warga berhasil diupdate: ' + editForm.namawarga });
      setEditMode(false);
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      setSubmitMessage({ type: 'error', text: err instanceof Error ? err.message : 'Gagal update warga' });
    }
  }

  async function handleDeleteWarga(idwarga: string, nama: string) {
    if (!confirm(`Yakin hapus warga "${nama}"?`)) return;
    try {
      const res = await fetch('/api/warga/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idwarga }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setSubmitMessage({ type: 'success', text: '✓ Warga berhasil dihapus: ' + nama });
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      setSubmitMessage({ type: 'error', text: err instanceof Error ? err.message : 'Gagal hapus warga' });
    }
  }

  async function handleCreateWarga(e: React.FormEvent) {
    e.preventDefault();
    setSubmitMessage(null);
    try {
      const res = await fetch('/api/warga/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setSubmitMessage({ type: 'success', text: '✓ Warga berhasil ditambahkan: ' + createForm.nama });
      setCreateForm({ nama: '', alamatRumah: '', nomorRumah: '', noHp: '' });
      setShowCreateModal(false);
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      setSubmitMessage({ type: 'error', text: err instanceof Error ? err.message : 'Gagal tambah warga' });
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
          <h2>👥 Daftar Warga</h2>
          <p>Kelola data warga RT 02 / RW 02</p>

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

          <button
            type="button"
            className="btn-primary"
            onClick={() => setShowCreateModal(true)}
            style={{ marginBottom: '24px' }}
          >
            ➕ Tambah Warga
          </button>

          {editMode && (
            <form onSubmit={handleEditWarga} style={{ marginBottom: '24px', padding: '16px', backgroundColor: '#fef3c7', borderRadius: '4px' }}>
              <h3>Edit Warga: {selectedWargaForEdit?.namawarga}</h3>
              <div style={{ marginBottom: '12px' }}>
                <label>Nama *</label>
                <input
                  type="text"
                  value={editForm.namawarga}
                  onChange={(e) => setEditForm({ ...editForm, namawarga: e.target.value })}
                  placeholder="Nama warga"
                  required
                />
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label>Alamat Rumah</label>
                <input
                  type="text"
                  value={editForm.alamatwarga}
                  onChange={(e) => setEditForm({ ...editForm, alamatwarga: e.target.value })}
                  placeholder="Jl. Sendangsari Utara"
                />
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label>No. Rumah</label>
                <input
                  type="text"
                  value={editForm.norumah}
                  onChange={(e) => setEditForm({ ...editForm, norumah: e.target.value })}
                  placeholder="01"
                />
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label>No. HP</label>
                <input
                  type="tel"
                  value={editForm.nohp}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    setEditForm({ ...editForm, nohp: value });
                  }}
                  placeholder="0812345678"
                />
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button type="submit" className="btn-primary">Simpan Perubahan</button>
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => {
                    setEditMode(false);
                    setSelectedWargaForEdit(null);
                    setSubmitMessage(null);
                  }}
                >
                  Batal
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="card">
          <h2>Daftar Warga Terdaftar</h2>
          <p>Total {wargaList.length} warga</p>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nama</th>
                  <th>Alamat</th>
                  <th>No. Rumah</th>
                  <th>No. HP</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {wargaList.map((warga) => (
                  <tr key={warga.idwarga}>
                    <td><code style={{ fontSize: '12px' }}>{warga.idwarga}</code></td>
                    <td>{warga.namawarga}</td>
                    <td style={{ fontSize: '12px', color: '#666' }}>{warga.alamatwarga || '-'}</td>
                    <td>{warga.norumah || '-'}</td>
                    <td>{warga.nohp || '-'}</td>
                    <td style={{ display: 'flex', gap: '8px' }}>
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
                        onClick={() => handleOpenEdit(warga)}
                      >
                        Edit
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
                        onClick={() => handleDeleteWarga(warga.idwarga, warga.namawarga)}
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Tambah Warga Baru</h2>
            <form onSubmit={handleCreateWarga}>
              <div className="form-group">
                <label>Nama Warga *</label>
                <input
                  type="text"
                  placeholder="Nama warga"
                  value={createForm.nama}
                  onChange={(e) => setCreateForm({ ...createForm, nama: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Alamat Rumah</label>
                <input
                  type="text"
                  placeholder="Jl. Sendangsari Utara"
                  value={createForm.alamatRumah}
                  onChange={(e) => setCreateForm({ ...createForm, alamatRumah: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>No. Rumah</label>
                <input
                  type="text"
                  placeholder="01"
                  value={createForm.nomorRumah}
                  onChange={(e) => setCreateForm({ ...createForm, nomorRumah: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>No. HP</label>
                <input
                  type="tel"
                  placeholder="0812345678"
                  value={createForm.noHp}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    setCreateForm({ ...createForm, noHp: value });
                  }}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowCreateModal(false)}>
                  Batal
                </button>
                <button type="submit" className="btn-primary">
                  Tambah Warga
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
