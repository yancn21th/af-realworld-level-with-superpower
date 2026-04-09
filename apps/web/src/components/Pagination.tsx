interface Props {
  total: number;
  perPage: number;
  current: number;
  onChange: (page: number) => void;
}

export default function Pagination({ total, perPage, current, onChange }: Props) {
  const pages = Math.ceil(total / perPage);
  if (pages <= 1) return null;
  return (
    <div className="flex items-center gap-1 mt-6">
      {Array.from({ length: pages }, (_, i) => i + 1).map(page => (
        <button
          key={page}
          onClick={() => onChange(page)}
          className={`w-9 h-9 rounded-pill font-sans text-nav font-medium transition-colors ${
            page === current
              ? 'bg-brand-blue text-white shadow-card'
              : 'bg-surface-light text-text-secondary hover:bg-border-gray hover:text-text-dark'
          }`}
        >
          {page}
        </button>
      ))}
    </div>
  );
}
