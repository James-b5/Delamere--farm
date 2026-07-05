import fs from 'fs/promises';
import path from 'path';

export async function GET(req: Request) {
  const filePath = path.join(process.cwd(), 'data', 'migration-current.json');
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let lastRaw = '';
      let closed = false;

      const send = (payload: any) => {
        const text = `data: ${JSON.stringify(payload)}\n\n`;
        controller.enqueue(encoder.encode(text));
      };

      // initial send if exists
      try {
        const raw = await fs.readFile(filePath, 'utf8');
        lastRaw = raw;
        try { send(JSON.parse(raw)); } catch { send({ raw }); }
      } catch (e) {
        // no file yet
        send({ status: 'not-found' });
      }

      const iv = setInterval(async () => {
        if (closed) return;
        try {
          const raw = await fs.readFile(filePath, 'utf8');
          if (raw !== lastRaw) {
            lastRaw = raw;
            try { send(JSON.parse(raw)); } catch { send({ raw }); }
          }
        } catch (e) {
          // ignore read errors
        }
      }, 700);

      // handle client disconnect
      const onAbort = () => {
        closed = true;
        clearInterval(iv);
        controller.close();
      };

      // listen for abort signal
      try {
        // @ts-ignore - Request.signal exists in runtime
        req.signal.addEventListener('abort', onAbort);
      } catch (e) {}
    },
    cancel() {},
  });

  return new Response(stream, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
