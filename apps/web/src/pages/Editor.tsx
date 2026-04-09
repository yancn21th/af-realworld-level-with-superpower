import { useState, useEffect, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.js';
import ErrorMessages from '../components/ErrorMessages.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

export default function Editor() {
  const { slug } = useParams<{ slug?: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [body, setBody] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tagList, setTagList] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string[]> | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    if (slug) {
      api.getArticle(slug).then(r => {
        setTitle(r.article.title);
        setDescription(r.article.description);
        setBody(r.article.body);
        setTagList(r.article.tagList);
      }).catch(() => navigate('/'));
    }
  }, [slug]);

  function addTag(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      const tag = tagInput.trim();
      if (tag && !tagList.includes(tag)) setTagList(prev => [...prev, tag]);
      setTagInput('');
    }
  }

  function removeTag(tag: string) {
    setTagList(prev => prev.filter(t => t !== tag));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrors(null);
    try {
      const data = { title, description, body, tagList };
      const res = slug ? await api.updateArticle(slug, data) : await api.createArticle(data);
      navigate(`/article/${res.article.slug}`);
    } catch (err: any) {
      setErrors(err?.errors ?? { '': ['Something went wrong'] });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div data-testid="editor-page" className="min-h-screen bg-surface-white py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="font-display text-[32px] font-semibold text-text-dark mb-8">
          {slug ? 'Edit Article' : 'New Article'}
        </h1>
        <Card className="border-border-light shadow-card rounded-card">
          <CardContent className="p-8">
            <ErrorMessages errors={errors} />
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label className="font-sans text-sm font-medium text-text-dark">Title</Label>
                <Input type="text" placeholder="Article title" value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="h-11 rounded-btn border-border-gray font-sans text-base" />
              </div>
              <div className="space-y-2">
                <Label className="font-sans text-sm font-medium text-text-dark">About</Label>
                <Input type="text" placeholder="What's this article about?" value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="h-11 rounded-btn border-border-gray font-sans text-base" />
              </div>
              <div className="space-y-2">
                <Label className="font-sans text-sm font-medium text-text-dark">Content</Label>
                <Textarea rows={10} placeholder="Write your article (in markdown)" value={body}
                  onChange={e => setBody(e.target.value)}
                  className="rounded-btn border-border-gray font-sans text-base resize-y" />
              </div>
              <div className="space-y-2">
                <Label className="font-sans text-sm font-medium text-text-dark">Tags</Label>
                <Input type="text" placeholder="Press Enter to add a tag" value={tagInput}
                  onChange={e => setTagInput(e.target.value)} onKeyDown={addTag}
                  className="h-11 rounded-btn border-border-gray font-sans text-base" />
                {tagList.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {tagList.map(tag => (
                      <span key={tag} className="flex items-center gap-1 px-3 py-1 bg-surface-light rounded-pill font-sans text-label text-text-secondary">
                        {tag}
                        <button type="button" onClick={() => removeTag(tag)}
                          className="text-text-muted hover:text-text-dark ml-0.5 leading-none">
                          x
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex justify-end pt-2">
                <Button type="submit" disabled={loading}
                  className="px-8 h-11 bg-text-charcoal hover:bg-text-dark text-white font-sans font-semibold rounded-btn transition-colors">
                  {loading ? 'Publishing...' : 'Publish Article'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
