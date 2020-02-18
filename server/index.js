const fs = require('fs');
const ip = require('ip');
const http = require('http');
const https = require('https');
const app = require('./app');

const {
	NODE_ENV='production',
	HOST=ip.address(),
	PORT='9000',
	HTTPS_PORT='8443',
	CERT='server/credentials/cert.pem',
	KEY='server/credentials/key.pem',
} = process.env;

if (!/^production$/i.test(NODE_ENV)) {
	require('./webpack')(app);
}

const credentials = {
	key: fs.readFileSync(KEY, 'utf8'),
	cert: fs.readFileSync(CERT, 'utf8'),
};

const httpServer = http.createServer(app);
const httpsServer = https.createServer(credentials, app);

function onHttpStart(err) {
	if (err) console.error('🔭', err);
	else console.log(`🌎 http://${HOST}:${PORT}`);
}

function onHttpsStart(err) {
	if (err) console.error('🔓', err);
	else console.log(`🔐 https://${HOST}:${HTTPS_PORT}`);
}

httpServer.listen(PORT, HOST, onHttpStart);
httpsServer.listen(HTTPS_PORT, HOST, onHttpsStart);
