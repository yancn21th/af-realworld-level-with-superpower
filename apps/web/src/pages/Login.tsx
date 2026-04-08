import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.js';
import ErrorMessages from '../components/ErrorMessages.js';

export default function Login() {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string[]> | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrors(null);
    try {
      const res = await api.login(email, password);
      setUser(res.user);
      navigate('/');
    } catch (err: any) {
      setErrors(err?.errors ?? { '': ['Something went wrong'] });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="container page">
        <div className="row">
          <div className="col-md-6 offset-md-3 col-xs-12">
            <h1 className="text-xs-center">Sign in</h1>
            <p className="text-xs-center"><Link to="/register">Need an account?</Link></p>
            <ErrorMessages errors={errors} />
            <form onSubmit={handleSubmit}>
              <fieldset className="form-group">
                <input className="form-control form-control-lg" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
              </fieldset>
              <fieldset className="form-group">
                <input className="form-control form-control-lg" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
              </fieldset>
              <button className="btn btn-lg btn-primary pull-xs-right" type="submit" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
