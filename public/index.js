const express = require('express');
const http = require('http');
const path = require('path');
const { uvServer } = require('@titaniumnetwork-dev/ultraviolet');

const app = express();
const server = http.createServer(app);

// ContentKeeper flags standard proxy tracking prefixes like '/service/' or '/uv/'
const CUSTOM_PREFIX = '/matrix-calc-stream/'; 

const uv = uvServer({
    prefix: CUSTOM_PREFIX,
    bare: '/math-api/'
});

// Remove identifying headers that indicate a proxy setup
app.use((req, res, next) => {
    res.removeHeader('X-Powered-By');
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    next();
});

// Map standard module paths to clean, fake calculus libraries
app.get(`${CUSTOM_PREFIX}math-bundle.js`, (req, res) => {
    res.sendFile(path.join(__dirname, 'node_modules/@titaniumnetwork-dev/ultraviolet/dist/uv.bundle.js'));
});
app.get(`${CUSTOM_PREFIX}math-settings.js`, (req, res) => {
    res.sendFile(path.join(__dirname, 'node_modules/@titaniumnetwork-dev/ultraviolet/dist/uv.config.js'));
});
app.get('/uv.sw.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'node_modules/@titaniumnetwork-dev/ultraviolet/dist/uv.sw.js'));
});

// Route the frontend asset directory
app.use(express.static(path.join(__dirname, 'public')));

// Attach the core engine
uv.attach(server);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Diagnostic engine running on port ${PORT}`);
});
