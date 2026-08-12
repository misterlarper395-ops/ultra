const express = require('express');
const http = require('http');
const path = require('path');
const { uvServer } = require('@titaniumnetwork-dev/ultraviolet');

const app = express();
const server = http.createServer(app);

// 1. Change the network prefix so it doesn't say "/service/"
const uv = uvServer({
    prefix: '/algebra-reference/', // Hidden path
    bare: '/bare/'
});

// 2. DISGUISE THE SCRIPTS FROM CONTENTKEEPER
// When the browser requests fake math tools, serve the real Ultraviolet data
app.get('/algebra-reference/math-bundle.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'node_modules/@titaniumnetwork-dev/ultraviolet/dist/uv.bundle.js'));
});
app.get('/algebra-reference/math-settings.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'node_modules/@titaniumnetwork-dev/ultraviolet/dist/uv.config.js'));
});
app.get('/uv.sw.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'node_modules/@titaniumnetwork-dev/ultraviolet/dist/uv.sw.js'));
});

// 3. Serve your Velara public folder interface
app.use(express.static(path.join(__dirname, 'public')));

// 4. Attach Ultraviolet network routing parameters
uv.attach(server);

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Proxy server is actively running on port ${PORT}`);
});
