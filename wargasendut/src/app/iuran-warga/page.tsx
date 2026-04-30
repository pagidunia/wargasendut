'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface IuranItem {
  iduran: number;
  idwarga: string;
  namawarga: string;
  norumah: string;
  bulan: string;
  tahun: number;
  jumlah: string;
  status: string;
  tanggal_bayar: string | null;
}

interface IuranData {
  displayName: string;
  userRole: string;
  currentMonth: string;
  currentYear: number;
  iuran: IuranItem[];
}

interface Warga {
  idwarga: string;
  namawarga: string;
  norumah: string;
}

const bulanList = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

export default function IuranWargaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<IuranData | null>(null);
  const [wargaList, setWargaList] = useState<Warga[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showInputModal, setShowInputModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedWargaId, setSelectedWargaId] = useState('');
  const [selectedWargaName, setSelectedWargaName] = useState('');
  const [selectedIuran, setSelectedIuran] = useState<any>(null);
  const [formData, setFormData] = useState({
    namawarga: '',
    bulan: '',
    tahun: new Date().getFullYear(),
    jumlah: '40000',
    status: 'lunas',
  });
  const [editData, setEditData] = useState({
    bulan: '',
    tahun: 0,
    jumlah: '',
    status: 'lunas',
  });
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/iuran/list');
        if (!res.ok) {
          if (res.status === 401) {
            router.replace('/masuk');
            return;
          }
          throw new Error('Failed to load data');
        }
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
        router.replace('/masuk');
      } finally {
        setLoading(false);
      }
    }

    async function fetchWargaList() {
      try {
        const res = await fetch('/api/warga/list');
        if (res.ok) {
          const json = await res.json();
          const wargaData = json.warga || [];
          console.log('Warga list loaded:', wargaData);
          setWargaList(wargaData);
        }
      } catch (err) {
        console.error('Error fetching warga list:', err);
      }
    }

    fetchData();
    fetchWargaList();
  }, [router]);

  useEffect(() => {
    if (showInputModal) {
      const currentBulan = bulanList[new Date().getMonth()];
      const currentTahun = new Date().getFullYear();
      setFormData({
        namawarga: '',
        bulan: currentBulan,
        tahun: currentTahun,
        jumlah: '40000',
        status: 'lunas',
      });
    }
  }, [showInputModal]);

  function handleWargaSelect(idwarga: string) {
    const selected = wargaList.find((w) => w.idwarga === idwarga);
    setSelectedWargaId(idwarga);
    setSelectedWargaName(selected?.namawarga || '');
    setFormData({ ...formData, namawarga: selected?.namawarga || '' });
  }

  async function handleSubmitIuran(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedWargaId) {
      alert('Pilih warga terlebih dahulu');
      return;
    }
    try {
      const submitData = {
        wargaid: selectedWargaId,
        namawarga: selectedWargaName,
        bulan: formData.bulan,
        tahun: formData.tahun,
        jumlah: formData.jumlah,
        status: formData.status,
      };
      console.log('Submitting iuran:', submitData);
      console.log('SelectedWargaId:', selectedWargaId, 'SelectedWargaName:', selectedWargaName);
      const res = await fetch('/api/iuran/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      if (!res.ok) {
        const json = await res.json();
        alert(json.error || 'Gagal menambah iuran');
        return;
      }

      alert('Iuran berhasil ditambahkan');
      setShowInputModal(false);
      setSelectedWargaId('');
      setFormData({ namawarga: '', bulan: '', tahun: new Date().getFullYear(), jumlah: '40000', status: 'lunas' });

      const refreshRes = await fetch('/api/iuran/list');
      if (refreshRes.ok) {
        setData(await refreshRes.json());
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Terjadi kesalahan');
    }
  }

  function handleOpenEdit(item: any) {
    setSelectedIuran(item);
    setEditData({
      bulan: item.bulan,
      tahun: item.tahun,
      jumlah: String(item.jumlah),
      status: item.status,
    });
    setShowEditModal(true);
    setSubmitMessage(null);
  }

  async function handleSubmitEdit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitMessage(null);
    if (!selectedIuran) return;

    try {
      const res = await fetch('/api/iuran/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          iduran: selectedIuran.iduran || selectedIuran.id,
          bulan: editData.bulan,
          tahun: editData.tahun,
          jumlah: editData.jumlah,
          status: editData.status,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      setSubmitMessage({ type: 'success', text: '✓ Iuran berhasil diperbarui' });
      setShowEditModal(false);

      const refreshRes = await fetch('/api/iuran/list');
      if (refreshRes.ok) {
        setData(await refreshRes.json());
      }
    } catch (err) {
      setSubmitMessage({ type: 'error', text: err instanceof Error ? err.message : 'Gagal perbarui iuran' });
    }
  }

  async function handleDeleteIuran(iduran: number, nama: string) {
    if (!confirm(`Yakin hapus iuran "${nama}"?`)) return;

    try {
      const res = await fetch('/api/iuran/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ iduran }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      const refreshRes = await fetch('/api/iuran/list');
      if (refreshRes.ok) {
        setData(await refreshRes.json());
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Gagal hapus iuran');
    }
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.replace('/masuk');
  }

  if (loading) return <div style={{ padding: '20px' }}>Loading...</div>;
  if (error) return <div style={{ padding: '20px' }}>Error: {error}</div>;
  if (!data) return null;

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
            onClick={() => router.push('/')}
          >
            <div className="nav-dot"></div>
            ← Kembali
          </button>
        </nav>

        <div className="sidebar-profile">
          <div className="avatar"></div>
          <div>
            <div className="sidebar-profile-name">{data.displayName || 'User'}</div>
            <div className="sidebar-profile-role">{data.userRole || 'User'}</div>
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
          <h2>Iuran Warga</h2>
          <p>Kelola data iuran warga bulanan</p>

          <button
            className="btn-primary"
            onClick={() => setShowInputModal(true)}
            style={{ marginBottom: '20px' }}
          >
            + Input Iuran
          </button>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Nama Warga</th>
                  <th>Bulan</th>
                  <th>Tahun</th>
                  <th>Jumlah</th>
                  <th>Status</th>
                  <th>Tanggal Bayar</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {data.iuran.map((item, i) => (
                  <tr key={i}>
                    <td>
                      🏠 {item.namawarga}
                    </td>
                    <td>{item.bulan}</td>
                    <td>{item.tahun}</td>
                    <td>Rp {Number(item.jumlah).toLocaleString('id-ID')}</td>
                    <td>
                      {item.status === 'lunas' ? (
                        <span className="badge badge-success">✓ Lunas</span>
                      ) : item.status === 'terlambat' ? (
                        <span className="badge badge-warning">⚠ Terlambat</span>
                      ) : (
                        <span className="badge badge-danger">● Belum bayar</span>
                      )}
                    </td>
                    <td>
                      {item.tanggal_bayar
                        ? new Date(item.tanggal_bayar).toLocaleDateString('id-ID')
                        : '-'}
                    </td>
                    <td style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        style={{
                          padding: '4px 12px',
                          fontSize: '12px',
                          backgroundColor: '#2563eb',
                          color: 'white',
                          border: 'none',
                          borderRadius: '3px',
                          cursor: 'pointer',
                        }}
                        onClick={() => handleOpenEdit(item)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        style={{
                          padding: '4px 12px',
                          fontSize: '12px',
                          backgroundColor: '#dc2626',
                          color: 'white',
                          border: 'none',
                          borderRadius: '3px',
                          cursor: 'pointer',
                        }}
                        onClick={() => handleDeleteIuran(item.iduran, item.namawarga)}
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

      {showInputModal && (
        <div className="modal-overlay" onClick={() => {
          setShowInputModal(false);
          setSelectedWargaId('');
          setFormData({ namawarga: '', bulan: '', tahun: new Date().getFullYear(), jumlah: '40000', status: 'lunas' });
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Input Iuran Warga</h2>
            <form onSubmit={handleSubmitIuran}>
              <div className="form-group">
                <label>Nama Warga *</label>
                <select
                  value={selectedWargaId}
                  onChange={(e) => handleWargaSelect(e.target.value)}
                  required
                >
                  <option value="">Pilih Warga</option>
                  {wargaList.map((warga) => (
                    <option key={warga.idwarga} value={warga.idwarga}>
                      {warga.namawarga}
                    </option>
                  ))}
                </select>
              </div>

              {selectedWargaId && (
                <div className="form-group">
                  <label>ID Warga</label>
                  <input
                    type="text"
                    value={selectedWargaId}
                    disabled
                    style={{
                      backgroundColor: '#f5f5f5',
                      cursor: 'not-allowed',
                    }}
                  />
                </div>
              )}

              <div className="form-group">
                <label>Bulan *</label>
                <select
                  value={formData.bulan}
                  onChange={(e) => setFormData({ ...formData, bulan: e.target.value })}
                  required
                >
                  <option value="">Pilih Bulan</option>
                  {bulanList.map((bulan) => (
                    <option key={bulan} value={bulan}>
                      {bulan}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Tahun *</label>
                <input
                  type="number"
                  value={formData.tahun}
                  onChange={(e) => setFormData({ ...formData, tahun: parseInt(e.target.value) })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Jumlah Iuran (Rp) *</label>
                <input
                  type="number"
                  value={formData.jumlah}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    setFormData({ ...formData, jumlah: value });
                  }}
                  min="0"
                  step="1"
                  required
                />
              </div>

              <div className="form-group">
                <label>Status *</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  required
                >
                  <option value="belum">Belum Bayar</option>
                  <option value="lunas">Sudah Bayar</option>
                </select>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => {
                  setShowInputModal(false);
                  setSelectedWargaId('');
                  setFormData({ namawarga: '', bulan: '', tahun: new Date().getFullYear(), jumlah: '40000', status: 'lunas' });
                }}>
                  Batal
                </button>
                <button type="submit" className="btn-primary">
                  Simpan Iuran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && selectedIuran && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Edit Iuran Warga</h2>
            <p>Nama: {selectedIuran.namawarga}</p>
            <form onSubmit={handleSubmitEdit}>
              <div className="form-group">
                <label>Bulan *</label>
                <select
                  value={editData.bulan}
                  onChange={(e) => setEditData({ ...editData, bulan: e.target.value })}
                  required
                >
                  <option value="">Pilih Bulan</option>
                  {bulanList.map((bulan) => (
                    <option key={bulan} value={bulan}>
                      {bulan}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Tahun *</label>
                <input
                  type="number"
                  value={editData.tahun}
                  onChange={(e) => setEditData({ ...editData, tahun: parseInt(e.target.value) })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Jumlah Iuran (Rp) *</label>
                <input
                  type="number"
                  value={editData.jumlah}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    setEditData({ ...editData, jumlah: value });
                  }}
                  min="0"
                  step="1"
                  required
                />
              </div>

              <div className="form-group">
                <label>Status *</label>
                <select
                  value={editData.status}
                  onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                  required
                >
                  <option value="belum">Belum Bayar</option>
                  <option value="lunas">Sudah Bayar</option>
                </select>
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
                <button type="button" className="btn-secondary" onClick={() => setShowEditModal(false)}>
                  Batal
                </button>
                <button type="submit" className="btn-primary">
                  Simpan Perubahan
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

        .form-group input,
        .form-group select {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
          box-sizing: border-box;
        }

        .form-group input:focus,
        .form-group select:focus {
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

        .table-wrapper {
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        thead {
          background: #f5f5f5;
        }

        th {
          padding: 12px;
          text-align: left;
          font-weight: 600;
          border-bottom: 2px solid #ddd;
        }

        td {
          padding: 12px;
          border-bottom: 1px solid #eee;
        }

        tr:hover {
          background: #fafafa;
        }

        .badge {
          padding: 4px 8px;
          border-radius: 3px;
          font-size: 12px;
          font-weight: 600;
        }

        .badge-success {
          background: #d4edda;
          color: #155724;
        }

        .badge-warning {
          background: #fff3cd;
          color: #856404;
        }

        .badge-danger {
          background: #f8d7da;
          color: #721c24;
        }
      `}</style>
    </div>
  );
}
