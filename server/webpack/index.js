const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const createConfig = require('./config.dev.js');

module.exports = (app) => {
	const config = createConfig();
	const compiler = webpack(config);

	const devMiddleware = webpackDevMiddleware(compiler, {
		publicPath: config.output.publicPath,
		historyApiFallback: true,
	});

	const hotMiddleware = webpackHotMiddleware(compiler, {
		log: console.log,
	});

	app.use(devMiddleware);
	app.use(hotMiddleware);

	return config.output.publicPath;
};
