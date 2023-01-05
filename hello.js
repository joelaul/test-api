// Load HTTP module

const http = require('http');

const hostname = '127.0.0.1'; // 127.x.x.x = localhost
const port = 8000 || process.env.PORT;

// create HTTP server

const server = http.createServer((req, res) => {
    console.log(req.method);
    // set HTTP response header
    res.writeHead(200, {'Content-type': 'text/html'});
    // set the HTTP response body
    res.end('Hello World');

    // res.setHeader allows for one header. res.writeHead allows for multiple.

    // we're not serving an .html file to deliver text here. just writing text into the body of the http response itself. in the former case, we'd use fs.readFile(path of index.html) and pass its data to res.end()
});

server.listen(port, () => {
    console.log(`server running on port ${port}`);
});