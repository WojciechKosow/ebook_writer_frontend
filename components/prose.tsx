// Renders pre-sanitized article HTML (produced from trusted, in-repo Markdown
// via `marked`) inside the shared `.prose-post` type styles. The content is
// authored by us in lib/blog.ts — not user input — so inlining it is safe.
export function Prose({
  html,
  className = "",
}: {
  html: string;
  className?: string;
}) {
  return (
    <div
      className={`prose-post ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
