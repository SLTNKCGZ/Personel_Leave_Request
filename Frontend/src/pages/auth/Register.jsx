import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    first_name: '', // Backend beklediği için ekledik
    last_name: '',  // Backend beklediği için ekledik
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Backend'in beklediği tam paket (Payload)
      const payload = {
        ...formData,
        role: "Personel" // Rolü hala otomatik Personel yapıyoruz
      };

      await api.post('/auth/', payload);
      alert("Kayıt başarılı! Lütfen giriş yapın.");
      navigate('/login');
    } catch (err) {
      setError('Kayıt olurken bir hata yaşandı. Eksik alan bırakmadığınızdan emin olun.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full border border-gray-100">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Personel Kaydı</h2>
        
        {error && <div className="mb-5 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">{error}</div>}

        <form onSubmit={handleRegister} className="space-y-4">
          {/* Ad Alanı */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ad</label>
            <input 
              type="text" required
              className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.first_name}
              onChange={(e) => setFormData({...formData, first_name: e.target.value})}
            />
          </div>

          {/* Soyad Alanı */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Soyad</label>
            <input 
              type="text" required
              className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.last_name}
              onChange={(e) => setFormData({...formData, last_name: e.target.value})}
            />
          </div>

          {/* Kullanıcı Adı */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kullanıcı Adı</label>
            <input 
              type="text" required
              className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
            />
          </div>

          {/* Şifre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Şifre</label>
            <input 
              type="password" required
              className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-green-600 text-white py-2.5 rounded-lg hover:bg-green-700 font-semibold transition disabled:opacity-70 mt-2"
          >
            {loading ? 'Kayıt Yapılıyor...' : 'Kayıt Ol'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          Zaten hesabın var mı? <Link to="/login" className="text-blue-600 hover:underline font-medium">Giriş Yap</Link>
        </div>
      </div>
    </div>
  );
}