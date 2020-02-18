const path = require('path');
const webpack = require('webpack');
const ManifestPlugin = require('webpack-manifest-plugin');

const babelLoader = require.resolve('babel-loader');
const whatwgFetch = require.resolve('whatwg-fetch');

module.exports = (app) => {
	const config = {
		target: 'web',
		mode: 'production',
		devtool: 'hidden-source-map',
		context: path.resolve('.'),
		entry: {
			polyfill: [
				whatwgFetch,
			],
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
			new ManifestPlugin({
				publicPath: '/',
				fileName: 'manifest.assets.json',
				generate: (wpSeed, wpFiles, wpEntrypoints) => {
					const files = wpFiles.reduce((manifest, file) => {
						manifest[file.name] = file.path;
						return manifest;
					}, wpSeed);
					const entrypoints = wpEntrypoints.index.filter((fileName) =>
						!fileName.endsWith('.map')
					);
					return { entrypoints, files };
				},
			}),
		],
	};
	return config;
};
