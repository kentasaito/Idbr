import { Modal } from './Modal.js';
import { Language } from './Language.js';

export class Parameter {

	static definitions = {
		'name': {
			required: true,
			callback: (value) => JSON.parse(value),
			placeholder: '"world"',
		},
		'version': {
			callback: (value) => value === '' ? undefined : JSON.parse(value),
			placeholder: '1',
		},
		'onupgradeneeded': {
			callback: (value) => Function(`"use strict"; return (Idbr) => { ${value} }`)(),
			placeholder: 'Idbr.createObjectStore({ "name":"country" });\nIdbr.createObjectStore({ "name":"city" });\nIdbr.createObjectStore({ "name":"countryLanguage", "options":{ "autoIncrement":true } });',
			bracket: ['(Idbr) => {', '}'],
			type: 'textarea',
		},
		'into': {
			required: true,
			callback: (value) => JSON.parse(value),
			placeholder: '"country"',
		},
		'rows': {
			required: true,
			callback: (value) => Function(`"use strict"; return [${value}]`)(),
			placeholder: '{ "countryId": "AAA" }, { "countryId": "AAB" }',
			bracket: ['[', ']'],
		},
		'from': {
			required: true,
			callback: (value) => JSON.parse(value),
			placeholder: '"country"',
		},
		'where': {
			callback: (value) => value === '' ? undefined : Function(`"use strict";return row => ${value}`)(),
			placeholder: 'row.countryPopulation >= 100000000 && row.countryPopulation < 1000000000',
			bracket: ['row =>', ''],
		},
		'groupBy': {
			callback: (value) => JSON.parse(value),
			placeholder: '"continent"',
		},
		'aggregate': {
			callback: (value) => Function(`"use strict"; return {${value}}`)(),
			placeholder: '"count":(rows, Idbr) => Idbr.count(rows), "population":(rows, Idbr) => Idbr.sum(rows, "population")',
			bracket: ['{', '}'],
		},
		'having': {
			callback: (value) => value === '' ? undefined : Function(`"use strict";return row => ${value}`)(),
			placeholder: 'row.count >= 30 && row.count < 55',
			bracket: ['row =>', ''],
		},
		'orderBy': {
			callback: (value) => value === '' ? undefined : Function(`"use strict";return (a, b) => ${value}`)(),
			placeholder: 'a.countryPopulation < b.countryPopulation ? -1 : a.countryPopulation > b.countryPopulation ? 1 : 0',
			bracket: ['(a, b) =>', ''],
		},
		'limit': {
			callback: (value) => value === '' ? undefined : JSON.parse(`[${value}]`),
			placeholder: '0, 10',
			bracket: ['[', ']'],
		},
		'file': {
			required: true,
			callback: (value) => JSON.parse(value),
			placeholder: '"./world/country.js"',
		},
		'update': {
			required: true,
			callback: (value) => JSON.parse(value),
			placeholder: '"country"',
		},
		'set': {
			required: true,
			callback: (value) => Function(`"use strict";return row => ({${value}})`)(),
			placeholder: '"countryName": "Dummy"',
			bracket: ['row => ({', '})'],
		},
		'select': {
			callback: (value) => value === '' ? undefined : Function(`"use strict";return row => ({${value}})`)(),
			placeholder: '"id": row.countryId',
			bracket: ['row => ({', '})'],
		},
		'join': {
			callback: (value) => JSON.parse(`[${value}]`),
			placeholder: '"city", "countryLanguage"',
			bracket: ['[', ']'],
		},
		'columnNames': {
			required: true,
			callback: (value) => JSON.parse(`[${value}]`),
			placeholder: '"countriId2", "gnpOld"',
			bracket: ['[', ']'],
		},
	};

	static get(modalId, modalElement) {
		const result = {
			parameter: {},
			code: {},
			error: null,
		}
		for (const parameterId of Modal.definitions[modalId].parameterIds) {
			const value = modalElement.querySelector(`[name="${parameterId}"]`).value;
			if (this.definitions[parameterId].required && value === '') {
				throw new Error(Language.get('parameterRequired', parameterId));
			}
			if (value) {
				try {
					const parameterResult = this.definitions[parameterId].callback(value);
					if (parameterResult !== undefined) {
						result.code[parameterId] = this.getCode(parameterId, value);
						result.parameter[parameterId] = parameterResult;
					}
				}
				catch (error) {
					result.error = {
						parameterId,
						message: error,
					}
					return result;
				}
			}
		}
		return result;
	}

	static getCode(parameterId, value) {
		let code;
		if (this.definitions[parameterId].bracket) {
			if (this.definitions[parameterId].type === 'textarea') {
				value =
					this.definitions[parameterId].bracket[0] + '\n' +
					'  ' + value.replace(/\n/g, '\n  ') + '\n' +
					this.definitions[parameterId].bracket[1]
				;
			}
			else {
				value =
					this.definitions[parameterId].bracket[0] +
					value +
					this.definitions[parameterId].bracket[1]
				;
			}
		}
		code = `${parameterId}: ${value}`;
		return code;
	}
}
