// Uma versão adaptada de https://github.com/danethurber/express-manifest-helpers/
// para funcionar com o https://www.npmjs.com/package/webpack-manifest-plugin

const fs = require('fs');

let manifest;
const options = {};

const loadManifest = exports.loadManifest = () => {
	if (manifest && options.cache) return manifest;
	try {
		return JSON.parse(fs.readFileSync(options.manifestPath, 'utf8'));
	} catch(error) {
		throw new Error(`Asset Manifest could not be loaded at "${options.manifestPath}"`);
	}
};

const mapAttrs = exports.mapAttrs = (attrs) => (
	Object.keys(attrs).map(key => `${key}="${attrs[key]}"` ).join(' ')
);

const lookup = exports.lookup = (source) => {
	manifest = loadManifest();
	if (manifest.files[source]) {
		console.log('manifest ->', source, manifest.files[source]);
		return options.prependPath + manifest.files[source];
	}
	return '';
};

const trimTag = exports.trimTag = (value) => (
	value
		.replace(/ {2,}(?=([^"\\]*(\\.|"([^"\\]*\\.)*[^"\\]*"))*[^"]*$)/, ' ')
		.replace(/ >/, '>')
		.replace(/  \/>/, ' />')
);

const getManifest = exports.getManifest = () => (
	manifest || loadManifest()
);

const getSources = exports.getSources = () => {
	manifest = manifest || loadManifest();
	return Object.keys(manifest.files);
};

const getStylesheetSources = exports.getStylesheetSources = () => (
	getSources().filter((file) => file.match(/\.css$/))
);

const getStylesheets = exports.getStylesheets = () => (
	getStylesheetSources().map((source) => lookup(source))
);

const getJavascriptSources = exports.getJavascriptSources = () => (
	getSources().filter((file) => file.match(/\.js$/))
);

const getJavascripts = exports.getJavascripts = () => (
	getJavascriptSources().map((source) => lookup(source))
);

const getImageSources = exports.getImageSources = () => (
	getSources().filter((file) => file.match(/\.(png|jpe?g|gif|webp|bmp)$/))
)

const getImages = exports.getImages = () => (
	getImageSources().map((source) => lookup(source))
);

const assetPath = exports.assetPath = (source) => (
	lookup(source)
);

const imageTag = exports.imageTag = (source, attrs = {}) => (
	trimTag(`<img src="${lookup(source)}" ${mapAttrs(attrs)} />`)
);

const javascriptTag = exports.javascriptTag = (source, attrs = {}) => (
	trimTag(`<script src="${lookup(source)}" ${mapAttrs(attrs)}></script>`)
);

const stylesheetTag = exports.stylesheetTag = (source, attrs = {}) => (
	trimTag(`<link rel="stylesheet" href="${lookup(source)}" ${mapAttrs(attrs)} />`)
);

exports.spread = (opts) => {
	const defaults = {
		cache: true,
		prependPath: '',
	};
	manifest = null;
	Object.assign(options, defaults, opts);
	return (req, res, next) => {
		res.locals.getSources = getSources;
		res.locals.getStylesheetSources = getStylesheetSources;
		res.locals.getStylesheets = getStylesheets;
		res.locals.getJavascriptSources = getJavascriptSources;
		res.locals.getJavascripts = getJavascripts;
		res.locals.getImageSources = getImageSources;
		res.locals.getImages = getImages;
		res.locals.getManifest = getManifest;
		res.locals.assetPath = assetPath;
		res.locals.imageTag = imageTag;
		res.locals.javascriptTag = javascriptTag;
		res.locals.stylesheetTag = stylesheetTag;
		next();
	};
};
