import { useState } from 'react';
import { Calendar as CalendarIcon, Clock, CheckCircle } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { es } from 'date-fns/locale';

export default function PublicBooking() {
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', comments: '' });

  // Generate some fake next dates
  const dates = Array.from({ length: 5 }).map((_, i) => addDays(new Date(), i + 1));
  const times = ['09:00', '10:30', '14:00', '16:00', '17:30'];

  const handleBooking = (e) => {
    e.preventDefault();
    setStep(3); // Go to success
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: 'var(--card-bg)', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.08)', overflow: 'hidden', width: '100%', maxWidth: '900px', display: 'flex', flexDirection: window.innerWidth < 768 ? 'column' : 'row' }}>
        
        {/* Left Side: Nutri Info */}
        <div style={{ padding: '40px', borderRight: '1px solid var(--border-color)', minWidth: '300px', background: 'var(--table-hover)' }}>
          <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <img src="/logo.png" alt="NutriApp Logo" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: '50%', border: '3px solid var(--primary)', backgroundColor: 'white' }} />
          </div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '8px', textAlign: 'center' }}>Dr. A. Nutrición</h2>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '24px', textAlign: 'center' }}>Primera Consulta (Evaluación)</h3>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
            <Clock size={20} />
            <span>45 minutos</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-muted)', marginBottom: '24px' }}>
            <CalendarIcon size={20} />
            <span>Videollamada o Presencial</span>
          </div>
          
          <p style={{ lineHeight: 1.6, color: 'var(--text-main)', fontSize: '0.9rem' }}>
            Reserva una primera consulta donde evaluaremos tu estado inicial, estudiaremos tu composición corporal y trazaremos tu nuevo plan de alimentación.
          </p>
        </div>

        {/* Right Side: Interactive */}
        <div style={{ padding: '40px', flex: 1 }}>
          {step === 1 && (
            <div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '24px', fontWeight: 600 }}>Selecciona una fecha y hora</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '12px', marginBottom: '32px' }}>
                {dates.map((date, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setSelectedDate(date)}
                    style={{ 
                      padding: '16px', borderRadius: '12px', border: selectedDate === date ? '2px solid var(--primary)' : '1px solid var(--border-color)', 
                      background: selectedDate === date ? 'rgba(16, 185, 129, 0.05)' : 'transparent',
                      textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>{format(date, 'MMM', { locale: es })}</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>{format(date, 'd')}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{format(date, 'EEEE', { locale: es })}</div>
                  </button>
                ))}
              </div>

              {selectedDate && (
                <div style={{ animation: 'toastIn 0.3s ease' }}>
                  <h4 style={{ fontSize: '1rem', marginBottom: '16px' }}>Horas disponibles el {format(selectedDate, "d 'de' MMMM", { locale: es })}</h4>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {times.map(time => (
                      <button 
                        key={time}
                        onClick={() => { setSelectedTime(time); setStep(2); }}
                        style={{ padding: '12px 24px', borderRadius: '999px', border: '1px solid var(--primary)', color: 'var(--primary)', background: 'transparent', fontWeight: 600, cursor: 'pointer' }}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div style={{ animation: 'toastIn 0.3s ease' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                <button onClick={() => setStep(1)} style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }}>← Volver</button>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>Tus datos</h3>
              </div>
              
              <div style={{ padding: '16px', background: 'var(--table-hover)', borderRadius: '12px', marginBottom: '24px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                <CalendarIcon size={20} color="var(--primary)" />
                <span style={{ fontWeight: 500 }}>{format(selectedDate, "EEEE, d 'de' MMMM", { locale: es })} a las {selectedTime}</span>
              </div>

              <form onSubmit={handleBooking} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '8px', fontWeight: 500 }}>Nombre Completo *</label>
                    <input type="text" required style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-main)', fontFamily: 'inherit' }} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '8px', fontWeight: 500 }}>Correo Electrónico *</label>
                    <input type="email" required style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-main)', fontFamily: 'inherit' }} value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '8px', fontWeight: 500 }}>¿Cuál es tu objetivo nutricional? (Opcional)</label>
                  <textarea rows="3" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-main)', fontFamily: 'inherit', resize: 'vertical' }} value={formData.comments} onChange={e => setFormData({...formData, comments: e.target.value})} placeholder="Ej: Pérdida de peso, recomposición corporal, nutrición deportiva..."></textarea>
                </div>
                <button type="submit" style={{ padding: '16px', borderRadius: '8px', background: 'var(--primary)', color: 'white', fontWeight: 600, fontSize: '1rem', border: 'none', cursor: 'pointer', marginTop: '16px' }}>
                  Confirmar Reserva
                </button>
              </form>
            </div>
          )}

          {step === 3 && (
            <div style={{ textAlign: 'center', padding: '40px 20px', animation: 'toastIn 0.5s ease' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#d1fae5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <CheckCircle size={40} />
              </div>
              <h2 style={{ fontSize: '1.75rem', marginBottom: '16px' }}>¡Reserva Confirmada!</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '24px' }}>
                He enviado los detalles a tu correo electrónico, junto con un pequeño formulario pre-consulta.
              </p>
              <div style={{ padding: '16px', background: 'var(--table-hover)', borderRadius: '12px', display: 'inline-block', textAlign: 'left' }}>
                <div style={{ fontWeight: 600, marginBottom: '8px' }}>Paciente: {formData.name}</div>
                <div style={{ color: 'var(--text-muted)' }}>{format(selectedDate, "EEEE, d 'de' MMMM", { locale: es })} a las {selectedTime}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
