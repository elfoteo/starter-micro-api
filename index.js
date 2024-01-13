const http = require('http');
const { parse } = require('querystring');
const fetch = require('node-fetch');

const githubRepoUrl = 'https://api.github.com/repos/elfoteo/MinesweeperHostingFiles/contents/data.json';
const githubApiToken = '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'; // Replace with your GitHub API token

async function fetchDataFromGitHub() {
    try {
        const response = await fetch(githubRepoUrl, {
            headers: {
                'Authorization': `Bearer ${githubApiToken}`
            }
        });
        const data = await response.json();
        const decodedContent = Buffer.from(data.content, 'base64').toString('utf-8');
        return JSON.parse(decodedContent);
    } catch (error) {
        console.error('Error fetching data from GitHub:', error);
        return null;
    }
}

async function saveDataToGitHub(data) {
    try {
        const currentData = await fetchDataFromGitHub();
        const encodedContent = Buffer.from(JSON.stringify({ ...currentData, ...data })).toString('base64');

        await fetch(githubRepoUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${githubApiToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: 'Update data.json',
                content: encodedContent,
                sha: currentData.sha,
            }),
        });

        console.log('Data saved to GitHub.');
    } catch (error) {
        console.error('Error saving data to GitHub:', error);
    }
}

let loginCount = 0;
let users = [];

async function startServer() {
    // Fetch initial data from GitHub
    const initialData = await fetchDataFromGitHub();
    if (initialData) {
        loginCount = initialData.loginCount;
        users = initialData.users;
    }

    const server = http.createServer((req, res) => {
        if (req.method === 'POST') {
            handleLogin(req, res);
        } else if (req.url === '/users') {
            displayUsers(res);
        } else {
            displayLoginForm(res, loginCount);
        }
    });

    function handleLogin(req, res) {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', async () => {
            const formData = parse(body);
            const username = formData.username;

            if (username) {
                users.push(username);
                loginCount++;
                await saveDataToGitHub({ loginCount, users });
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
                <p><a href="/users">View Users</a></p>
            </body>
            </html>
        `);
        res.end();
    }

    function displayUsers(res) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write(`
            <html>
            <head>
                <title>User List</title>
            </head>
            <body>
                <h1>User List</h1>
                <ul>
                    ${users.map(user => `<li>${user}</li>`).join('')}
                </ul>
                <p><a href="/">Back to Login</a></p>
            </body>
            </html>
        `);
        res.end();
    }

    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}/`);
    });
}

startServer();
