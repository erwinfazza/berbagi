export type UserFileItem = {
  id: string;
  original_name: string;
  extension: string;
  size_bytes: number | string;
  download_count: number | string;
  created_at: string;
};

type UserFileListProps = {
  files: UserFileItem[];
  emptyMessage: string;
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function UserFileList({ files, emptyMessage }: UserFileListProps) {
  if (files.length === 0) {
    return <p className="card p-5 text-sm text-slate-600 dark:text-slate-300">{emptyMessage}</p>;
  }

  return (
    <ul className="grid gap-3">
      {files.map((file) => (
        <li key={file.id} className="card flex flex-wrap items-center justify-between gap-3 p-4">
          <div className="min-w-0">
            <p className="truncate font-semibold">{file.original_name}</p>
            <p className="mt-1 text-xs text-slate-500">
              {file.extension.toUpperCase()} · {formatBytes(Number(file.size_bytes))} · {new Date(file.created_at).toLocaleDateString("id-ID")}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {Number(file.download_count)} kali diunduh
            </p>
          </div>
          <a
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold hover:bg-slate-50 dark:border-white/15 dark:hover:bg-white/5"
            href={`/api/files/${file.id}/download`}
          >
            Download
          </a>
        </li>
      ))}
    </ul>
  );
}
