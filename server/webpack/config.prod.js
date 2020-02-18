const path = require('path');
const webpack = require('webpack');

const babelLoader = require.resolve('babel-loader');

module.exports = (app) => {
	const config = {
		target: 'web',
		mode: 'production',
		devtool: 'hidden-source-map',
		context: path.resolve('.'),
		entry: {
			index: [
				`./source/index.js`,
			],
		},
		output: {
			publicPath: '/',
			path: path.resolve('public'),
			filename: 'scripts/[name].js',
			chunkFilename: 'scripts/[name].js',
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
			new webpack.ProgressPlugin(),
			new webpack.optimize.OccurrenceOrderPlugin(),
			new webpack.HashedModuleIdsPlugin(),
		],
	};
	return config;
};
