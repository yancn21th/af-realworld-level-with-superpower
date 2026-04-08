import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.js';

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

  if (loading) return <div className="article-page"><div className="container">Loading...</div></div>;
  if (!article) return null;

  const isAuthor = user?.username === article.author.username;

  return (
    <div className="article-page">
      <div className="banner">
        <div className="container">
          <h1>{article.title}</h1>
          <div className="article-meta">
            <Link to={`/profile/${article.author.username}`}>
              <img src={article.author.image ?? 'https://static.productionready.io/images/smiley-cyrus.jpg'} alt={article.author.username} />
            </Link>
            <div className="info">
              <Link className="author" to={`/profile/${article.author.username}`}>{article.author.username}</Link>
              <span className="date">{new Date(article.createdAt).toDateString()}</span>
            </div>
            {isAuthor ? (
              <>
                <Link className="btn btn-sm btn-outline-secondary" to={`/editor/${article.slug}`}><i className="ion-edit" /> Edit Article</Link>
                &nbsp;
                <button className="btn btn-sm btn-outline-danger" onClick={handleDelete}><i className="ion-trash-a" /> Delete Article</button>
              </>
            ) : user ? (
              <>
                <button className={`btn btn-sm ${article.author.following ? 'btn-secondary' : 'btn-outline-secondary'}`} onClick={handleFollow}>
                  <i className="ion-plus-round" /> {article.author.following ? 'Unfollow' : 'Follow'} {article.author.username}
                </button>
                &nbsp;
                <button className={`btn btn-sm ${article.favorited ? 'btn-primary' : 'btn-outline-primary'}`} onClick={handleFavorite}>
                  <i className="ion-heart" /> {article.favorited ? 'Unfavorite' : 'Favorite'} ({article.favoritesCount})
                </button>
              </>
            ) : null}
          </div>
        </div>
      </div>

      <div className="container page">
        <div className="row article-content">
          <div className="col-xs-12">
            <p>{article.body}</p>
            <ul className="tag-list">
              {article.tagList.map((tag: string) => (
                <li key={tag} className="tag-default tag-pill tag-outline">{tag}</li>
              ))}
            </ul>
          </div>
        </div>

        <hr />

        <div className="row">
          <div className="col-xs-12 col-md-8 offset-md-2">
            {user ? (
              <form className="card comment-form" onSubmit={handleAddComment}>
                <div className="card-block">
                  <textarea className="form-control" placeholder="Write a comment..." rows={3} value={commentBody} onChange={e => setCommentBody(e.target.value)} />
                </div>
                <div className="card-footer">
                  <img src={user.image ?? 'https://static.productionready.io/images/smiley-cyrus.jpg'} className="comment-author-img" alt={user.username} />
                  <button className="btn btn-sm btn-primary" type="submit">Post Comment</button>
                </div>
              </form>
            ) : (
              <p><Link to="/login">Sign in</Link> or <Link to="/register">sign up</Link> to add comments.</p>
            )}

            {comments.map(comment => (
              <div key={comment.id} className="card">
                <div className="card-block">
                  <p className="card-text">{comment.body}</p>
                </div>
                <div className="card-footer">
                  <Link className="comment-author" to={`/profile/${comment.author.username}`}>
                    <img src={comment.author.image ?? 'https://static.productionready.io/images/smiley-cyrus.jpg'} className="comment-author-img" alt={comment.author.username} />
                  </Link>
                  &nbsp;
                  <Link className="comment-author" to={`/profile/${comment.author.username}`}>{comment.author.username}</Link>
                  <span className="date-posted">{new Date(comment.createdAt).toDateString()}</span>
                  {user?.username === comment.author.username && (
                    <span className="mod-options">
                      <i className="ion-trash-a" onClick={() => handleDeleteComment(comment.id)} style={{ cursor: 'pointer' }} />
                    </span>
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
