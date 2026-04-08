import { useState, useEffect, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.js';
import ErrorMessages from '../components/ErrorMessages.js';

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
      const res = slug
        ? await api.updateArticle(slug, data)
        : await api.createArticle(data);
      navigate(`/article/${res.article.slug}`);
    } catch (err: any) {
      setErrors(err?.errors ?? { '': ['Something went wrong'] });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="editor-page">
      <div className="container page">
        <div className="row">
          <div className="col-md-10 offset-md-1 col-xs-12">
            <ErrorMessages errors={errors} />
            <form onSubmit={handleSubmit}>
              <fieldset>
                <fieldset className="form-group">
                  <input className="form-control form-control-lg" type="text" placeholder="Article Title" value={title} onChange={e => setTitle(e.target.value)} />
                </fieldset>
                <fieldset className="form-group">
                  <input className="form-control" type="text" placeholder="What's this article about?" value={description} onChange={e => setDescription(e.target.value)} />
                </fieldset>
                <fieldset className="form-group">
                  <textarea className="form-control" rows={8} placeholder="Write your article (in markdown)" value={body} onChange={e => setBody(e.target.value)} />
                </fieldset>
                <fieldset className="form-group">
                  <input
                    className="form-control"
                    type="text"
                    placeholder="Enter tags (press Enter)"
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={addTag}
                  />
                  <div className="tag-list">
                    {tagList.map(tag => (
                      <span key={tag} className="tag-default tag-pill">
                        <i className="ion-close-round" onClick={() => removeTag(tag)} style={{ cursor: 'pointer' }} /> {tag}
                      </span>
                    ))}
                  </div>
                </fieldset>
                <button className="btn btn-lg pull-xs-right btn-primary" type="submit" disabled={loading}>
                  {loading ? 'Publishing...' : 'Publish Article'}
                </button>
              </fieldset>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
