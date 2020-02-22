const { resolve } = require('path');
const { Router } = require('express');

const app = Router();

app.get('/', (request, response) => {
	response.render('form.ejs', require('../mockup/fields.json'));
});

app.get('/fields', (request, response) => {
	return response.json(require('../mockup/fields.json'));
});

app.get('/test/:greetings', (request, response) => {
	response.json({ message: `${request.params.greetings}: up & running!` });
});

app.post('/save-request', (request, response) => {
	response.json({
		success: true,
		error: false,
		message: 'The request has been saved',
		data: [],
	});
});

module.exports = app;
