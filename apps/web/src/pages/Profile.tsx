import { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.js';
import ArticlePreview from '../components/ArticlePreview.js';
import Pagination from '../components/Pagination.js';

const PER_PAGE = 10;

export default function Profile() {
  const { username } = useParams<{ username: string }>();
  const location = useLocation();
  const { user } = useAuth();
  const isFavoritesTab = location.pathname.endsWith('/favorites');
  const [profile, setProfile] = useState<any>(null);
  const [articles, setArticles] = useState<any[]>([]);
  const [articlesCount, setArticlesCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!username) return;
    api.getProfile(username)
      .then(r => setProfile(r.profile))
      .catch(() => {});
  }, [username]);

  useEffect(() => {
    if (!username) return;
    setLoading(true);
    const offset = (page - 1) * PER_PAGE;
    const params: Record<string, string | number> = isFavoritesTab
      ? { favorited: username, limit: PER_PAGE, offset }
      : { author: username, limit: PER_PAGE, offset };
    api.getArticles(params)
      .then(r => { setArticles(r.articles); setArticlesCount(r.articlesCount); })
      .catch(() => { setArticles([]); setArticlesCount(0); })
      .finally(() => setLoading(false));
  }, [username, isFavoritesTab, page]);

  async function toggleFollow() {
    if (!profile) return;
    const res = profile.following
      ? await api.unfollowUser(profile.username)
      : await api.followUser(profile.username);
    setProfile(res.profile);
  }

  const isOwn = user?.username === username;

  return (
    <div className="profile-page">
      <div className="user-info">
        <div className="container">
          <div className="row">
            <div className="col-xs-12 col-md-10 offset-md-1">
              {profile && (
                <>
                  <img src={profile.image ?? 'https://static.productionready.io/images/smiley-cyrus.jpg'} className="user-img" alt={profile.username} />
                  <h4>{profile.username}</h4>
                  <p>{profile.bio}</p>
                  {isOwn ? (
                    <Link className="btn btn-sm btn-outline-secondary action-btn" to="/settings">
                      <i className="ion-gear-a" /> Edit Profile Settings
                    </Link>
                  ) : user ? (
                    <button
                      className={`btn btn-sm action-btn ${profile.following ? 'btn-secondary' : 'btn-outline-secondary'}`}
                      onClick={toggleFollow}
                    >
                      <i className="ion-plus-round" /> {profile.following ? 'Unfollow' : 'Follow'} {profile.username}
                    </button>
                  ) : null}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="row">
          <div className="col-xs-12 col-md-10 offset-md-1">
            <div className="articles-toggle">
              <ul className="nav nav-pills outline-active">
                <li className="nav-item">
                  <Link className={`nav-link ${!isFavoritesTab ? 'active' : ''}`} to={`/profile/${username}`}>
                    My Articles
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link ${isFavoritesTab ? 'active' : ''}`} to={`/profile/${username}/favorites`}>
                    Favorited Articles
                  </Link>
                </li>
              </ul>
            </div>

            {loading && <div className="article-preview">Loading...</div>}
            {!loading && articles.length === 0 && <div className="article-preview">No articles here yet.</div>}
            {!loading && articles.map(a => <ArticlePreview key={a.slug} article={a} />)}

            <Pagination total={articlesCount} perPage={PER_PAGE} current={page} onChange={p => { setPage(p); }} />
          </div>
        </div>
      </div>
    </div>
  );
}
