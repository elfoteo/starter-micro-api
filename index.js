const http = require('http');

http.createServer(function (req, res) {
    const currentTime = new Date();
    const hour = currentTime.getHours();
    const greeting = getGreeting(hour);

    console.log(`Just got a request at ${req.url}!`);

    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.write(`Hello! It's currently ${hour}:${currentTime.getMinutes()} - ${greeting}`);
    res.end();
}).listen(process.env.PORT || 3000);

function getGreeting(hour) {
    if (hour >= 5 && hour < 12) {
        return 'Good morning';
    } else if (hour >= 12 && hour < 17) {
        return 'Good afternoon';
    } else {
        return 'Good evening';
    }
}
