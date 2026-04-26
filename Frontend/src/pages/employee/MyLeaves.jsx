import { useEffect, useState } from 'react';
import api from '../../services/api';
import { Link } from 'react-router-dom';

export default function MyLeaves() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Düzenleme modu için state'ler
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    request_type: '',
    start_date: '',
    end_date: '',
    description: ''
  });

  useEffect(() => {
    fetchMyLeaves();
  }, []);

  const fetchMyLeaves = async () => {
    try {
      const response = await api.get('/personel_izin/izin');
      setLeaves(response.data);
    } catch (err) {
      setError("İzin bilgileriniz yüklenirken bir sorun oluştu.");
    } finally {
      setLoading(false);
    }
  };
 
  const formatDate = (dateString) => {
   if (!dateString) return "-";
   const date = new Date(dateString);
   return new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
   }).format(date);
  };

  // --- SİLME İŞLEMİ ---
  const handleDelete = async (id) => {
    if (!window.confirm("Bu izin talebini silmek istediğinize emin misiniz?")) return;
    
    try {
      await api.delete(`/personel_izin/izin_sil/${id}`);
      setLeaves(leaves.filter(l => l.id !== id)); // Listeden anlık çıkar
      alert("Talep başarıyla silindi.");
    } catch (err) {
      alert("Silme işlemi başarısız. Onaylanmış izinler silinemez.");
    }
  };

  // --- GÜNCELLEME BAŞLATMA ---
  const startEdit = (leave) => {
    setEditingId(leave.id);
    setEditFormData({
      request_type: leave.request_type,
      start_date: leave.start_date,
      end_date: leave.end_date,
      description: leave.description || ''
    });
  };

  // --- GÜNCELLEME KAYDETME ---
  const handleUpdate = async (id) => {
    try {
      await api.put(`/personel_izin/izin_guncelle/${id}`, editFormData);
      setEditingId(null);
      fetchMyLeaves(); // Listeyi yenile
      alert("Başarıyla güncellendi.");
    } catch (err) {
      alert("Güncelleme başarısız. Bilgileri kontrol edin.");
    }
  };

  if (loading) return <div className="p-10 text-center">Yükleniyor...</div>;

  return (
    <div className="max-w-6xl mx-auto mt-8 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">İzin Taleplerim ve Yönetimi</h2>
        <Link to="/employee/create-leave" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 shadow transition">
          + Yeni İzin İste
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 font-semibold">Tür</th>
              <th className="px-6 py-4 font-semibold">Başlangıç Tarihi</th>
              <th className="px-6 py-4 font-semibold">Bitiş Tarihi</th>
              <th className="px-6 py-4 font-semibold">Açıklama</th>
              <th className="px-6 py-4 font-semibold">Durum</th>
              <th className="px-6 py-4 font-semibold">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {leaves.map((leave) => (
              <tr key={leave.id} className="hover:bg-gray-50">
                {editingId === leave.id ? (
                  /* --- DÜZENLEME MODU GÖRÜNÜMÜ --- */
                  <>
                    <td className="px-4 py-2">
                      <select 
                        className="border rounded p-1 w-full"
                        value={editFormData.request_type}
                        onChange={(e) => setEditFormData({...editFormData, request_type: e.target.value})}
                      >
                        <option value="Yıllık İzin">Yıllık İzin</option>
                        <option value="Sağlık İzni">Sağlık İzni</option>
                        <option value="Mazeret İzni">Mazeret İzni</option>
                      </select>
                    </td>
                    <td className="px-4 py-2 flex flex-col gap-1">
                      <input type="date" className="border rounded p-1 text-xs" value={editFormData.start_date} onChange={(e) => setEditFormData({...editFormData, start_date: e.target.value})} />
                      <input type="date" className="border rounded p-1 text-xs" value={editFormData.end_date} onChange={(e) => setEditFormData({...editFormData, end_date: e.target.value})} />
                    </td>
                    <td className="px-4 py-2">
                      <input type="text" className="border rounded p-1 w-full" value={editFormData.description} onChange={(e) => setEditFormData({...editFormData, description: e.target.value})} />
                    </td>
                    <td className="px-4 py-2 text-gray-400">Düzenleniyor...</td>
                    <td className="px-4 py-2">
                      <div className="flex gap-2">
                        <button onClick={() => handleUpdate(leave.id)} className="text-green-600 font-bold">Kaydet</button>
                        <button onClick={() => setEditingId(null)} className="text-gray-500">İptal</button>
                      </div>
                    </td>
                  </>
                ) : (
                  /* --- NORMAL GÖRÜNÜM --- */
                  <>
                    <td className="px-6 py-4 font-medium">{leave.request_type}</td>
                    <td className="px-6 py-4">{formatDate(leave.start_date)}</td>
                    <td className="px-6 py-4">{formatDate(leave.end_date)}</td>
                    <td className="px-6 py-4 truncate max-w-[150px]">{leave.description || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        leave.status === 'Onaylandı' ? 'bg-green-100 text-green-700' : 
                        leave.status === 'Reddedildi' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {leave.status || 'Onay Bekliyor'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {/* Sadece beklemede olanlar değiştirilebilir */}
                      {(!leave.status || leave.status === 'Onay Bekliyor') ? (
                        <div className="flex gap-3">
                          <button onClick={() => startEdit(leave)} className="text-blue-600 hover:text-blue-800 underline font-medium">Düzenle</button>
                          <button onClick={() => handleDelete(leave.id)} className="text-red-600 hover:text-red-800 underline font-medium">Sil</button>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs italic">Kilitli</span>
                      )}
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}