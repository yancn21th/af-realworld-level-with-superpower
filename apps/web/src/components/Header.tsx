import { Link, NavLink } from 'react-router';
import { useAuth } from '../context/AuthContext.js';

export default function Header() {
  const { user } = useAuth();
  return (
    <header
      data-testid="header"
      className="sticky top-0 z-50 w-full bg-surface-white border-b border-border-light"
      style={{ boxShadow: 'rgba(0, 0, 0, 0.04) 0px 1px 4px' }}
    >
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link to="/" className="font-display text-xl font-semibold text-text-dark tracking-tight">
          conduit
        </Link>
        <nav className="flex items-center gap-1">
          <NavLink to="/" end className={({ isActive }) =>
            `px-4 py-1.5 font-sans text-nav font-medium transition-colors rounded-pill ${isActive ? 'bg-black/5 text-text-dark' : 'text-text-secondary hover:text-text-dark hover:bg-black/[0.03]'}`
          }>Home</NavLink>
          {user ? (
            <>
              <NavLink to="/editor" className={({ isActive }) =>
                `px-4 py-1.5 font-sans text-nav font-medium transition-colors rounded-pill ${isActive ? 'bg-black/5 text-text-dark' : 'text-text-secondary hover:text-text-dark hover:bg-black/[0.03]'}`
              }>New Article</NavLink>
              <NavLink to="/settings" className={({ isActive }) =>
                `px-4 py-1.5 font-sans text-nav font-medium transition-colors rounded-pill ${isActive ? 'bg-black/5 text-text-dark' : 'text-text-secondary hover:text-text-dark hover:bg-black/[0.03]'}`
              }>Settings</NavLink>
              <NavLink to={`/profile/${user.username}`} className={({ isActive }) =>
                `px-4 py-1.5 font-sans text-nav font-medium transition-colors rounded-pill ${isActive ? 'bg-black/5 text-text-dark' : 'text-text-secondary hover:text-text-dark hover:bg-black/[0.03]'}`
              }>{user.username}</NavLink>
            </>
          ) : (
            <>
              <NavLink to="/login" className={({ isActive }) =>
                `px-4 py-1.5 font-sans text-nav font-medium transition-colors rounded-pill ${isActive ? 'bg-black/5 text-text-dark' : 'text-text-secondary hover:text-text-dark hover:bg-black/[0.03]'}`
              }>Sign in</NavLink>
              <NavLink to="/register" className={({ isActive }) =>
                `px-4 py-1.5 font-sans text-nav font-medium transition-colors rounded-pill ${isActive ? 'bg-black/5 text-text-dark' : 'text-text-secondary hover:text-text-dark hover:bg-black/[0.03]'}`
              }>Sign up</NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
