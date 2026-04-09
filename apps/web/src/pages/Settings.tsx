import { useState, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.js';
import ErrorMessages from '../components/ErrorMessages.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

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
    <div data-testid="settings-page" className="min-h-screen bg-surface-white py-10 px-4">
      <div className="max-w-lg mx-auto">
        <h1 className="font-display text-[32px] font-semibold text-text-dark mb-8">Your Settings</h1>
        <Card className="border-border-light shadow-card rounded-card">
          <CardContent className="p-8">
            <ErrorMessages errors={errors} />
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label className="font-sans text-sm font-medium text-text-dark">Profile Picture URL</Label>
                <Input type="text" placeholder="https://..." value={image} onChange={e => setImage(e.target.value)}
                  className="h-11 rounded-btn border-border-gray font-sans text-base" />
              </div>
              <div className="space-y-2">
                <Label className="font-sans text-sm font-medium text-text-dark">Username</Label>
                <Input type="text" placeholder="Your name" value={username} onChange={e => setUsername(e.target.value)}
                  className="h-11 rounded-btn border-border-gray font-sans text-base" />
              </div>
              <div className="space-y-2">
                <Label className="font-sans text-sm font-medium text-text-dark">Bio</Label>
                <Textarea rows={5} placeholder="Short bio about you" value={bio} onChange={e => setBio(e.target.value)}
                  className="rounded-btn border-border-gray font-sans text-base resize-y" />
              </div>
              <div className="space-y-2">
                <Label className="font-sans text-sm font-medium text-text-dark">Email</Label>
                <Input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)}
                  className="h-11 rounded-btn border-border-gray font-sans text-base" />
              </div>
              <div className="space-y-2">
                <Label className="font-sans text-sm font-medium text-text-dark">New Password</Label>
                <Input type="password" placeholder="Leave blank to keep current" value={password} onChange={e => setPassword(e.target.value)}
                  className="h-11 rounded-btn border-border-gray font-sans text-base" />
              </div>
              <div className="flex justify-end pt-2">
                <Button type="submit" disabled={loading}
                  className="px-8 h-11 bg-text-charcoal hover:bg-text-dark text-white font-sans font-semibold rounded-btn transition-colors">
                  {loading ? 'Updating...' : 'Update Settings'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        <Separator className="my-6" />
        <Button variant="outline" onClick={handleLogout}
          className="w-full h-11 rounded-btn border-destructive/40 text-destructive hover:bg-destructive/5 font-sans font-medium">
          Log out
        </Button>
      </div>
    </div>
  );
}
