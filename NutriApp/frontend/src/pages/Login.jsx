import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Leaf, ShieldCheck } from 'lucide-react';
import api from '../lib/api';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('nutri@demo.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      navigate('/');
      window.location.reload();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'No se pudo iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-shell">
      <section className="login-hero">
        <div className="login-hero-card">
          <span className="hero-pill">Demo vendible para nutricionistas</span>
          <h1>Pacientes, consultas y seguimiento en un panel simple y profesional.</h1>
          <p>
            Una demo pensada para enseñar orden, claridad y ahorro de tiempo desde el primer vistazo.
          </p>

          <div className="hero-points">
            <div>
              <Leaf size={18} />
              <span>Ficha de paciente con evolución real</span>
            </div>
            <div>
              <ShieldCheck size={18} />
              <span>Agenda semanal clara para consulta independiente</span>
            </div>
          </div>
        </div>
      </section>

      <section className="login-panel">
        <form className="login-card" onSubmit={handleLogin}>
          <span className="eyebrow">Acceso demo</span>
          <h2>Entra en NutriApp</h2>
          <p>Usa las credenciales precargadas para enseñar el flujo completo del MVP.</p>

          {error ? <div className="alert-error">{error}</div> : null}

          <label>
            Email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>

          <label>
            Contraseña
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </label>

          <button type="submit" className="primary-button full-width" disabled={isLoading}>
            {isLoading ? 'Entrando...' : 'Abrir dashboard'}
            <ArrowRight size={16} />
          </button>

          <div className="demo-access">
            <strong>Demo:</strong> nutri@demo.com / admin123
          </div>
        </form>
      </section>
    </div>
  );
}
