let chromedriver = {};
try {
	chromedriver = require('chromedriver');
} catch (error) {}

let geckodriver = {};
try {
	geckodriver = require('geckodriver');
} catch (error) {}

let seleniumServer;
try {
	seleniumServer = require('selenium-server');
} catch(error) {}

const {
	GN_NIGHTWATCH_USER_OPTIONS = '{}',
	GN_NIGHTWATCH_USE_SELENIUM = '1',
	GN_NIGHTWATCH_HEADLESS = '1',
	GN_NIGHTWATCH_CONCURRENT = '1',
} = process.env;

const parseUserOptions = (options) => {
	if (options.globals_path) {
		options.globals_path = path.resolve(options.globals_path);
	}
	return options;
};

const userOptions = parseUserOptions(JSON.parse(GN_NIGHTWATCH_USER_OPTIONS));
const concurrentMode = GN_NIGHTWATCH_CONCURRENT === '1';
const useSelenium = GN_NIGHTWATCH_USE_SELENIUM === '1' && seleniumServer !== undefined;
const startHeadless = GN_NIGHTWATCH_HEADLESS === '1';
const chromeArgs = [];
const geckoArgs = [];

if (startHeadless) {
	chromeArgs.push('headless');
	geckoArgs.push('--headless');
}

const seleniumConfig = {
	server_path: useSelenium && seleniumServer.path,
	start_process: true,
	host: '127.0.0.1',
	port: 4444,
	cli_args: {
		'webdriver.chrome.driver': chromedriver.path,
		'webdriver.gecko.driver': geckodriver.path,
	},
};

const webdriverConfig = {
	server_path: chromedriver.path,
	start_process: true,
	port: 9515,
};

const driver = useSelenium ? {
	selenium: seleniumConfig,
} : {
	webdriver: webdriverConfig,
};

// @see http://nightwatchjs.org/guide#settings-file
module.exports = {
	src_folders: ['@tests/e2e/specs'],
	output_folder: '@tests/e2e/reports',

	...driver,

	test_settings: {
		default: {
			silent: true,
			selenium_port: 4444,
			selenium_host: 'localhost',
			detailed_output: !concurrentMode,
			launch_url: '${GN_DEV_SERVER_URL}',
			screenshots: {
				path: '@tests/e2e/screenshots',
				on_failure: true,
				on_error: false,
				enabled: true,
			},
		},

		chrome: {
			desiredCapabilities: {
				browserName: 'chrome',
				javascriptEnabled: true,
				acceptSslCerts: true,
				chromeOptions: {
					args: chromeArgs,
					w3c: false,
				},
			},
		},

		firefox: {
			desiredCapabilities: {
				browserName: 'firefox',
				javascriptEnabled: true,
				acceptSslCerts: true,
				marionette: true,
				alwaysMatch: {
					acceptInsecureCerts: true,
					'moz:firefoxOptions': {
						args: geckoArgs,
					},
				},
			},
			webdriver: useSelenium ? {} : {
				server_path: geckodriver.path,
				port: 4444,
			},
		},

		phantomjs: {
			desiredCapabilities: {
				browserName: 'phantomjs',
				javascriptEnabled: true,
				acceptSslCerts: true,
			},
		},
	},
};
