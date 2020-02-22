import './index.css';
import './assets/images/getninjas_b.svg';
import { version, name } from '#/package.json';
import Form, { validateFullName, validateEmail, validatePhone } from './Form';

let form;

const render = () => {
	console.log(name, `v${version}`);
	document.body.classList.remove('is-rendering');
	form = new Form({
		name: 'moda-e-beleza/cabeleireiros',
		rules: {
			'Qual será o serviço?': {
				errorMessage: 'Você precisa informar o tipo de serviço',
			},
			'Para quando você precisa deste serviço?': {
				errorMessage: 'Você precisa informar para quando precisa do serviço',
			},
			'name': {
				validate: validateFullName,
				errorMessage: 'Preencha seu nome completo',
			},
			'email': {
				validate: validateEmail,
				errorMessage: 'Preencha seu email corretamente, este e-mail é inválido',
			},
			'phone': {
				validate: validatePhone,
				errorMessage: 'Preencha seu telefone corretamente, este número de telefone é inválido',
			},
		},
	});
	form.registerEvents();
};

const dispose = () => {
	if (form) {
		form.unregisterEvents();
	}
};

render();

if (module.hot) {
	module.hot.accept(() => {
		console.log('*** Accepting the updated render module! ***');
		dispose();
		render();
	});

	module.hot.dispose(function() {
		console.log('*** Disposing ***');
		dispose();
	});
}
