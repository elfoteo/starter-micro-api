const http = require('http');
const { parse } = require('querystring');
const AWS = require('aws-sdk');

// Create an S3 instance
const s3 = new AWS.S3();
const bucketName = 'cyclic-bewildered-shoulder-pads-newt-eu-west-3';
const s3Key = 'userdata.json'; // Set the key (filename) in S3

let loginCount = 0;
let users = [];

async function loadDataFromS3() {
    const s3Params = {
        Bucket: bucketName,
        Key: s3Key,
    };

    try {
        const data = await s3.getObject(s3Params).promise();
        const { loginCount: loadedLoginCount, users: loadedUsers } = JSON.parse(data.Body.toString());

        loginCount = loadedLoginCount;
        users = loadedUsers;

        console.log('Data loaded from S3.');
    } catch (error) {
        console.error('Error loading data from S3:', error);
    }
}

async function saveDataToS3() {
    const s3Params = {
        Bucket: bucketName,
        Key: s3Key,
        Body: JSON.stringify({ loginCount, users }),
        ContentType: 'application/json',
    };

    try {
        await s3.putObject(s3Params).promise();
        console.log('Data saved to S3.');
    } catch (error) {
        console.error('Error saving data to S3:', error);
    }
}

async function startServer() {
    await loadDataFromS3(); // Load data from S3 before starting the server

    const server = http.createServer((req, res) => {
        if (req.method === 'POST') {
            handleLogin(req, res);
        } else if (req.url === '/users') {
            displayUsers(res);
        } else {
            displayLoginForm(res, loginCount);
        }
    });

    // Rest of your code remains unchanged

    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}/`);
    });
}

startServer();
