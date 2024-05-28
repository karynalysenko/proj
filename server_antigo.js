const http = require('http');
const fs = require('fs');

const server = http.createServer((req, res) => {
    // console.log(req.url)

    let path = './views/';
    switch(req.url){
        case '/about':
            path += 'about.html';
            break
        default:
            path += 'index.html';
            break
            
    }
    
    // set header
    res.setHeader('Content-Type', 'text/html');
    fs.readFile(path, (err, data) =>{
        if(err){
            console.log(err);
            res.statusCode = 404;
            res.end();
        }else {
            res.statusCode = 200;
            res.end(data);
        }
    })

});

server.listen(3000, 'localhost', () => {
    console.log('listening on port 3000')
})
