import { useState, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.js';
import ErrorMessages from '../components/ErrorMessages.js';

export default function Settings() {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();
  const [image, setImage] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string[]> | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    setImage(user.image ?? '');
    setUsername(user.username);
    setBio(user.bio ?? '');
    setEmail(user.email);
  }, [user]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrors(null);
    try {
      const data: any = { image, username, bio, email };
      if (password) data.password = password;
      const res = await api.updateUser(data);
      setUser(res.user);
      navigate(`/profile/${res.user.username}`);
    } catch (err: any) {
      setErrors(err?.errors ?? { '': ['Something went wrong'] });
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <div className="settings-page">
      <div className="container page">
        <div className="row">
          <div className="col-md-6 offset-md-3 col-xs-12">
            <h1 className="text-xs-center">Your Settings</h1>
            <ErrorMessages errors={errors} />
            <form onSubmit={handleSubmit}>
              <fieldset>
                <fieldset className="form-group">
                  <input className="form-control" type="text" placeholder="URL of profile picture" value={image} onChange={e => setImage(e.target.value)} />
                </fieldset>
                <fieldset className="form-group">
                  <input className="form-control form-control-lg" type="text" placeholder="Your Name" value={username} onChange={e => setUsername(e.target.value)} />
                </fieldset>
                <fieldset className="form-group">
                  <textarea className="form-control form-control-lg" rows={8} placeholder="Short bio about you" value={bio} onChange={e => setBio(e.target.value)} />
                </fieldset>
                <fieldset className="form-group">
                  <input className="form-control form-control-lg" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
                </fieldset>
                <fieldset className="form-group">
                  <input className="form-control form-control-lg" type="password" placeholder="New Password" value={password} onChange={e => setPassword(e.target.value)} />
                </fieldset>
                <button className="btn btn-lg btn-primary pull-xs-right" type="submit" disabled={loading}>
                  {loading ? 'Updating...' : 'Update Settings'}
                </button>
              </fieldset>
            </form>
            <hr />
            <button className="btn btn-outline-danger" onClick={handleLogout}>Or click here to logout.</button>
          </div>
        </div>
      </div>
    </div>
  );
}
