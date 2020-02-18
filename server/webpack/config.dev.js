const path = require('path');
const webpack = require('webpack');

const babelLoader = require.resolve('babel-loader');
const webpackHotMiddlewareClient = require.resolve('webpack-hot-middleware/client');

module.exports = (app) => {
	const config = {
		target: 'web',
		mode: 'development',
		devtool: 'eval-source-map',
		context: path.resolve('.'),
		entry: {
			index: [
				webpackHotMiddlewareClient,
				`./source/index.js`,
			],
		},
		output: {
			publicPath: '/',
			path: path.resolve('public'),
			filename: 'scripts/[name].js',
			chunkFilename: 'scripts/[name].js',
		},
		devServer: {
			hot: true,
			inline: true,
			headers: {
				'Access-Control-Allow-Origin': '*',
			},
		},
		resolve: {
			modules: [
				path.resolve('node_modules'),
			],
		},
		module: {
			rules: [
				{
					test: /\.m?jsx?(\?.*)?$/i,
					exclude: /(node_modules|bower_components)/,
					loader: babelLoader,
				},
			],
		},
		plugins: [
			new webpack.HotModuleReplacementPlugin(),
		],
	};
	return config;
};
