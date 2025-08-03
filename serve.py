"""
Simple HTTP server for AlphaTanks development
Serves the game files locally for testing
"""
import http.server
import socketserver
import webbrowser
import os
import threading
import time

# Set the port
PORT = 8000

# Change to the directory containing the game files
os.chdir(os.path.dirname(os.path.abspath(__file__)))

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add CORS headers for local development
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', '*')
        super().end_headers()
    
    def log_message(self, format, *args):
        # Custom logging
        print(f"🌐 {self.address_string()} - {format % args}")

def start_server():
    """Start the HTTP server"""
    with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
        print(f"🚀 AlphaTanks Development Server")
        print(f"📡 Serving at http://localhost:{PORT}")
        print(f"🎮 Open http://localhost:{PORT} in your browser")
        print(f"⏹️  Press Ctrl+C to stop the server")
        print("-" * 50)
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n🛑 Server stopped")
            httpd.shutdown()

def open_browser():
    """Open browser after a short delay"""
    time.sleep(1)
    webbrowser.open(f'http://localhost:{PORT}')
    print(f"🌍 Browser opened to http://localhost:{PORT}")

if __name__ == "__main__":
    # Start browser in a separate thread
    browser_thread = threading.Thread(target=open_browser)
    browser_thread.daemon = True
    browser_thread.start()
    
    # Start the server
    start_server()
