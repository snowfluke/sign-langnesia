// Local dev server for the playground. Sets COOP/COEP so the page is
// cross-origin isolated (SharedArrayBuffer → multithreaded WASM).
// Serves index.html from here and resolves /lib/* and /models/* against the
// repo root so the demo runs against the freshly built local lib/web
// (run `bun run build` first).
const COI = {
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Embedder-Policy": "require-corp",
};

const here = import.meta.dir; // playground/
const repo = `${here}/..`;
const port = 3456;

Bun.serve({
  port,
  async fetch(req) {
    let path = new URL(req.url).pathname;
    if (path === "/") path = "/index.html";
    // /lib/* and /models/* live at the repo root; everything else under playground/.
    const fromRoot = path.startsWith("/lib/") || path.startsWith("/models/");
    const file = Bun.file((fromRoot ? repo : here) + path);
    if (!(await file.exists())) {
      return new Response("Not found", { status: 404, headers: COI });
    }
    return new Response(file, { headers: COI });
  },
});

console.log(`Playground running at http://localhost:${port}`);
