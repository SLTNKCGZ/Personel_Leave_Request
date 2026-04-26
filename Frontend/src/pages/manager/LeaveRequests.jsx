import { useEffect, useState } from 'react';
import api from '../../services/api';

export default function LeaveRequests() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Sayfa yüklendiğinde tüm izin taleplerini çek
  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      // Backend'deki GET /yonetici/izin uç noktasına istek atıyoruz
      const response = await api.get('/yonetici/izin');
      setLeaves(response.data);
    } catch (err) {
      console.error("İzinler çekilirken hata oluştu:", err);
      setError('İzin talepleri yüklenirken bir sorun oluştu.');
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

  // Onayla veya Reddet butonuna basıldığında çalışacak fonksiyon
  const handleStatusUpdate = async (id, newStatus) => {
    try {
      // Backend'deki PUT /yonetici/izin_durum/{id} uç noktasına istek atıyoruz
      await api.put(`/yonetici/izin_durum/${id}`, { updated_status: newStatus });
      
      // İstek başarılı olursa sayfayı yenilemeden tablodaki veriyi anlık güncelle
      setLeaves(leaves.map(leave => 
        leave.id === id ? { ...leave, status: newStatus } : leave
      ));
    } catch (error) {
      alert("İşlem sırasında bir hata oluştu! Yetkiniz olmayabilir.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl font-semibold text-gray-500 animate-pulse">İzinler Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto mt-8 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Personel İzin Talepleri (Yönetici Paneli)</h2>
      </div>

      {error && <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>}
      
      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 uppercase tracking-wider border-b-2 border-gray-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-600">Kullanıcı Adı</th>
                <th className="px-6 py-4 font-semibold text-gray-600">İzin Türü</th>
                <th className="px-6 py-4 font-semibold text-gray-600">Tarih Aralığı</th>
                <th className="px-6 py-4 font-semibold text-gray-600">Açıklama</th>
                <th className="px-6 py-4 font-semibold text-gray-600">Durum</th>
                <th className="px-6 py-4 font-semibold text-gray-600 text-center">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {leaves.map((leave) => (
                <tr key={leave.id} className="hover:bg-blue-50/50 transition duration-150">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {leave.first_name.toUpperCase()} {leave.last_name.toUpperCase()}
                  </td>
                  <td className="px-6 py-4 text-gray-700">{leave.request_type}</td>
                  <td className="px-6 py-4 text-gray-700">{formatDate(leave.start_date)}</td>
                  <td className="px-6 py-4 text-gray-700">{formatDate(leave.end_date)}</td>
                  <td className="px-6 py-4 text-gray-500 truncate max-w-[200px]" title={leave.description}>
                    {leave.description || '-'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold tracking-wide
                      ${leave.status === 'Onaylandı' ? 'bg-green-100 text-green-700' : 
                        leave.status === 'Reddedildi' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {leave.status || 'Onay Bekliyor'}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex justify-center gap-2">
                    {/* Yalnızca "Beklemede" olan veya statüsü boş olan izinler için butonları göster */}
                    {(leave.status === 'Onay Bekliyor' || !leave.status) ? (
                      <>
                        <button 
                          onClick={() => handleStatusUpdate(leave.id, 'Onaylandı')}
                          className="px-4 py-1.5 bg-green-500 hover:bg-green-600 text-white font-medium rounded shadow-sm transition active:scale-95"
                        >
                          Onayla
                        </button>
                        <button 
                          onClick={() => handleStatusUpdate(leave.id, 'Reddedildi')}
                          className="px-4 py-1.5 bg-red-500 hover:bg-red-600 text-white font-medium rounded shadow-sm transition active:scale-95"
                        >
                          Reddet
                        </button>
                      </>
                    ) : (
                      <span className="text-gray-400 text-xs font-medium italic">İşlem Yapıldı</span>
                    )}
                  </td>
                </tr>
              ))}
              
              {/* Eğer hiç veri yoksa gösterilecek boş durum tasarımı */}
              {leaves.length === 0 && !loading && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      <p className="text-lg">Sistemde henüz bir izin talebi bulunmuyor.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}