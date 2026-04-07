import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Animales from './pages/Animales';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import Faq from './pages/Faq';
import Soporte from './pages/Soporte'; // <-- 1. Importamos Soporte

function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen">
        <Header />
        
        <main className="p-4 flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/animales" element={<Animales />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/faq" element={<Faq />} />
            
            {/* 2. Nueva ruta de Atención al Cliente */}
            <Route path="/soporte" element={<Soporte />} />
            
            <Route path="*" element={
              <div className="text-center mt-20">
                <h2 className="text-3xl font-retro text-pokeRed mb-4">Error 404</h2>
                <p className="text-xl font-bold">¡Un Snorlax salvaje bloquea el camino! La página no existe.</p>
              </div>
            } />
          </Routes>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;