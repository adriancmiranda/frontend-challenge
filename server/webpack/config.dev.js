const path = require('path');
const webpack = require('webpack');
const ManifestPlugin = require('webpack-manifest-plugin');

const babelLoader = require.resolve('babel-loader');
const whatwgFetch = require.resolve('whatwg-fetch');
const webpackHotMiddlewareClient = require.resolve('webpack-hot-middleware/client');
const styleLoader = require.resolve('style-loader');
const cssLoader = require.resolve('css-loader');

module.exports = (app) => {
	const config = {
		target: 'web',
		mode: 'development',
		devtool: 'eval-source-map',
		context: path.resolve('.'),
		entry: {
			polyfill: [
				whatwgFetch,
			],
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
				{
					test: /\.css(\?.*)?$/i,
					use: [
						{
							loader: styleLoader,
							options: {
								esModule: true,
							},
						},
						{
							loader: cssLoader,
							options: {
								modules: false,
								sourceMap: true,
							},
						},
					],
				},
			],
		},
		plugins: [
			new webpack.HotModuleReplacementPlugin(),
			new ManifestPlugin({
				publicPath: '/',
				fileName: 'manifest.assets.json',
				writeToFileEmit: true,
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
