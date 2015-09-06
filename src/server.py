#!/usr/bin/env python3

import socketserver

numberOfClients = 0

class WebgameServer(socketserver.BaseRequestHandler):
	def handle(self):
		global numberOfClients
		numberOfClients = numberOfClients + 1
		
		try:
			while True:
				self.data = self.request.recv(128)
				print(self.data)
				self.request.sendall(b'Number of Clients: ' + bytes(str.encode(str(numberOfClients))) + b'!\n')

		except BrokenPipeError:
			pass
			
		numberOfClients = numberOfClients - 1

class ThreadedServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
	pass


if __name__ == "__main__":
	HOST, PORT = "", 5051
	
	serv = ThreadedServer((HOST, PORT), WebgameServer)
	serv.serve_forever()
