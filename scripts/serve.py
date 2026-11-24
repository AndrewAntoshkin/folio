#!/usr/bin/env python3
"""Local preview server matching GitHub Pages clean-URL resolution.

Threaded, keep-alive, gzip for text files (kept in memory), ETag revalidation for
unversioned files, and a short cache for anything addressed by ?v= or by file type.
"""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from email.utils import formatdate
from pathlib import Path
import gzip
import mimetypes
import sys
import urllib.parse

ROOT = Path(__file__).resolve().parents[1]

STATIC = (".jpg", ".jpeg", ".png", ".webp", ".svg", ".woff2", ".mp4")
TEXT = (".html", ".css", ".js", ".mjs", ".json", ".svg", ".md", ".txt", ".xml")
SQUEEZED = {}


class PagesHandler(SimpleHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def log_message(self, *args):
        pass

    def end_headers(self):
        if not getattr(self, "_cached", False):
            parsed = urllib.parse.urlsplit(self.path)
            if parsed.path.lower().endswith(STATIC) or "v=" in parsed.query:
                self.send_header("Cache-Control", "max-age=300")
            else:
                self.send_header("Cache-Control", "no-cache")
        super().end_headers()

    def resolve(self):
        parsed = urllib.parse.urlsplit(self.path)
        clean_path = parsed.path
        if not clean_path.endswith("/"):
            html_candidate = ROOT / (clean_path.lstrip("/") + ".html")
            if html_candidate.is_file():
                self.path = clean_path + ".html" + (f"?{parsed.query}" if parsed.query else "")

    def squeezed(self, head=False):
        path = Path(self.translate_path(self.path))
        if path.suffix.lower() not in TEXT or not path.is_file():
            return False
        if "gzip" not in self.headers.get("Accept-Encoding", ""):
            return False
        st = path.stat()
        key = (str(path), st.st_mtime_ns, st.st_size)
        body = SQUEEZED.get(key)
        if body is None:
            body = gzip.compress(path.read_bytes(), 6, mtime=0)
            SQUEEZED[key] = body
        etag = f'"{st.st_mtime_ns:x}-{st.st_size:x}-gz"'
        parsed = urllib.parse.urlsplit(self.path)
        self._cached = True
        if self.headers.get("If-None-Match") == etag:
            self.send_response(304)
            self.send_header("ETag", etag)
            self.send_header("Cache-Control", "max-age=300" if "v=" in parsed.query else "no-cache")
            self.end_headers()
            return True
        ctype = mimetypes.guess_type(str(path))[0] or "application/octet-stream"
        if ctype.startswith("text/") or ctype.endswith(("javascript", "json", "xml")):
            ctype += "; charset=utf-8"
        self.send_response(200)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Encoding", "gzip")
        self.send_header("Vary", "Accept-Encoding")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("ETag", etag)
        self.send_header("Last-Modified", formatdate(st.st_mtime, usegmt=True))
        self.send_header("Cache-Control", "max-age=300" if "v=" in parsed.query else "no-cache")
        self.end_headers()
        if not head:
            self.wfile.write(body)
        return True

    def do_GET(self):
        self.resolve()
        if not self.squeezed():
            super().do_GET()

    def do_HEAD(self):
        self.resolve()
        if not self.squeezed(head=True):
            super().do_HEAD()


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8765
    ThreadingHTTPServer(("127.0.0.1", port), PagesHandler).serve_forever()
