export class Form {
	constructor(name) {
		console.log('Form[%s]', name);
		this.name = name;
	}

	toString() {
		return `Form[${this.name}]`;
	}
}

export default Form;
