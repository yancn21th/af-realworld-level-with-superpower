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
    <ul className="pagination">
      {Array.from({ length: pages }, (_, i) => i + 1).map(page => (
        <li key={page} className={`page-item ${page === current ? 'active' : ''}`}>
          <button className="page-link" onClick={() => onChange(page)}>{page}</button>
        </li>
      ))}
    </ul>
  );
}
