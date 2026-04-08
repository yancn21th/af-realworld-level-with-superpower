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
    <div className="article-preview">
      <div className="article-meta">
        <Link to={`/profile/${article.author.username}`}>
          <img src={article.author.image ?? 'https://static.productionready.io/images/smiley-cyrus.jpg'} alt={article.author.username} />
        </Link>
        <div className="info">
          <Link className="author" to={`/profile/${article.author.username}`}>{article.author.username}</Link>
          <span className="date">{new Date(article.createdAt).toDateString()}</span>
        </div>
        <button
          className={`btn btn-sm pull-xs-right ${article.favorited ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={toggleFavorite}
          disabled={loading}
        >
          <i className="ion-heart" /> {article.favoritesCount}
        </button>
      </div>
      <Link className="preview-link" to={`/article/${article.slug}`}>
        <h1>{article.title}</h1>
        <p>{article.description}</p>
        <span>Read more...</span>
        <ul className="tag-list">
          {article.tagList.map(tag => (
            <li key={tag} className="tag-default tag-pill tag-outline">{tag}</li>
          ))}
        </ul>
      </Link>
    </div>
  );
}
