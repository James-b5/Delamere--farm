"use client";

import { useState, useRef, useEffect } from "react";
import { useConfirm } from '@/components/ConfirmProvider';

export default function AdminImageMigrator() {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [progress, setProgress] = useState<any[]>([]);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    return () => {
      if (esRef.current) {
        esRef.current.close();
        esRef.current = null;
      }
    };
  }, []);

  async function runMigration() {
    const confirm = useConfirm();
    const ok = await confirm('This will download external images and save them to public/uploads. Continue?');
    if (!ok) return;
    setRunning(true);
    setResult(null);
    setProgress([]);

    // start SSE listener
    try {
      if (esRef.current) {
        esRef.current.close();
        esRef.current = null;
      }
      const es = new EventSource('/api/admin/migration-stream');
      esRef.current = es;

      es.onmessage = (ev) => {
        try {
          const data = JSON.parse(ev.data);
          const list = data.progress || data.summary || [];
          setProgress(list);
          if (data.status === 'done' || data.summary) {
            // done
          }
        } catch (e) {
          // ignore parse
        }
      };

      es.onerror = (ev) => {
        // keep open; EventSource will retry automatically
      };

      // kick off migration run
      const res = await fetch('/api/admin/migrate-images', { method: 'POST' });
      const data = await res.json();
      setResult(JSON.stringify(data, null, 2));

      // after completion, fetch final file and close SSE
      try {
        const pr = await fetch('/api/admin/migration-current');
        if (pr.ok) {
          const j = await pr.json();
          setProgress(j.progress || j.summary || []);
        }
      } catch (e) {}

    } catch (e: any) {
      setResult(String(e?.message || e));
    } finally {
      setRunning(false);
      if (esRef.current) {
        esRef.current.close();
        esRef.current = null;
      }
    }
  }

  return (
    <div className="p-4 border rounded space-y-3 bg-white">
      <h4 className="font-bold text-gray-800">Migrate external images</h4>
      <p className="text-sm text-gray-700">Download external image URLs into <strong>/public/uploads</strong> and update DB records to use local files.</p>
      <div className="flex gap-2">
        <button onClick={runMigration} disabled={running} className="btn bg-yellow-600 text-white px-3 py-2 rounded">
          {running ? 'Running...' : 'Run Migration'}
        </button>
      </div>
      {progress.length > 0 && (
        <div className="mt-2 space-y-2 max-h-48 overflow-auto p-2 bg-gray-50 border rounded">
          {progress.map((p: any, idx: number) => (
            <div key={`${p?.id ?? 'item'}-${idx}`} className="p-2 border-b last:border-b-0 bg-transparent">
              <div className="flex items-center justify-between">
                <div className="truncate font-semibold text-gray-800">{p.name}</div>
                <div className="text-xs text-gray-600">{p.migrated} migrated • {p.skipped} skipped</div>
              </div>
              {p.items && p.items.length > 0 && (
                <div className="mt-2 space-y-1 text-xs">
                  {p.items.map((it: any, itemIdx: number) => (
                    <div key={`${p?.id ?? 'item'}-${itemIdx}`} className="flex items-center justify-between">
                      <div className="truncate mr-2 text-gray-800">{it.original}</div>
                      <div className={`ml-2 ${it.ok ? 'text-green-600' : 'text-red-600'}`}>{it.ok ? 'OK' : 'ERR'}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {result && (
        <pre className="mt-2 text-xs bg-gray-100 text-gray-800 p-2 rounded overflow-auto">{result}</pre>
      )}
    </div>
  );
}
