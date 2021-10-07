import http.server, ssl
 
server_address = ('192.168.3.13', 443)
httpd = http.server.HTTPServer(server_address, http.server.SimpleHTTPRequestHandler)
httpd.socket = ssl.wrap_socket(httpd.socket,
                               server_side=True,
                               certfile='./cert.pem',
                               keyfile="./key.pem",
                               ssl_version=ssl.PROTOCOL_TLSv1)
httpd.serve_forever()
