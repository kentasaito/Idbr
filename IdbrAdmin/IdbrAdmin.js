import { Idbr } from '../Idbr.js';
import { Modal } from './Modal.js';
import { Parameter } from './Parameter.js';
import { Language } from './Language.js';

export class IdbrAdmin {

	static modals = [];

	static installWorld() {
		Idbr.deleteDatabase({ "name":"world" }).then(event => {
			document.querySelector('#openDatabaseForm [name="name"]').value = '"world"';
			document.querySelector('#openDatabaseForm [name="version"]').value = '1';
			document.querySelector('#openDatabaseForm [name="onupgradeneeded"]').value =
			`Idbr.createObjectStore({ "name":"country" });\n` +
			`Idbr.createObjectStore({ "name":"city" });\n` +
			`Idbr.createObjectStore({ "name":"countryLanguage", "options":{ "autoIncrement":true } })\n` +
			`  .transaction.oncomplete = (event) => {\n` +
			`    Idbr.import({ "into":"country", "file":"./world/country.js" });\n` +
			`    Idbr.import({ "into":"city", "file":"./world/city.js" });\n` +
			`    Idbr.import({ "into":"countryLanguage", "file":"./world/countryLanguage.js" });\n` +
			`  }\n` +
			`;`;
			document.querySelector('#openDatabaseForm [type="submit"]').click();
		});
	}

	static appendAlert(parent, type, innerHTML) {
		const alert = document.createElement('div');
		alert.classList.add('alert', `alert-${type}`, 'alert-dismissible', 'fade', 'show');
		alert.innerHTML = innerHTML
			+ `<button type="button" class="btn-close" data-bs-dismiss="alert"></button>`
		;
		parent.append(alert);
	}

	static downloadExportResult(from, rows) {
		const content = `export default ${JSON.stringify(rows, null, 2)}\n`;
		const blob = new Blob([ content ], { type:"text/javascript" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.download = `${from}.js`;
		a.href = url;
		a.click();
		URL.revokeObjectURL(url);
	}

	static drawSelectResultColumnNames(columnNames) {
		const tr = document.querySelector('#selectResult thead tr');
		for (const columnName of columnNames) {
			const th = document.createElement('th');
			th.innerText = columnName;
			tr.append(th);
		}
	}

	static drawSelectResultRows(columnNames, rows) {
		const tbody = document.querySelector('#selectResult tbody');
		for (const row of rows) {
			const tr = document.createElement('tr');
			for (const columnName of columnNames) {
				const td = document.createElement('td');
				td.innerText = row[columnName];
				if (typeof row[columnName] === 'number') {
					td.classList.add('text-end');
				}
				tr.append(td);
			}
			tbody.append(tr);
		}
	}

	static async start() {
		for (const element of document.querySelectorAll('.dml')) {
			element.disabled = true;
		}
		const alerts = document.getElementById('alerts');
		this.appendAlert(alerts, 'info', Language.get('welcome') + ' <button id="installWorld" class="btn btn-sm btn-primary">installWorld</button>');
		document.getElementById('installWorld').addEventListener('click', event => {
			this.installWorld();
		});

		for (const modalId of Object.keys(Modal.definitions)) {
			const modalElement = Modal.create(modalId);
			this.modals[modalId] = new bootstrap.Modal(modalElement);
			modalElement.addEventListener('show.bs.modal', event => {
				alerts.innerText = '';
			});
			modalElement.addEventListener('shown.bs.modal', event => {
				modalElement.querySelector('input').focus();
			});
			modalElement.addEventListener('hidden.bs.modal', event => {
				modalElement.querySelector('.alerts').innerText = '';
			});
			modalElement.querySelector('form').addEventListener('submit', event => {
				event.preventDefault();
				const modalAlerts = modalElement.querySelector('.alerts');
				modalAlerts.innerText = '';
				const parameterGetResult = Parameter.get(modalId, modalElement);
				if (parameterGetResult.error) {
					this.appendAlert(modalAlerts, 'danger', `<div class="fw-bold">${parameterGetResult.error.parameterId}:</div>${parameterGetResult.error.message}`);
					return;
				}
				Idbr[modalId](parameterGetResult.parameter)
					.then(result => {
						document.querySelector('#selectResult thead tr').innerText = '';
						document.querySelector('#selectResult tbody').innerText = '';
						this.resolve(modalId, parameterGetResult, result);
						for (const element of document.querySelectorAll('.dml')) {
							element.disabled = Idbr.db === undefined;
						}
						this.modals[modalId].hide();
					})
					.catch(error => {
						this.appendAlert(modalAlerts, 'danger', error);
					})
				;
			});
		}
	}

	static resolve(modalId, parameterGetResult, result) {
		alerts.innerText = '';
		Modal.definitions[modalId].resolve(this, result);
		for (let [parameterId, code] of Object.entries(parameterGetResult.code)) {
			parameterGetResult.code[parameterId] = '  ' + code.replace(/\n/g, '\n  ');
		}
		const code =
			'<pre>' +
			`Idbr.${modalId}({\n` +
				Object.values(parameterGetResult.code).join(',\n') + ',\n' +
			'});' +
			'</pre>'
		;
		this.appendAlert(alerts, 'secondary', code);
	}
}
