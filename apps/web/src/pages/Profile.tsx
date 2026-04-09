import { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.js';
import ArticlePreview from '../components/ArticlePreview.js';
import Pagination from '../components/Pagination.js';
import { Button } from '@/components/ui/button';

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
    api.getProfile(username).then(r => setProfile(r.profile)).catch(() => {});
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
    <div data-testid="profile-page" className="min-h-screen bg-surface-white">
      <div className="bg-surface-light border-b border-border-light py-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          {profile && (
            <>
              <img src={profile.image ?? 'https://static.productionready.io/images/smiley-cyrus.jpg'}
                alt={profile.username}
                className="w-20 h-20 rounded-full object-cover mx-auto border-4 border-surface-white shadow-card" />
              <h1 className="mt-4 font-display text-[28px] font-semibold text-text-dark">{profile.username}</h1>
              {profile.bio && (
                <p className="mt-2 font-sans text-base text-text-secondary leading-body max-w-md mx-auto">{profile.bio}</p>
              )}
              <div className="mt-5">
                {isOwn ? (
                  <Link to="/settings"
                    className="inline-flex items-center h-9 px-5 rounded-btn border border-border-gray text-text-secondary hover:text-text-dark font-sans text-[14px] font-medium transition-colors">
                    Edit Profile Settings
                  </Link>
                ) : user ? (
                  <Button variant="outline" size="sm" onClick={toggleFollow}
                    className={`h-9 px-5 rounded-btn font-sans text-nav ${profile.following ? 'bg-text-charcoal text-white border-text-charcoal hover:bg-text-dark' : 'border-border-gray text-text-secondary hover:text-text-dark'}`}>
                    {profile.following ? `Unfollow ${profile.username}` : `Follow ${profile.username}`}
                  </Button>
                ) : null}
              </div>
            </>
          )}
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div data-testid="profile-tabs" className="flex items-center gap-1 mb-6 p-1 bg-surface-light rounded-pill w-fit">
          <Link to={`/profile/${username}`}
            className={`px-5 py-2 rounded-pill font-sans text-nav font-medium transition-colors ${!isFavoritesTab ? 'bg-surface-white text-text-dark shadow-card' : 'text-text-secondary hover:text-text-dark'}`}>
            My Articles
          </Link>
          <Link to={`/profile/${username}/favorites`}
            className={`px-5 py-2 rounded-pill font-sans text-nav font-medium transition-colors ${isFavoritesTab ? 'bg-surface-white text-text-dark shadow-card' : 'text-text-secondary hover:text-text-dark'}`}>
            Favorited Articles
          </Link>
        </div>
        {loading && <div className="py-12 text-center font-sans text-text-muted">Loading...</div>}
        {!loading && articles.length === 0 && <div className="py-12 text-center font-sans text-text-muted">No articles here yet.</div>}
        {!loading && (
          <div className="space-y-4">
            {articles.map(a => <ArticlePreview key={a.slug} article={a} />)}
          </div>
        )}
        <Pagination total={articlesCount} perPage={PER_PAGE} current={page} onChange={setPage} />
      </div>
    </div>
  );
}
