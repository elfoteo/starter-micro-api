const http = require('http');
const { parse } = require('querystring');

let loginCount = 0;

const server = http.createServer((req, res) => {
    if (req.method === 'POST') {
        handleLogin(req, res);
    } else {
        displayLoginForm(res, loginCount);
    }
});

function handleLogin(req, res) {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });

    req.on('end', () => {
        const formData = parse(body);
        // Assuming you have a simple login form with a 'username' field
        const username = formData.username;

        if (username) {
            loginCount++;
            res.writeHead(302, { 'Location': '/' });
            res.end();
        } else {
            displayLoginForm(res, loginCount, 'Invalid username');
        }
    });
}

function displayLoginForm(res, count, message = '') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write(`
        <html>
        <head>
            <title>Login Counter</title>
        </head>
        <body>
            <h1>Login Counter</h1>
            <p>Number of logins: ${count}</p>
            <p>${message}</p>
            <form method="post">
                <label for="username">Username:</label>
                <input type="text" id="username" name="username" required>
                <button type="submit">Login</button>
            </form>
        </body>
        </html>
    `);
    res.end();
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});
