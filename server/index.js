const fs = require('fs');
const ip = require('ip');
const http = require('http');
const app = require('./app');

const {
	NODE_ENV='production',
	HOST=ip.address(),
	PORT='9000',
} = process.env;

if (!/^production$/i.test(NODE_ENV)) {
	require('./webpack')(app);
}

const httpServer = http.createServer(app);

function onHttpStart(err) {
	if (err) console.error('🔭', err);
	else console.log(`🌎 http://${HOST}:${PORT}`);
}

httpServer.listen(PORT, HOST, onHttpStart);
