#!/usr/bin/env python3

import tornado.ioloop
import tornado.web

numberOfClients = 0


class UserInfo(tornado.web.RequestHandler):
	def get(self):
		self.write("Hello, " + self.get_argument("username"))
		

application = tornado.web.Application([
    (r"/", UserInfo),
])


if __name__ == "__main__":
    application.listen(8888)
    tornado.ioloop.IOLoop.current().start()
