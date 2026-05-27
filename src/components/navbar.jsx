import { Link } from 'react-router-dom'

const Navbar = ({ onPickFolder, importing }) => {
  return (
    <header className="navbar">
      <div className="navbar-brand">
        <span className="brand-mark">▲</span>
        <div>
          <div className="brand-title">GDrive Courses</div>
          <div className="brand-subtitle">Local + Drive playlists</div>
        </div>
      </div>
      <div className="navbar-actions">
        <Link className="secondary" to="/">
          Inicio
        </Link>
        <button className="primary" onClick={onPickFolder} disabled={importing}>
          {importing ? 'Cargando videos...' : 'Ejecutar en local'}
        </button>
      </div>
    </header>
  )
}

export default Navbar
