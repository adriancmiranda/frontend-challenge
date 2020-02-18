module.exports = (request, response, next) => {
	if (request.headers['x-forwarded-proto'] === 'http') {
		return response.redirect(301, `https://${request.headers.host}/`);
	}
	return next();
};
