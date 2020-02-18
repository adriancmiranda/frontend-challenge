const path = require('path');
const webpack = require('webpack');
const ManifestPlugin = require('webpack-manifest-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const babelLoader = require.resolve('babel-loader');
const whatwgFetch = require.resolve('whatwg-fetch');
const styleLoader = require.resolve('style-loader');
const cssLoader = require.resolve('css-loader');

function ensureSlashEnd(val) {
  if (typeof val === 'string') {
    return val.replace(/([^/])$/, '$1/')
  }
  return val;
}

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
			filename: 'scripts/[name].[hash:8].js',
			chunkFilename: 'scripts/[name].[hash:8].js',
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
							loader: MiniCssExtractPlugin.loader,
							options: {
								esModule: true,
								publicPath: (resourcePath, context) => (
									ensureSlashEnd(path.relative(path.dirname(resourcePath), context))
								),
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
			new MiniCssExtractPlugin({
				filename: 'styles/[name].[hash:8].css',
				chunkFilename: 'styles/[id].[hash:8].css',
				ignoreOrder: false,
			}),
		],
	};
	return config;
};
