import { Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import CreateLeave from './pages/employee/CreateLeave';
import MyLeaves from './pages/employee/MyLeaves';
import LeaveRequests from './pages/manager/LeaveRequests';

function App() {
  const navigate = useNavigate();
  
  // Tarayıcı hafızasından giriş bilgilerini alıyoruz
  const token = localStorage.getItem('access_token');
  const role = localStorage.getItem('user_role'); // 'Yönetici' veya 'Personel'
  
  const handleLogout = () => {
    localStorage.clear(); // Token ve rol bilgisini temizle
    navigate('/login');
    window.location.reload(); // State'i sıfırlamak için sayfayı yenile
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar - Üst Menü */}
      <nav className="bg-blue-900 p-4 text-white shadow-lg">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link to="/" className="text-xl font-bold tracking-tight">HR İzin Sistemi</Link>
          
          <div className="flex gap-6 items-center font-medium">
            {token ? (
              <>
                {role === 'Yönetici' ? (
                  <Link to="/manager/leaves" className="hover:text-blue-300 transition"></Link>
                ) : (
                  /* PERSONEL ise İzinlerim ve Talep Et ekranlarını görsün */
                  <>
                    <Link to="/employee/my-leaves" className="hover:text-blue-300 transition">İzinlerim</Link>
                    <Link to="/employee/create-leave" className="hover:text-blue-300 transition">İzin Talep Et</Link>
                  </>
                )}
                
                <button 
                  onClick={handleLogout} 
                  className="bg-red-500 hover:bg-red-600 px-4 py-1.5 rounded-md transition text-sm shadow-sm"
                >
                  Çıkış Yap
                </button>
              </>
            ) : (
              <div className="flex gap-4">
                <Link to="/login" className="hover:text-blue-300 transition">Giriş Yap</Link>
                <Link to="/register" className="bg-green-600 px-4 py-1.5 rounded-md hover:bg-green-700 transition">Kayıt Ol</Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Sayfa İçerikleri ve Rotalar */}
      <main className="p-4 max-w-7xl mx-auto">
        <Routes>
          {/* Giriş ve Kayıt Sayfaları */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Giriş yapılmışsa role göre ana sayfa yönlendirmesi */}
          <Route 
            path="/" 
            element={
              token ? (
                role === 'Yönetici' ? <Navigate to="/manager/leaves" /> : <Navigate to="/employee/my-leaves" />
              ) : (
                <Navigate to="/login" />
              )
            } 
          />

          {/* Personel Rotaları */}
          <Route path="/employee/my-leaves" element={<MyLeaves />} />
          <Route path="/employee/create-leave" element={<CreateLeave />} />

          {/* Yönetici Rotaları */}
          <Route path="/manager/leaves" element={<LeaveRequests />} />
          
          {/* Yanlış bir URL girilirse ana sayfaya at */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;