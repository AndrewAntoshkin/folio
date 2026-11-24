#!/usr/bin/env python3
"""Local preview server matching GitHub Pages clean-URL resolution."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import sys
import urllib.parse

ROOT = Path(__file__).resolve().parents[1]


STATIC = (".jpg", ".jpeg", ".png", ".webp", ".svg", ".woff2", ".mp4")


class PagesHandler(SimpleHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def end_headers(self):
        if urllib.parse.urlsplit(self.path).path.lower().endswith(STATIC):
            self.send_header("Cache-Control", "max-age=300")
        else:
            self.send_header("Cache-Control", "no-store, must-revalidate")
        super().end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlsplit(self.path)
        clean_path = parsed.path
        if not clean_path.endswith("/"):
            html_candidate = ROOT / (clean_path.lstrip("/") + ".html")
            if html_candidate.is_file():
                self.path = clean_path + ".html" + (f"?{parsed.query}" if parsed.query else "")
        super().do_GET()

    def do_HEAD(self):
        parsed = urllib.parse.urlsplit(self.path)
        clean_path = parsed.path
        if not clean_path.endswith("/"):
            html_candidate = ROOT / (clean_path.lstrip("/") + ".html")
            if html_candidate.is_file():
                self.path = clean_path + ".html" + (f"?{parsed.query}" if parsed.query else "")
        super().do_HEAD()


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8765
    ThreadingHTTPServer(("127.0.0.1", port), PagesHandler).serve_forever()
