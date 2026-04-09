import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.js';
import ErrorMessages from '../components/ErrorMessages.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

export default function Register() {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string[]> | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrors(null);
    try {
      const res = await api.register(username, email, password);
      setUser(res.user);
      navigate('/');
    } catch (err: any) {
      setErrors(err?.errors ?? { '': ['Something went wrong'] });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div data-testid="register-page" className="min-h-screen bg-surface-white flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display text-[32px] font-semibold text-text-dark leading-tight">Sign up</h1>
          <p className="mt-2 font-sans text-base text-text-secondary leading-body">
            Have an account?{' '}
            <Link to="/login" className="text-brand-blue hover:text-primary-700 font-medium">Sign in</Link>
          </p>
        </div>
        <Card className="border-border-light shadow-card rounded-card">
          <CardContent className="p-8">
            <ErrorMessages errors={errors} />
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="username" className="font-sans text-sm font-medium text-text-dark">Username</Label>
                <Input id="username" type="text" placeholder="Your name" value={username}
                  onChange={e => setUsername(e.target.value)} required
                  className="h-11 rounded-btn border-border-gray font-sans text-base text-text-dark focus-visible:ring-brand-blue" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="font-sans text-sm font-medium text-text-dark">Email</Label>
                <Input id="email" type="email" placeholder="you@example.com" value={email}
                  onChange={e => setEmail(e.target.value)} required
                  className="h-11 rounded-btn border-border-gray font-sans text-base text-text-dark focus-visible:ring-brand-blue" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="font-sans text-sm font-medium text-text-dark">Password</Label>
                <Input id="password" type="password" placeholder="Choose a password" value={password}
                  onChange={e => setPassword(e.target.value)} required
                  className="h-11 rounded-btn border-border-gray font-sans text-base text-text-dark focus-visible:ring-brand-blue" />
              </div>
              <Button type="submit" disabled={loading}
                className="w-full h-11 bg-text-charcoal hover:bg-text-dark text-white font-sans font-semibold rounded-btn transition-colors">
                {loading ? 'Signing up...' : 'Sign up'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
