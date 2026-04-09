import { Link } from 'react-router';
import { useState } from 'react';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.js';

interface Article {
  slug: string;
  title: string;
  description: string;
  tagList: string[];
  createdAt: string;
  favorited: boolean;
  favoritesCount: number;
  author: { username: string; image: string | null };
}

interface Props {
  article: Article;
  onUpdate?: (article: Article) => void;
}

export default function ArticlePreview({ article: initial, onUpdate }: Props) {
  const { user } = useAuth();
  const [article, setArticle] = useState(initial);
  const [loading, setLoading] = useState(false);

  async function toggleFavorite() {
    if (!user) return;
    setLoading(true);
    try {
      const res = article.favorited
        ? await api.unfavoriteArticle(article.slug)
        : await api.favoriteArticle(article.slug);
      setArticle(res.article);
      onUpdate?.(res.article);
    } catch {}
    setLoading(false);
  }

  return (
    <article
      data-testid="article-preview"
      className="bg-surface-white rounded-card border border-border-light p-6 shadow-card hover:shadow-card-elevated transition-shadow"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to={`/profile/${article.author.username}`}>
            <img
              src={article.author.image ?? 'https://static.productionready.io/images/smiley-cyrus.jpg'}
              alt={article.author.username}
              className="w-9 h-9 rounded-full object-cover"
            />
          </Link>
          <div>
            <Link
              to={`/profile/${article.author.username}`}
              className="font-sans text-sm font-semibold text-brand-blue hover:text-primary-700 transition-colors"
            >
              {article.author.username}
            </Link>
            <p className="font-sans text-[12px] text-text-muted leading-body">
              {new Date(article.createdAt).toDateString()}
            </p>
          </div>
        </div>
        <button
          onClick={toggleFavorite}
          disabled={loading || !user}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-btn font-sans text-btn-sm font-semibold transition-colors ${
            article.favorited
              ? 'bg-brand-blue text-white hover:bg-primary-700'
              : 'bg-surface-light text-text-secondary hover:bg-border-gray'
          } disabled:opacity-50`}
        >
          {String.fromCodePoint(0x2665)} {article.favoritesCount}
        </button>
      </div>
      <Link to={`/article/${article.slug}`} className="block mt-4 group">
        <h2 className="font-display text-[22px] font-semibold text-text-dark leading-snug group-hover:text-brand-blue transition-colors">
          {article.title}
        </h2>
        <p className="mt-1 font-sans text-base text-text-secondary leading-body line-clamp-2">
          {article.description}
        </p>
        <span className="mt-3 inline-block font-sans text-nav text-text-muted group-hover:text-brand-blue transition-colors">
          Read more...
        </span>
      </Link>
      {article.tagList.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {article.tagList.map(tag => (
            <span
              key={tag}
              className="px-2.5 py-0.5 rounded-pill bg-surface-light font-sans text-label text-text-secondary"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}
