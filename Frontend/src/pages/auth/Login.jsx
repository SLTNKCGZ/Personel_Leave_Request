import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import api from '../../services/api';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // FastAPI /auth/token endpointi genelde Form Data bekler
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);

      const response = await api.post('/auth/token', formData);

      // Token'ı localStorage'a kaydet
      localStorage.setItem('access_token', response.data.access_token);

      // JWT'den role'ü çıkar ve kaydet
      const decoded = jwtDecode(response.data.access_token);
      localStorage.setItem('user_role', decoded.role);

      // Ana sayfaya yönlendir
      window.location.href = '/';
    } catch (err) {
      console.error('Giriş hatası:', err.response?.data || err.message);
      setError('Kullanıcı adı veya şifre hatalı.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full border border-gray-100">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Sisteme Giriş</h2>
        
        {error && <div className="mb-5 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kullanıcı Adı</label>
            <input 
              type="text" 
              required
              className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Şifre</label>
            <input 
              type="password" 
              required
              className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 font-semibold transition disabled:opacity-70"
          >
            {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>
        
        <div className="mt-6 text-center text-sm text-gray-600">
          Hesabın yok mu? <Link to="/register" className="text-blue-600 hover:underline font-medium">Kayıt Ol</Link>
        </div>
      </div>
    </div>
  );
}