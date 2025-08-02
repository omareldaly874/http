const http = require("http");
const qs = require("querystring");
const { Buffer } = require("buffer");
const crypto = require("crypto");
const fs = require("fs");

const server = http.createServer(async (req, res) => {
    console.log(req.headers);
    console.log(req.url);
    
    let url = processURL(req.url);
    console.log(url.path);
    console.log(url.queryString);

    if(req.headers["accept-encoding"]){
        res.statusCode = 400;
        res.statusMessage = 'Bad Request'
        res.end("we will not serve you!");
        return;
    }

    switch(url.path){
        case "/":
            res.end("this is a response body");
        break;
        case "/hi":
            switch(req.method){
                case "GET":
                    res.end("hello GET " + url.queryString.name);
                break;
                case "POST":
                    let body = '';
                    req.on('data', (chunk)=>{
                        body += chunk;
                    });
                    req.on('end', ()=>{
                        body = JSON.parse(body);
                        res.end("hello POST " + body.name);
                    });
                break;
            }
        break;
        case "/login":
            if(await checkAuth(req.headers["authorization"])){
                let token = await generateToken();
                res.end(token);
            } else {
                res.statusCode = 403;
                res.statusMessage = 'Not Authorized'
                res.end("credentials are not vaild!");
            }
        break;
        case "/who":
            if(await checkAuth(req.headers["authorization"])){
                res.end("http server running on node.js.");
            } else {
                res.statusCode = 403;
                res.statusMessage = 'Not Authorized'
                res.end();    
            }
        break;
        default:
            res.statusCode = 406;
            res.statusMessage = 'Not Acceptable'
            res.end();
    }

});

server.listen(8000, () => {
    console.log('server is running on poprt 8000');
});

function processURL(str){
    let arr = str.split('?');
    return {
        path: arr[0],
        queryString: qs.parse(arr[1])
    }
}

async function checkAuth(auth){
    if(auth == undefined) return false;

    if(auth.startsWith('Basic ')){
        auth = auth.replace('Basic ', '');
        console.log(auth);
        let credentials = Buffer.from(auth, 'base64').toString();
        console.log(credentials);
        credentials = credentials.split(':');
        return ( credentials[0] == 'metwally' && credentials[1] == 'VeryStrongPassword' );

    } else if(auth.startsWith('Bearer ')){
        auth = auth.replace('Bearer ', '');
        console.log(auth);
        let tokens = await fs.promises.readFile('tokens', 'utf-8');
        if(tokens){
            return (tokens.indexOf(auth) >= 0);
        }else{
            return false;
        }
    } else {
        return false;
    }

}

/*

client requesting a token using username & password
serverr generat the token
store the token in a file
sending the token to the client

setTimeout a few seconds then delete the token from the file

----

client sending a request using the token
check if the token exists in the file

*/

async function generateToken(){
    let token = crypto.randomBytes(16).toString('hex');
    console.log(token);
    
    await fs.promises.writeFile('tokens', token + '\n', 'utf-8');
    setTimeout(resetTokens, 20000);
    return token;
}

async function resetTokens(){
    console.log('reset tokens');
    await fs.promises.writeFile('tokens', '', 'utf-8');
}