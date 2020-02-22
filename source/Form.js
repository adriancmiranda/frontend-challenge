export function doInputMask(value, pattern, placeholder) {
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
		} else if (placeholder) {
			if (placeholder.split('')[id])
				formatted += placeholder.split('')[id];
		}
	}
	return formatted;
}

export function inputMaskByEl(el, format, placeholder) {
	var val = doInputMask(el.value, format);
	el.value = doInputMask(el.value, format, placeholder);
	if (el.createTextRange) {
		var range = el.createTextRange();
		range.move('character', val.length);
		range.select();
	} else if (el.selectionStart) {
		el.focus();
		el.setSelectionRange(val.length, val.length);
	}
}

export function inputMasksByEl(el, format, placeholder, splitChar = ', ') {
	const formatList = format.split(splitChar);
	const lowerFormat = formatList.reduce((a, b) => a.length <= b.length ? a : b);
	formatList.forEach((formatItem) => {
		if (el.value.length <= lowerFormat.length) {
			inputMaskByEl(el, lowerFormat, placeholder);
		} else if (formatItem.length > lowerFormat.length) {
			inputMaskByEl(el, formatItem, placeholder);
		}
	});
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

export function isString(value) {
	return typeof value === 'string' || value instanceof String;
}

export function isFunction(value) {
	return typeof value === 'function';
}

export function isRequired(field) {
	return !!(field && field.required);
}

export function getParentsFromEl($el, parentsSelector) {
	const elements = [];
	while (($el = $el.parentElement) !== null) {
		if ($el.nodeType !== Node.ELEMENT_NODE) {
			continue;
		}
		if (!parentsSelector || $el.matches(parentsSelector)) {
			elements.push($el);
		}
	}
	return elements;
}

export function getSiblingsFromEl($el, siblingSelector) {
	const siblings = [];
	let sibling = $el.parentNode.firstChild;
	while (sibling) {
		if (sibling.nodeType === 1 && sibling !== $el) {
			if (siblingSelector) {
				if (sibling.matches(siblingSelector)) {
					siblings.push(sibling);
				}
			} else {
				siblings.push(sibling);
			}
		}
		sibling = sibling.nextSibling;
	}
	return siblings;
}

export function getChildrenWidth($children) {
	return $children.reduce((size, $child, index, { length }) => {
		size += $child.clientWidth;
		return size;
	}, 0);
}

export function setChildrenWidth(childrenWidth, $children) {
	return $children.map(($child, index, { length }) => {
		$child.style.width = `${childrenWidth / length}px`;
		return $child;
	});
}

export function setListWidthAndRetrieveResult($wrapper, $children, gutterX = 0) {
	const childrenWidth = getChildrenWidth($children);
	setChildrenWidth(childrenWidth, $children);
	$wrapper.style.width = `${childrenWidth + gutterX}px`;
	return childrenWidth;
}

export function assignOptions(options) {
	const opts = Object.assign({ currentStep: 1 }, options);
	opts.rules = Object.assign({}, opts.rules);
	return opts;
}

export function assertOptions(options) {
	if (!options) {
		throw new Error('É necessário que você passe um objeto com opções a serem validadas');
	}
	if ('name' in options && !isString(options.name)) {
		throw new Error('É necessário que o parâmetro "name" seja uma string');
	}
	if (options.rules === undefined || options.rules === null) {
		throw new Error('É preciso haver um parâmetro "rules" como um objeto');
	}
	return options;
}

export class Form {

	constructor(options) {
		this.options = assertOptions(assignOptions(options));
		this.form = document[this.options.name];
		this.formWrapper = getParentsFromEl(this.form, '[data-ui-form-wrapper]')[0];
		this.formChildren = [...this.form.children];
		this.steps = this.formChildren.length;
		this.currentStep = this.options.currentStep;
		this.registerEvents = this.registerEvents.bind(this);
		this.unregisterEvents = this.unregisterEvents.bind(this);
		this.onChangeField = this.onChangeField.bind(this);
		this.submit = this.submit.bind(this);
		this.validate = this.validate.bind(this);
		this.clearErrors = this.clearErrors.bind(this);
		this.getErrors = this.getErrors.bind(this);
		this.getFieldByName = this.getFieldByName.bind(this);
		this.getButtons = this.getButtons.bind(this);
		this.getFields = this.getFields.bind(this);
		this.setStep = this.setStep.bind(this);
		this.jumpStep = this.jumpStep.bind(this);
		this.nextStep = this.nextStep.bind(this);
		this.prevStep = this.prevStep.bind(this);
		this.arrange = this.arrange.bind(this);
		this.eventsMaskMap = {};
		this.submitting = false;
	}

	registerMaskKeyUpEventByEl($el) {
		const format = $el.getAttribute('data-mask-format');
		const placeholder = $el.getAttribute('data-mask-placeholder');
		const splitChar = $el.getAttribute('data-mask-split-char');
		this.eventsMaskMap[$el.name] = () => {
			if (splitChar) {
				inputMasksByEl($el, format, placeholder, splitChar);
			} else {
				inputMaskByEl($el, format, placeholder);
			}
		};
		$el.addEventListener('keyup', this.eventsMaskMap[$el.name]);
		inputMaskByEl($el, format, placeholder);
	}

	unregisterMaskKeyUpEventByEl($el) {
		$el.removeEventListener('keyup', this.eventsMaskMap[$el.name]);
	}

	registerInputBlurEventByEl($el) {
		$el.addEventListener('blur', this.onChangeField);
		$el.addEventListener('change', this.onChangeField);
	}

	unregisterInputBlurEventByEl($el) {
		$el.removeEventListener('blur', this.onChangeField);
		$el.removeEventListener('change', this.onChangeField);
	}

	registerButtonEventByEl($el) {
		$el.onclick = this.submit;
	}

	unregisterButtonEventByEl($el) {
		delete $el.onclick;
	}

	onChangeField() {
		if (this.submitting) this.getErrors(/*this.currentStep*/);
	}

	registerEvents() {
		const $masks = this.getInputMasks(/*this.currentStep*/);
		$masks.forEach(this.registerMaskKeyUpEventByEl, this);
		const $fields = this.getFields(/*this.currentStep*/);
		$fields.forEach(this.registerInputBlurEventByEl, this);
		const $buttons = this.getButtons(/*this.currentStep*/);
		$buttons.forEach(this.registerButtonEventByEl, this);
	}

	unregisterEvents() {
		const $masks = this.getInputMasks(/*this.currentStep*/);
		$masks.forEach(this.unregisterMaskKeyUpEventByEl, this);
		const $fields = this.getFields(/*this.currentStep*/);
		$fields.forEach(this.unregisterInputBlurEventByEl, this);
		const $buttons = this.getButtons(/*this.currentStep*/);
		$buttons.forEach(this.unregisterButtonEventByEl, this);
	}

	serialize(stepIndex) {
		const $fields = this.getFields(stepIndex);
		return $fields.reduce((data, $field) => {
			data[$field.name] = $field.value;
			return data;
		}, {});
	}

	setStep(index) {
		this.currentStep = Math.min(Math.max(0, parseInt(index, 0)), this.steps);
		return this.currentStep;
	}

	jumpStep(amount) {
		return this.setStep(this.currentStep + amount);
	}

	nextStep() {
		return this.jumpStep(+1);
	}

	prevStep() {
		return this.jumpStep(-1);
	}

	submit(evt) {
		this.submitting = true;
		if (this.validate(/*this.currentStep*/)) {
			const data = this.serialize();
			const body = JSON.stringify(data);
			fetch('/save-request', { method: 'post', body }).then((response) =>
				response.json()
			).then((response) => {
				this.submitting = false;
				alert('[request has been saved]');
				console.log('[request has been saved]', response);
			});
		}
		return false;
	}

	validate(stepIndex) {
		const invalidFields = this.getErrors(stepIndex);
		if (invalidFields.length) {
			invalidFields[0].focus();
			return false;
		}
		return true;
	}

	clearErrors(stepIndex) {
		const $fields = this.getFields(stepIndex);
		$fields.forEach(($field) => {
			const $fieldInput = getParentsFromEl($field, '[data-ui-input-name]');
			if ($fieldInput[0]) $fieldInput[0].classList.remove('is-error');
			const $fieldError = getSiblingsFromEl($field, '[data-ui-input-error]');
			if ($fieldError[0]) $fieldError[0].innerHTML = '&nbsp;';
		});
	}

	getErrors(stepIndex, highlight = true) {
		this.clearErrors(stepIndex);
		const invalidFields = [];
		const $fields = this.getFields(stepIndex);
		$fields.forEach(($field) => {
			const rule = this.options.rules[$field.name] || {};
			const validate = isFunction(rule.validate);
			const isValidRule = validate ? rule.validate($field.value) : !!$field.value;
			if (isRequired($field) && !isValidRule) {
				const $fieldInput = getParentsFromEl($field, '[data-ui-input-name]');
				if (highlight && $fieldInput[0]) $fieldInput[0].classList.add('is-error');
				const $fieldError = getSiblingsFromEl($field, '[data-ui-input-error]');
				if (highlight && $fieldError[0]) $fieldError[0].innerHTML = (
					rule.errorMessage || 'Campo inválido'
				);
				invalidFields.push($field);
			}
		});
		return invalidFields;
	}

	getFieldByName(name) {
		return document[this.options.name][name] || null;
	}

	getButtons(stepIndex) {
		const stepSelector = stepIndex ? `:nth-child(${parseInt(stepIndex, 10)})` : '';
		const formSelector = `form[name="${this.options.name}"]${stepSelector}`;
		return [...document.querySelectorAll([
			`${formSelector} button[type="submit"]`,
			`${formSelector} input[type="submit"]`,
		].join(','))];
	}

	getInputMasks(stepIndex) {
		const stepSelector = stepIndex ? `:nth-child(${parseInt(stepIndex, 10)})` : '';
		const formSelector = `form[name="${this.options.name}"]${stepSelector}`;
		return [...document.querySelectorAll(`${formSelector} input[data-mask-format]`)];
	}

	getFields(stepIndex) {
		const stepSelector = stepIndex ? `:nth-child(${parseInt(stepIndex, 10)})` : '';
		const formSelector = `form[name="${this.options.name}"]${stepSelector}`;
		return [...document.querySelectorAll([
			`${formSelector} input[name]`,
			`${formSelector} select[name]`,
		].join(','))];
	}

	arrange() {
		this.stepsWidth = setListWidthAndRetrieveResult(this.formWrapper, this.formChildren, 100);
	}

	toString() {
		return `[Form ${this.options.name}]`;
	}

	inspect() {
		return this.toString();
	}
}

export default Form;
