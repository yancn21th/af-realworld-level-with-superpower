interface Props {
  errors: Record<string, string[]> | null;
}

export default function ErrorMessages({ errors }: Props) {
  if (!errors) return null;
  const messages = Object.entries(errors).flatMap(([field, msgs]) =>
    msgs.map(m => (field === '' ? m : `${field} ${m}`))
  );
  return (
    <ul className="mb-4 rounded-btn border border-destructive/20 bg-destructive/5 px-4 py-3 space-y-1">
      {messages.map((m, i) => (
        <li key={i} className="font-sans text-sm text-destructive leading-body">{m}</li>
      ))}
    </ul>
  );
}
