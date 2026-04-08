interface Props {
  tags: string[];
  selected?: string | null;
  onSelect?: (tag: string) => void;
}

export default function TagList({ tags, selected, onSelect }: Props) {
  return (
    <div className="tag-list">
      {tags.map(tag => (
        <button
          key={tag}
          className={`tag-pill tag-default ${selected === tag ? 'tag-primary' : ''}`}
          onClick={() => onSelect?.(tag)}
        >
          {tag}
        </button>
      ))}
    </div>
  );
}
