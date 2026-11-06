import http.server
import socketserver
import threading
import os
import sys

PORTS = [3001]
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class ThreadedHTTPServer(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True
    allow_reuse_address = True

class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)
        
    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

    def log_message(self, format, *args):
        sys.stderr.write(f"[{self.log_date_time_string()}] {format % args}\n")

def serve_on_port(port):
    try:
        server_address = ('', port)
        httpd = ThreadedHTTPServer(server_address, NoCacheHandler)
        print(f"  [ONLINE] http://localhost:{port}")
        httpd.serve_forever()
    except Exception as e:
        print(f"  [PORT {port} FAILED]: {e}")

def run():
    os.chdir(DIRECTORY)
    print("======================================================")
    print("  DREAM CAR HOUSE - Dual-Port Multi-Threaded Server")
    print(f"  Serving Directory: {DIRECTORY}")
    print("======================================================")
    threads = []
    for port in PORTS:
        t = threading.Thread(target=serve_on_port, args=(port,), daemon=True)
        t.start()
        threads.append(t)
    
    # Keep main thread alive
    try:
        for t in threads:
            t.join()
    except KeyboardInterrupt:
        print("Server stopping...")

if __name__ == '__main__':
    run()
