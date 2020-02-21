import './index.css';
import { version, name } from '#/package.json';
import Form from './Form';

const form = new Form('moda-e-beleza/cabeleireiros');

const render = () => {
	console.log(name, `v${version}`, 'up & running', form);
	document.body.classList.remove('is-rendering');
	form.registerEvents();
};

render();

if (module.hot) {
	module.hot.accept(() => {
		console.log('*** Accepting the updated render module! ***');
		form.unregisterEvents();
		render();
	});

	module.hot.dispose(function() {
		console.log('*** Disposing ***');
		form.unregisterEvents();
	});
}
