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

  // Load tags once
  useEffect(() => {
    api.getTags().then(r => setTags(r.tags)).catch(() => {});
  }, []);

  // Reset to global when user logs out
  useEffect(() => {
    if (!user && tab === 'feed') setTab('global');
  }, [user]);

  // Load articles whenever tab/page/tag changes
  useEffect(() => {
    setLoading(true);
    const offset = (page - 1) * PER_PAGE;
    const params = { limit: PER_PAGE, offset };
    const req = tab === 'feed'
      ? api.getFeed(params)
      : tab === 'tag' && selectedTag
        ? api.getArticles({ ...params, tag: selectedTag })
        : api.getArticles(params);

    req
      .then((r: any) => { setArticles(r.articles); setArticlesCount(r.articlesCount); })
      .catch(() => { setArticles([]); setArticlesCount(0); })
      .finally(() => setLoading(false));
  }, [tab, page, selectedTag]);

  function selectTag(tag: string) {
    setSelectedTag(tag);
    setTab('tag');
    setPage(1);
  }

  function switchTab(t: FeedTab) {
    setTab(t);
    setSelectedTag(null);
    setPage(1);
  }

  return (
    <div className="home-page">
      {!user && (
        <div className="banner">
          <div className="container">
            <h1 className="logo-font">conduit</h1>
            <p>A place to share your knowledge.</p>
          </div>
        </div>
      )}

      <div className="container page">
        <div className="row">
          <div className="col-md-9">
            <div className="feed-toggle">
              <ul className="nav nav-pills outline-active">
                {user && (
                  <li className="nav-item">
                    <button className={`nav-link ${tab === 'feed' ? 'active' : ''}`} onClick={() => switchTab('feed')}>
                      Your Feed
                    </button>
                  </li>
                )}
                <li className="nav-item">
                  <button className={`nav-link ${tab === 'global' ? 'active' : ''}`} onClick={() => switchTab('global')}>
                    Global Feed
                  </button>
                </li>
                {tab === 'tag' && selectedTag && (
                  <li className="nav-item">
                    <button className="nav-link active">
                      <i className="ion-pound" /> {selectedTag}
                    </button>
                  </li>
                )}
              </ul>
            </div>

            {loading && <div className="article-preview">Loading articles...</div>}
            {!loading && articles.length === 0 && (
              <div className="article-preview">No articles are here... yet.</div>
            )}
            {!loading && articles.map(a => (
              <ArticlePreview key={a.slug} article={a} />
            ))}

            <Pagination
              total={articlesCount}
              perPage={PER_PAGE}
              current={page}
              onChange={p => setPage(p)}
            />
          </div>

          <div className="col-md-3">
            <div className="sidebar">
              <p>Popular Tags</p>
              <TagList tags={tags} selected={selectedTag} onSelect={selectTag} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
