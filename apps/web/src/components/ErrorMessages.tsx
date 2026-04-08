interface Props {
  errors: Record<string, string[]> | null;
}

export default function ErrorMessages({ errors }: Props) {
  if (!errors) return null;
  const messages = Object.entries(errors).flatMap(([field, msgs]) =>
    msgs.map(m => `${field} ${m}`)
  );
  return (
    <ul className="error-messages">
      {messages.map((m, i) => <li key={i}>{m}</li>)}
    </ul>
  );
}
