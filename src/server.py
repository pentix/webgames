#!/usr/bin/env python3

from http.server import HTTPServer, BaseHTTPRequestHandler
from socketserver import ThreadingMixIn
import threading
from urllib.parse import parse_qs
import cgi


def getFileContent(fn):
	try:
		f = open(fn, "r")
		t = f.read()
		f.close()
		
		return t
	
	except:
		return 1


class Handler(BaseHTTPRequestHandler):
	def do_GET(self):
		self.send_response(200)
		self.end_headers()
		
		if self.path == "/" or self.path == "/index.html":
			message = bytes(getFileContent("frontend/index.html"), 'utf-8')
		elif self.path == "/main.js":
			message = bytes(getFileContent("frontend/main.js"), 'utf-8')
		else:
			message = b'Error: File not found'
		
		
		self.wfile.write(message)

		return


	def do_POST(self):
		form = cgi.FieldStorage(fp=self.rfile, headers=self.headers, environ = {'REQUEST_METHOD':'POST', 'CONTENT_TYPE':self.headers['Content-Type']})
		
		if self.path == "/login":
			print("Login attempt: User=" + form["name"].value + "\t Password=" + form["password"].value)
			
			
			# User: fun		Pw: demo
			
			if form["name"].value == "fun" and form["password"].value == "2a97516c354b68848cdbd8f54a226a0a55b21ed138e207ad6c5cbb9c00aa5aea":
				print("[LOGIN Sucessful] User " + form["name"].value + " logged in!")
				self.send_response(200)
				self.end_headers()
				message = bytes('<html><body><h1>YIPIII</h1>', 'utf-8')
				self.wfile.write(message)
			else:
				print("[LOGIN Failed] User " + form["name"].value + " can't login!")
				self.send_response(403)
				self.end_headers()
				message = bytes('<html><body><h1>Fuuuuu</h1>', 'utf-8')
				self.wfile.write(message)				
			
			
		
		return
			
			

class ThreadedHTTPServer(ThreadingMixIn, HTTPServer):
	pass


if __name__ == '__main__':
	try:
		HOST, PORT = "", 5051
		server = ThreadedHTTPServer((HOST, PORT), Handler)
		print('Starting server, use <Ctrl-C> to stop')

		server.allow_reuse_address = True
		server.serve_forever()

	except KeyboardInterrupt:
		print("\nShutting down server")

		server.shutdown()
		server.server_close()
    
    
   
