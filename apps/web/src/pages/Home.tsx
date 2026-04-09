import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../api/client.js';
import ArticlePreview from '../components/ArticlePreview.js';
import Pagination from '../components/Pagination.js';
import TagList from '../components/TagList.js';

const PER_PAGE = 10;
type FeedTab = 'global' | 'feed' | 'tag';

export default function Home() {
  const { user } = useAuth();
  const [tab, setTab] = useState<FeedTab>(user ? 'feed' : 'global');
  const [articles, setArticles] = useState<any[]>([]);
  const [articlesCount, setArticlesCount] = useState(0);
  const [page, setPage] = useState(1);
  const [tags, setTags] = useState<string[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.getTags().then(r => setTags(r.tags)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!user && tab === 'feed') setTab('global');
  }, [user]);

  useEffect(() => {
    setLoading(true);
    const offset = (page - 1) * PER_PAGE;
    const params = { limit: PER_PAGE, offset };
    const req = tab === 'feed' ? api.getFeed(params)
      : tab === 'tag' && selectedTag ? api.getArticles({ ...params, tag: selectedTag })
      : api.getArticles(params);
    req
      .then((r: any) => { setArticles(r.articles); setArticlesCount(r.articlesCount); })
      .catch(() => { setArticles([]); setArticlesCount(0); })
      .finally(() => setLoading(false));
  }, [tab, page, selectedTag]);

  function selectTag(tag: string) { setSelectedTag(tag); setTab('tag'); setPage(1); }
  function switchTab(t: FeedTab) { setTab(t); setSelectedTag(null); setPage(1); }

  return (
    <div data-testid="home-page" className="min-h-screen bg-surface-white">
      {!user && (
        <section data-testid="hero-banner" className="bg-surface-white border-b border-border-light py-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-display font-medium text-text-dark" style={{ fontSize: '80px', lineHeight: '1.10' }}>
              conduit
            </h1>
            <p className="mt-6 font-sans text-body-lg text-text-secondary leading-body">
              A place to share your knowledge.
            </p>
          </div>
        </section>
      )}
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 min-w-0">
            <div data-testid="feed-tabs" className="flex items-center gap-1 mb-6 p-1 bg-surface-light rounded-pill w-fit">
              {user && (
                <button data-testid="tab-feed" onClick={() => switchTab('feed')}
                  className={`px-5 py-2 rounded-pill font-sans text-nav font-medium transition-colors ${tab === 'feed' ? 'bg-surface-white text-text-dark shadow-card' : 'text-text-secondary hover:text-text-dark'}`}>
                  Your Feed
                </button>
              )}
              <button data-testid="tab-global" onClick={() => switchTab('global')}
                className={`px-5 py-2 rounded-pill font-sans text-nav font-medium transition-colors ${tab === 'global' ? 'bg-surface-white text-text-dark shadow-card' : 'text-text-secondary hover:text-text-dark'}`}>
                Global Feed
              </button>
              {tab === 'tag' && selectedTag && (
                <button className="px-5 py-2 rounded-pill font-sans text-nav font-medium bg-brand-blue text-white shadow-card">
                  # {selectedTag}
                </button>
              )}
            </div>
            {loading && <div className="py-12 text-center font-sans text-text-muted">Loading articles...</div>}
            {!loading && articles.length === 0 && <div className="py-12 text-center font-sans text-text-muted">No articles are here... yet.</div>}
            {!loading && (
              <div className="space-y-4">
                {articles.map(a => <ArticlePreview key={a.slug} article={a} />)}
              </div>
            )}
            <Pagination total={articlesCount} perPage={PER_PAGE} current={page} onChange={p => setPage(p)} />
          </div>
          <aside className="lg:w-64 shrink-0">
            <div className="bg-surface-light rounded-card-md p-5">
              <p className="font-sans text-sm font-semibold text-text-dark mb-3">Popular Tags</p>
              <TagList tags={tags} selected={selectedTag} onSelect={selectTag} />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
