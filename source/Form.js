export function doInputFormat(value, pattern, mask) {
	const strippedValue = value.replace(/[^0-9]/g, '');
	const chars = strippedValue.split('');
	let count = 0;
	let formatted = '';
	for (var id = 0; id < pattern.length; id += 1) {
		var item = pattern[id];
		if (chars[count]) {
			if (/\*/.test(item)) {
				formatted += chars[count];
				count++;
			} else {
				formatted += item;
			}
		} else if (mask) {
			if (mask.split('')[id])
				formatted += mask.split('')[id];
		}
	}
	return formatted;
}

export function inputFormatByEl(el, format, mask) {
	const val = doInputFormat(el.value, format);
	el.value = doInputFormat(el.value, format, mask);
	if (el.createTextRange) {
		const range = el.createTextRange();
		range.move('character', val.length);
		range.select();
	} else if (el.selectionStart) {
		el.focus();
		el.setSelectionRange(val.length, val.length);
	}
}

export function validateFullName(value) {
	const values = value.replace(/^\s+|\s+$/gi, '').replace(/\s{2,}/g, ' ').split(' ');
	return values.length >= 2 && values[0] !== '' && values[1] !== '';
}

export function validateEmail(value) {
	const rule = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return rule.test(value);
}

export function validatePhone(value) {
	const rule = /^(?:(?:\+|00)?(55)\s?)?(?:\(?([1-9][0-9])\)?\s?)?(?:((?:9\d|[2-9])\d{3})\-?(\d{4}))$/;
	return rule.test(value);
}

export class Form {
	constructor(name) {
		this.name = name;
		this.eventMaskMap = {};
		this.eventBlurMap = {};
		this.validate = this.validate.bind(this);
	}

	registerMaskKeyUpEventByEl(el) {
		const format = el.getAttribute('data-format');
		const mask = el.getAttribute('data-mask');
		if (this.eventMaskMap[el]) return;
		this.eventMaskMap[el] = () => {
			inputFormatByEl(el, format, mask);
		};
		el.addEventListener('keyup', this.eventMaskMap[el]);
		inputFormatByEl(el, format, mask);
	}

	unregisterMaskKeyUpEventByEl(el) {
		if (this.eventMaskMap[el]) {
			el.removeEventListener('keyup', this.eventMaskMap[el]);
			delete this.eventMaskMap[el];
		}
	}

	registerInputBlurEventByEl(el) {
		if (this.eventBlurMap[el]) return;
		el.addEventListener('blur', this.validate);
		this.eventBlurMap[el] = true;
	}

	unregisterInputBlurEventByEl(el) {
		el.removeEventListener('blur', this.validate);
		delete this.eventBlurMap[el];
	}

	registerEvents() {
		const maskEls = document.querySelectorAll('[data-mask]');
		maskEls.forEach(this.registerMaskKeyUpEventByEl, this);
		const inputEls = document.querySelectorAll('.Form-input input, .Form-input select');
		inputEls.forEach(this.registerInputBlurEventByEl, this);
	}

	unregisterEvents() {
		const maskEls = document.querySelectorAll('[data-mask]');
		maskEls.forEach(this.unregisterMaskKeyUpEventByEl, this);
		const inputEls = document.querySelectorAll('.Form-input input, .Form-input select');
		inputEls.forEach(this.unregisterInputBlurEventByEl, this);
	}

	validate() {
		const invalidFields = [];
		if (!validateFullName(document.register.name.value)) {
			invalidFields.push(document.register.name);
		}
		if (!validateEmail(document.register.email.value)) {
			invalidFields.push(document.email.name);
		}
		if (!validatePhone(document.register.phone.value)) {
			invalidFields.push(document.phone.name);
		}
		if (invalidFields.length) {
			invalidFields[0].focus();
			console.log('error!');
			return false;
		}
		console.log('send!');
		return false;
	}

	toString() {
		return `[Form ${this.name}]`;
	}

	inspect() {
		return this.toString();
	}
}

export default Form;
