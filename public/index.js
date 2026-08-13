const express = require('express');
const http = require('http');
const path = require('path');
const { uvServer } = require('@titaniumnetwork-dev/ultraviolet');
const createBareServer = require('@titaniumnetwork-dev/bare-server-node');

const app = express();
const server = http.createServer(app);

// 1. Configure the local Bare Server path to avoid public blocklists
const bare = createBareServer('/math-api/'); 
const CUSTOM_PREFIX = '/matrix-calc-stream/'; 

// 2. Initialize the Ultraviolet script engine properties
const uv = uvServer({
    prefix: CUSTOM_PREFIX,
    bare: '/math-api/'
});

// 3. Evasion: Purge tracking signatures so ContentKeeper cannot analyze patterns
app.use((req, res, next) => {
    res.removeHeader('X-Powered-By');
    // Set a generic cache header to blend traffic with standard resources
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    next();
});

// 4. Bind the Bare Server request intercept mechanisms
server.on('request', (req, res) => {
    if (bare.shouldRoute(req)) {
        bare.route(req, res); // Routes cookies, media arrays, and site assets locally
    } else {
        app(req, res);
    }
});

// 5. Upgrade network sockets dynamically for dynamic messaging connections
server.on('upgrade', (req, socket, head) => {
    if (bare.shouldRoute(req)) {
        bare.routeUpgrade(req, socket, head);
    } else {
        socket.end();
    }
});

// 6. Map standard dependency scripts to custom mathematical endpoints
app.get(`${CUSTOM_PREFIX}math-bundle.js`, (req, res) => {
    res.sendFile(path.join(__dirname, 'node_modules/@titaniumnetwork-dev/ultraviolet/dist/uv.bundle.js'));
});
app.get(`${CUSTOM_PREFIX}math-settings.js`, (req, res) => {
    res.sendFile(path.join(__dirname, 'node_modules/@titaniumnetwork-dev/ultraviolet/dist/uv.config.js'));
});
app.get('/uv.sw.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'node_modules/@titaniumnetwork-dev/ultraviolet/dist/uv.sw.js'));
});

// 7. Route the primary user-interface directory
app.use(express.static(path.join(__dirname, 'public')));

// 8. Bind the structural execution layers
uv.attach(server);

// 9. Launch the service on Render's automatic deployment port
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Matrix verification module operating on port ${PORT}`);
});
