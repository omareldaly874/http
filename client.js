const http = require("http");

let interval;

function login(){
    const options = {
        method: "GET",
        hostname: "localhost",
        port: 8000,
        path: "/login",
        headers: {
            "user-agent" : "node.js",
            "authorization": 'Basic bWV0d2FsbHk6VmVyeVN0cm9uZ1Bhc3N3b3Jk'
        }
    };

    createRequest(options, (data)=>{
        console.log(data);
        interval = setInterval(who, 8000, data);
    });
}

function who(token){
    const options = {
        method: "GET",
        hostname: "127.0.0.1",
        port: 8000,
        path: "/who",
        headers: {
            "user-agent" : "node.js",
            "authorization": ('Bearer ' + token)
        }
    };

    createRequest(options, (data, res)=>{
        console.log(data);
        if(res.statusCode == 403){
            clearInterval(interval);
            login();
        }
    });
}

function hi(){
    const options = {
        method: "POST",
        hostname: "127.0.0.1",
        port: 8000,
        path: "/hi",
        headers: {
            "user-agent" : "node.js"
        }
    };

    createRequest(options, (data)=>{
        console.log(data);
    }, {
        name: "almondo",
        age: 20
    });
}

function createRequest(options, cb, body){
    let request = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
            data +=  chunk;
        });
    
        res.on('close', ()=>{
            if(cb) cb(data, res);
            else console.log(data);
        });
    });
    
    if(body) request.write(JSON.stringify(body));
    request.end();
    request.on('error', (err)=>{
        console.log(err.message);
    });
    
}


//login();

hi();