import { Parameter } from './Parameter.js';
import { Language } from './Language.js';

export class Modal {

	static definitions = {
		deleteDatabase: {
			parameterIds: ['name'],
			resolve: (IdbrAdmin, result) => {
				IdbrAdmin.appendAlert(alerts, 'success', Language.get('databaseDeleted', result.name));
			},
		},
		openDatabase: {
			parameterIds: ['name', 'version', 'onupgradeneeded'],
			resolve: (IdbrAdmin, result) => {
				if (result.upgraded) {
					IdbrAdmin.appendAlert(alerts, 'info', Language.get('databaseVersionUpgraded'));
				}
				IdbrAdmin.appendAlert(alerts, 'success', Language.get('databaseOpened', result.name, result.version));
				IdbrAdmin.appendAlert(alerts, 'info', Language.get('objectStores', result.objectStoreNames.length) + ': ' + [...result.objectStoreNames].join(', '));
			},
		},
		insert: {
			parameterIds: ['into', 'rows'],
			resolve: (IdbrAdmin, result) => {
				IdbrAdmin.appendAlert(alerts, 'success', Language.get('rowsInserted', result.numInsertedRows));
				IdbrAdmin.appendAlert(alerts, 'info', `lastInsertId: "${result.lastInsertId}"`);
			},
		},
		delete: {
			parameterIds: ['from', 'where'],
			resolve: (IdbrAdmin, result) => {
				IdbrAdmin.appendAlert(alerts, 'success', Language.get('rowsDeleted', result.numDeletedRows));
			},
		},
		import: {
			parameterIds: ['into', 'file'],
			resolve: (IdbrAdmin, result) => {
				IdbrAdmin.appendAlert(alerts, 'success', Language.get('rowsImported', result.numImportedRows));
				IdbrAdmin.appendAlert(alerts, 'info', `lastInsertId: "${result.lastInsertId}"`);
			},
		},
		export: {
			parameterIds: ['from', 'where'],
			resolve: (IdbrAdmin, result) => {
				IdbrAdmin.appendAlert(alerts, 'success', Language.get('rowsExported', result.rows.length));
				IdbrAdmin.downloadExportResult(result.from, result.rows);
			},
		},
		update: {
			parameterIds: ['update', 'set', 'where'],
			resolve: (IdbrAdmin, result) => {
				IdbrAdmin.appendAlert(alerts, 'success', Language.get('rowsUpdated', result.numUpdatedRows));
			},
		},
		select: {
			parameterIds: ['select', 'from', 'join', 'where', 'groupBy', 'aggregate', 'having', 'orderBy', 'limit'],
			resolve: (IdbrAdmin, result) => {
				IdbrAdmin.appendAlert(alerts, 'success', Language.get('rowsSelected', result.rows.length));
				IdbrAdmin.drawSelectResultColumnNames(result.columnNames);
				IdbrAdmin.drawSelectResultRows(result.columnNames, result.rows);
			},
		},
		dropColumns: {
			parameterIds: ['columnNames', 'from'],
			resolve: (IdbrAdmin, result) => {
				IdbrAdmin.appendAlert(alerts, 'success', Language.get('rowsUpdated', result.numUpdatedRows));
			},
		},
	};

	static create(modalId) {
		const modal = document.createElement('div');
		modal.classList.add('modal', 'fade');
		modal.setAttribute('id', `${modalId}Modal`);
		modal.setAttribute('tabindex', '-1');
		document.body.append(modal);

		const modalDialog = document.createElement('div');
		modalDialog.classList.add('modal-dialog');
		modal.append(modalDialog);

		const modalContent = document.createElement('div');
		modalContent.classList.add('modal-content');
		modalDialog.append(modalContent);

		const form = document.createElement('form');
		form.setAttribute('id', `${modalId}Form`);
		modalContent.append(form);

		const modalHeader = document.createElement('div');
		modalHeader.classList.add('modal-header');
		form.append(modalHeader);

		const modalTitle = document.createElement('h5');
		modalTitle.classList.add('modal-title');
		modalTitle.innerText = modalId;
		modalHeader.append(modalTitle);

		const close = document.createElement('button');
		close.setAttribute('type', 'button');
		close.classList.add('btn-close');
		close.setAttribute('data-bs-dismiss', 'modal');
		modalHeader.append(close);

		const modalBody = document.createElement('div');
		modalBody.classList.add('modal-body');
		form.append(modalBody);

		const alerts = document.createElement('div');
		alerts.classList.add('alerts');
		modalBody.append(alerts);

		for (const parameterName of this.definitions[modalId].parameterIds) {
			const prameter = Parameter.definitions[parameterName];

			const container = document.createElement('div');
			container.classList.add('mb-3');
			modalBody.append(container);

			const label = document.createElement('label');
			label.classList.add('col-form-label');
			label.innerText = `${parameterName}: `;
			if (prameter.required) {
				const required = document.createElement('span');
				required.classList.add('text-muted');
				required.innerText = '(required)';
				label.append(required);
			}
			container.append(label);

			if (prameter.bracket) {
				const bracket = document.createElement('div');
				bracket.classList.add('fw-lighter');
				bracket.innerText = prameter.bracket[0];
				container.append(bracket);
			}

			if (prameter.type === 'textarea') {
				const textarea = document.createElement('textarea');
				textarea.setAttribute('rows', '4');
				textarea.classList.add('form-control');
				textarea.setAttribute('name', parameterName);
				if (prameter.placeholder) {
					textarea.setAttribute('placeholder', prameter.placeholder);
				}
				container.append(textarea);
			}
			else {
				const input = document.createElement('input');
				input.setAttribute('type', 'text');
				input.classList.add('form-control');
				input.setAttribute('name', parameterName);
				if (prameter.placeholder) {
					input.setAttribute('placeholder', prameter.placeholder);
				}
				container.append(input);
			}

			if (prameter.bracket) {
				const bracket = document.createElement('div');
				bracket.classList.add('fw-lighter');
				bracket.innerText = prameter.bracket[1];
				container.append(bracket);
			}
		}

		const modalFooter = document.createElement('div');
		modalFooter.classList.add('modal-footer');
		form.append(modalFooter);

		const cancel = document.createElement('button');
		cancel.setAttribute('type', 'button');
		cancel.classList.add('btn', 'btn-secondary');
		cancel.setAttribute('data-bs-dismiss', 'modal');
		cancel.innerText = 'Cancel';
		modalFooter.append(cancel);

		const ok = document.createElement('button');
		ok.setAttribute('type', 'submit');
		ok.classList.add('btn', 'btn-primary');
		ok.innerText = modalId;
		modalFooter.append(ok);

		return modal;
	}
}
