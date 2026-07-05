"use client";

// Simple, build-safe editor wrapper: always render a textarea so the app
// runs without optional editor packages installed. Re-enable a rich editor
// only after installing `react-quill` or `@tiptap/*` locally.
export default function EditorWrapper({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <textarea
      title="content"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Write content here (Markdown/HTML)..."
      className="w-full h-56 p-2 border rounded"
    />
  );
}
