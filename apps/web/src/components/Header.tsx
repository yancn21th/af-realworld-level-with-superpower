import { Link, NavLink } from 'react-router';
import { useAuth } from '../context/AuthContext.js';

export default function Header() {
  const { user } = useAuth();
  return (
    <nav className="navbar navbar-light">
      <div className="container">
        <Link className="navbar-brand" to="/">conduit</Link>
        <ul className="nav navbar-nav pull-xs-right">
          <li className="nav-item"><NavLink className="nav-link" to="/">Home</NavLink></li>
          {user ? (
            <>
              <li className="nav-item"><NavLink className="nav-link" to="/editor"><i className="ion-compose" />&nbsp;New Article</NavLink></li>
              <li className="nav-item"><NavLink className="nav-link" to="/settings"><i className="ion-gear-a" />&nbsp;Settings</NavLink></li>
              <li className="nav-item"><NavLink className="nav-link" to={`/profile/${user.username}`}>{user.username}</NavLink></li>
            </>
          ) : (
            <>
              <li className="nav-item"><NavLink className="nav-link" to="/login">Sign in</NavLink></li>
              <li className="nav-item"><NavLink className="nav-link" to="/register">Sign up</NavLink></li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}
