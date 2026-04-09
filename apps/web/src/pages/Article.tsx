import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.js';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';

export default function Article() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [article, setArticle] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [commentBody, setCommentBody] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    Promise.all([api.getArticle(slug), api.getComments(slug)])
      .then(([a, c]) => { setArticle(a.article); setComments(c.comments); })
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, [slug]);

  async function handleFavorite() {
    if (!article) return;
    const res = article.favorited
      ? await api.unfavoriteArticle(article.slug)
      : await api.favoriteArticle(article.slug);
    setArticle(res.article);
  }

  async function handleFollow() {
    if (!article) return;
    const res = article.author.following
      ? await api.unfollowUser(article.author.username)
      : await api.followUser(article.author.username);
    setArticle({ ...article, author: res.profile });
  }

  async function handleDelete() {
    if (!article || !confirm('Delete this article?')) return;
    await api.deleteArticle(article.slug);
    navigate('/');
  }

  async function handleAddComment(e: React.FormEvent) {
    e.preventDefault();
    if (!slug || !commentBody.trim()) return;
    const res = await api.addComment(slug, commentBody);
    setComments(prev => [res.comment, ...prev]);
    setCommentBody('');
  }

  async function handleDeleteComment(id: number) {
    if (!slug) return;
    await api.deleteComment(slug, id);
    setComments(prev => prev.filter(c => c.id !== id));
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-white flex items-center justify-center">
        <p className="font-sans text-text-muted">Loading...</p>
      </div>
    );
  }
  if (!article) return null;

  const isAuthor = user?.username === article.author.username;

  return (
    <div data-testid="article-page" className="min-h-screen bg-surface-white">
      {/* Dark banner */}
      <div className="bg-footer-bg py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-display text-[42px] font-semibold text-white leading-tight">{article.title}</h1>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3">
              <Link to={`/profile/${article.author.username}`}>
                <img src={article.author.image ?? 'https://static.productionready.io/images/smiley-cyrus.jpg'}
                  alt={article.author.username} className="w-9 h-9 rounded-full object-cover border-2 border-white/20" />
              </Link>
              <div>
                <Link to={`/profile/${article.author.username}`} className="font-sans text-sm font-semibold text-white/90 hover:text-white">
                  {article.author.username}
                </Link>
                <p className="font-sans text-[12px] text-white/50">{new Date(article.createdAt).toDateString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 ml-2">
              {isAuthor ? (
                <>
                  <Link to={`/editor/${article.slug}`}
                    className="inline-flex items-center h-8 px-4 rounded-btn border border-white/30 bg-transparent text-white/80 hover:bg-white/10 hover:text-white font-sans text-[13px] font-semibold transition-colors">
                    Edit Article
                  </Link>
                  <Button variant="outline" size="sm" onClick={handleDelete}
                    className="h-8 px-4 rounded-btn bg-transparent border-red-400/50 text-red-300 hover:bg-red-500/10 hover:text-red-200 font-sans text-btn-sm">
                    Delete
                  </Button>
                </>
              ) : user ? (
                <>
                  <Button variant="outline" size="sm" onClick={handleFollow}
                    className={`h-8 px-4 rounded-btn font-sans text-btn-sm border-white/30 ${article.author.following ? 'bg-white/10 text-white' : 'bg-transparent text-white/80 hover:bg-white/10 hover:text-white'}`}>
                    {article.author.following ? 'Unfollow' : 'Follow'} {article.author.username}
                  </Button>
                  <Button size="sm" onClick={handleFavorite}
                    className={`h-8 px-4 rounded-btn font-sans text-btn-sm ${article.favorited ? 'bg-primary-500 text-white hover:bg-primary-700' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                    ♥ {article.favorited ? 'Unfavorite' : 'Favorite'} ({article.favoritesCount})
                  </Button>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Article body */}
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="font-sans text-base text-text-dark leading-body">
          <p className="whitespace-pre-wrap">{article.body}</p>
        </div>
        {article.tagList.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2">
            {article.tagList.map((tag: string) => (
              <span key={tag} className="px-3 py-1 rounded-pill border border-border-gray font-sans text-label text-text-secondary">{tag}</span>
            ))}
          </div>
        )}

        <Separator className="my-10" />

        {/* Comments */}
        <div className="max-w-2xl">
          <h3 className="font-display text-xl font-semibold text-text-dark mb-5">Comments</h3>
          {user ? (
            <form onSubmit={handleAddComment} className="mb-6 border border-border-gray rounded-card-md overflow-hidden">
              <Textarea placeholder="Write a comment..." rows={3} value={commentBody}
                onChange={e => setCommentBody(e.target.value)}
                className="rounded-none border-0 border-b border-border-light resize-none font-sans text-base" />
              <div className="flex items-center justify-between px-4 py-3 bg-surface-light">
                <img src={user.image ?? 'https://static.productionready.io/images/smiley-cyrus.jpg'}
                  alt={user.username} className="w-7 h-7 rounded-full object-cover" />
                <Button type="submit" size="sm"
                  className="h-8 px-4 bg-brand-blue hover:bg-primary-700 text-white font-sans text-btn-sm rounded-btn">
                  Post Comment
                </Button>
              </div>
            </form>
          ) : (
            <p className="mb-6 font-sans text-base text-text-secondary">
              <Link to="/login" className="text-brand-blue hover:text-primary-700 font-medium">Sign in</Link>
              {' '}or{' '}
              <Link to="/register" className="text-brand-blue hover:text-primary-700 font-medium">sign up</Link>
              {' '}to add comments.
            </p>
          )}
          <div className="space-y-3">
            {comments.map(comment => (
              <div key={comment.id} className="border border-border-light rounded-card-md overflow-hidden">
                <div className="px-5 py-4">
                  <p className="font-sans text-base text-text-dark leading-body">{comment.body}</p>
                </div>
                <div className="flex items-center gap-3 px-5 py-3 bg-surface-light border-t border-border-light">
                  <Link to={`/profile/${comment.author.username}`}>
                    <img src={comment.author.image ?? 'https://static.productionready.io/images/smiley-cyrus.jpg'}
                      alt={comment.author.username} className="w-6 h-6 rounded-full object-cover" />
                  </Link>
                  <Link to={`/profile/${comment.author.username}`}
                    className="font-sans text-sm font-semibold text-brand-blue hover:text-primary-700">
                    {comment.author.username}
                  </Link>
                  <span className="font-sans text-[12px] text-text-muted">{new Date(comment.createdAt).toDateString()}</span>
                  {user?.username === comment.author.username && (
                    <button onClick={() => handleDeleteComment(comment.id)}
                      className="ml-auto font-sans text-[12px] text-text-muted hover:text-destructive transition-colors">
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
