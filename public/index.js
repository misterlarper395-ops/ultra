const express = require('express');
const http = require('http');
const path = require('path');
const { uvServer } = require('@titaniumnetwork-dev/ultraviolet');
const createBareServer = require('@titaniumnetwork-dev/bare-server-node');

const app = express();
const server = http.createServer(app);
const bare = createBareServer('/math-api/'); 

// Masked path to block fingerprint engines
const CUSTOM_PREFIX = '/matrix-calc-stream/'; 

const uv = uvServer({
    prefix: CUSTOM_PREFIX,
    bare: '/math-api/'
});

app.use((req, res, next) => {
    res.removeHeader('X-Powered-By');
    next();
});

// Custom Backend Decryption Hook: Matches the custom cipher matrix
app.use(`${CUSTOM_PREFIX}:encryptedUrl`, (req, res, next) => {
    try {
        let scrambled = req.params.encryptedUrl;
        let decodedStr = decodeURIComponent(atob(scrambled));
        let clearUrl = '';
        for (let i = 0; i < decodedStr.length; i++) {
            clearUrl += String.fromCharCode(decodedStr.charCodeAt(i) ^ 2); // Unshifts the character key
        }
        req.url = clearUrl; // Safely routes the real URL behind the scenes
    } catch(e) {}
    next();
});

server.on('request', (req, res) => {
    if (bare.shouldRoute(req)) { bare.route(req, res); } else { app(req, res); }
});
server.on('upgrade', (req, socket, head) => {
    if (bare.shouldRoute(req)) { bare.routeUpgrade(req, socket, head); } else { socket.end(); }
});

app.get(`${CUSTOM_PREFIX}math-bundle.js`, (req, res) => {
    res.sendFile(path.join(__dirname, 'node_modules/@titaniumnetwork-dev/ultraviolet/dist/uv.bundle.js'));
});
app.get(`${CUSTOM_PREFIX}math-settings.js`, (req, res) => {
    res.sendFile(path.join(__dirname, 'node_modules/@titaniumnetwork-dev/ultraviolet/dist/uv.config.js'));
});
app.get('/uv.sw.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'node_modules/@titaniumnetwork-dev/ultraviolet/dist/uv.sw.js'));
});

app.use(express.static(path.join(__dirname, 'public')));
uv.attach(server);

const PORT = process.env.PORT || 3000;
server.listen(PORT);
