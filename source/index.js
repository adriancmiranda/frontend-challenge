import './index.css';
import { version, name } from '#/package.json';
import Form from './Form';


const render = () => {
	const form = new Form('moda-e-beleza/cabeleireiros');
	console.log(name, `v${version}`, 'up & running', form);
	document.body.classList.remove('is-rendering');
};

render();

if (module.hot) {
	module.hot.accept(() => {
		console.log('*** Accepting the updated render module! ***');
		render();
	});
}
