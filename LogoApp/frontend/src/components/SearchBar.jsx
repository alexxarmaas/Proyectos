import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { mockPatients } from '../mockData';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);
  const navigate = useNavigate();

  const results = query.trim().length > 1
    ? mockPatients.filter(p =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.diagnosis.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (patient) => {
    setQuery('');
    setIsOpen(false);
    navigate('/pacientes', { state: { selectedPatientId: patient.id } });
  };

  return (
    <div className="search-wrapper" ref={wrapperRef}>
      <div className="search-input-wrapper">
        <Search size={16} className="search-icon-left" />
        <input
          id="global-search"
          type="text"
          className="search-input"
          placeholder="Buscar paciente..."
          value={query}
          onChange={e => { setQuery(e.target.value); setIsOpen(true); }}
          onFocus={() => setIsOpen(true)}
          autoComplete="off"
          aria-label="Búsqueda global de pacientes"
        />
      </div>

      {isOpen && query.trim().length > 1 && (
        <div className="search-dropdown" role="listbox">
          {results.length > 0 ? (
            results.map(patient => (
              <div
                key={patient.id}
                className="search-result-item"
                onClick={() => handleSelect(patient)}
                role="option"
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && handleSelect(patient)}
              >
                <div className="search-result-avatar">{patient.name.charAt(0)}</div>
                <div className="search-result-info">
                  <p>{patient.name}</p>
                  <span>{patient.diagnosis} · {patient.age} años</span>
                </div>
                <span
                  className={`badge ${patient.status === 'active' ? 'badge-success' : 'badge-neutral'}`}
                  style={{ marginLeft: 'auto', fontSize: '0.75rem' }}
                >
                  {patient.status === 'active' ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            ))
          ) : (
            <div className="search-no-results">No se encontraron resultados para "{query}"</div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
