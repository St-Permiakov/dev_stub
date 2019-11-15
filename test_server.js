// Server with Node's HTTP module
const http = require('http');
const port = 3001;
const server = http.createServer();

server.on('request', (req, res) => {
    console.log(`URL: ${req.url}`);
    res.end('Hello, server!');
});

server.listen(port, (err) => {
    if (err) return console.log(`Error: ${err}`);

    console.log(`Server is listening on port ${port}`);
});
