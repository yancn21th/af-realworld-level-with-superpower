interface Props {
  tags: string[];
  selected?: string | null;
  onSelect?: (tag: string) => void;
}

export default function TagList({ tags, selected, onSelect }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map(tag => (
        <button
          key={tag}
          onClick={() => onSelect?.(tag)}
          className={`px-3 py-1 rounded-pill font-sans text-label font-medium transition-colors ${
            selected === tag
              ? 'bg-brand-blue text-white'
              : 'bg-surface-light text-text-secondary hover:bg-border-gray hover:text-text-dark'
          }`}
        >
          {tag}
        </button>
      ))}
    </div>
  );
}
