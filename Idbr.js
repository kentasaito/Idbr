export class Idbr {

	static db;

	static sum(rows, columnName) {
		return rows.reduce((previousValue, currentValue) => previousValue + currentValue[columnName], 0);
	}

	static min(rows, columnName) {
		return rows.reduce((previousValue, currentValue) => previousValue === null ? currentValue[columnName] : Math.min(previousValue, currentValue[columnName]), null);
	}

	static max(rows, columnName) {
		return rows.reduce((previousValue, currentValue) => previousValue === null ? currentValue[columnName] : Math.max(previousValue, currentValue[columnName]), null);
	}

	static count(rows) {
		return rows.length;
	}

	static avr(rows, columnName) {
		return rows.reduce((previousValue, currentValue) => previousValue + currentValue[columnName], 0) / rows.length;
	}

	static transaction(storeNames, mode, oncomplete) {
		const transaction = this.db.transaction(storeNames, mode);
		transaction.oncomplete = oncomplete;
		return transaction;
	}

	static deleteObjectStore(parameter) {
		return this.db.deleteObjectStore(parameter.name);
	}

	static createObjectStore(parameter) {
		return this.db.createObjectStore(parameter.name, { keyPath:`${parameter.name}Id`, ...(parameter.options ?? {}) });
	}

	static deleteDatabase(parameter) {
		return new Promise((resolve) => {
			if (this.db) {
				this.db.close();
				this.db = undefined;
			}
			const result = {
				name: parameter.name,
			};
			const request = indexedDB.deleteDatabase(parameter.name);
			request.onsuccess = (event) => {
				resolve(result);
			};
		});
	}

	static openDatabase(parameter) {
		return new Promise((resolve, reject) => {
			if (this.db) {
				this.db.close();
				this.db = undefined;
			}
			const result = {
				upgraded: false,
				name: null,
				version: null,
				objectStoreNames: null,
			};
			const request = indexedDB.open(parameter.name, parameter.version);
			request.onupgradeneeded = (event) => {
				this.db = request.result;
				try {
					parameter.onupgradeneeded(this);
				}
				catch (error) {
					return reject(error);
				}
				result.upgraded = true;
			}
			request.onerror = (event) => {
				reject(event.target.error);
			};
			request.onsuccess = (event) => {
				this.db = request.result;
				result.name = this.db.name;
				result.version = this.db.version;
				result.objectStoreNames = this.db.objectStoreNames;
				resolve(result);
			};
		});
	}

	static insert(parameter) {
		return new Promise((resolve, reject) => {
			const result = {
				numInsertedRows: 0,
				lastInsertId: null,
			};
			const transaction = this.transaction(parameter.into, "readwrite", (event) => resolve(result));
			const objectStore = transaction.objectStore(parameter.into);
			for (const [i, row] of parameter.rows.entries()) {
				try {
					const request = objectStore.add(row);
					request.onsuccess = (event) => {
						result.numInsertedRows++;
						result.lastInsertId = event.target.result;
					};
				}
				catch (error) {
					return reject(new DOMException(error + ` (At row #${i + 1})`));
				}
			}
		});
	}

	static delete(parameter) {
		return new Promise((resolve, reject) => {
			const result = {
				numDeletedRows: 0,
			};
			const transaction = this.transaction(parameter.from, "readwrite", (event) => resolve(result));
			const objectStore = transaction.objectStore(parameter.from);
			const getAllRequest = objectStore.getAll();
			getAllRequest.onerror = (event) => {
				reject(event.target.error.message);
			};
			getAllRequest.onsuccess = (event) => {
				let rows = event.target.result;
				if (parameter.where) {
					rows = rows.filter(parameter.where);
				}
				for (const [i, row] of rows.entries()) {
					try {
						const request = objectStore.delete(row[`${parameter.from}Id`]);
						request.onsuccess = (event) => {
							result.numDeletedRows++;
						};
					}
					catch (error) {
						return reject(new DOMException(error + ` (At row #${i + 1})`));
					}
				}
			};
		});
	}

	static import(parameter) {
		return new Promise((resolve, reject) => {
			import(parameter.file)
				.then(module => {
					const result = {
						numImportedRows: 0,
						lastInsertId: null,
					};
					const transaction = this.transaction(parameter.into, "readwrite", (event) => resolve(result));
					const objectStore = transaction.objectStore(parameter.into);
					for (const [i, row] of module.default.entries()) {
						try {
							const request = objectStore.add(row);
							request.onsuccess = (event) => {
								result.numImportedRows++;
								result.lastInsertId = event.target.result;
							};
						}
						catch (error) {
							return reject(new DOMException(error + ` (At row #${i + 1})`));
						}
					}
				})
				.catch(error => reject(`Unable to import from the "${parameter.file}"`))
			;
		});
	}

	static export(parameter) {
		return new Promise((resolve) => {
			const result = {
				from: parameter.from,
				rows: null,
			};
			const transaction = this.transaction(parameter.from, "readonly", (event) => resolve(result));
			const objectStore = transaction.objectStore(parameter.from);
			const getAllRequest = objectStore.getAll();
			getAllRequest.onsuccess = (event) => {
				let rows = event.target.result;
				if (parameter.where) {
					rows = rows.filter(parameter.where);
				}
				result.rows = rows;
			};
		});
	}

	static update(parameter) {
		return new Promise((resolve, reject) => {
			const result = {
				numUpdatedRows: 0,
			};
			const transaction = this.transaction(parameter.update, "readwrite", (event) => resolve(result));
			const objectStore = transaction.objectStore(parameter.update);
			const getAllRequest = objectStore.getAll();
			getAllRequest.onsuccess = (event) => {
				let rows = event.target.result;
				if (parameter.where) {
					rows = rows.filter(parameter.where);
				}
				for (const [i, row] of rows.entries()) {
					try {
						const request = objectStore.put({ ...row, ...parameter.set(row) });
						request.onsuccess = (event) => {
							result.numUpdatedRows++;
						};
					}
					catch (error) {
						return reject(new DOMException(error + ` (At row #${i + 1})`));
					}
				}
			};
		});
	}

	static async #join(objectStoreNames, joinedRows) {
		return new Promise(async (resolve) => {
			let commonColumnNames = Object.keys(joinedRows[0]);
			for (const objectStoreName of objectStoreNames) {
				const transaction = this.transaction(objectStoreName, "readonly");
				const objectStore = transaction.objectStore(objectStoreName);
				const getAllRequest = objectStore.getAll();
				const rows = await new Promise(resolve => {
					objectStore.getAll().onsuccess = event => {
						let rows = event.target.result;
						resolve(rows);
					};
				});
				commonColumnNames = commonColumnNames.filter((v) =>
					Object.keys(rows[0]).includes(v)
				);
				const newRows = [];
				for (const leftRow of joinedRows) {
					loop:
					for (const rightRow of rows) {
						for (const commonColumnName of commonColumnNames) {
							if (rightRow[commonColumnName] !== leftRow[commonColumnName]) {
								continue loop;
							}
						}
						newRows.push({ ...leftRow, ...rightRow });
					}
				}
				joinedRows = newRows;
			}
			resolve(joinedRows);
		});
	}

	static #groupBy(parameter, rows) {
		const groups = {};
		if (!parameter.groupBy) {
			groups.all = rows;
		}
		else {
			for (const row of rows) {
				if (groups[row[parameter.groupBy]] === undefined) {
					groups[row[parameter.groupBy]] = [];
				}
				groups[row[parameter.groupBy]].push(row);
			}
		}
		const groupedRows = {};
		for (const [groupName, group] of Object.entries(groups)) {
			groupedRows[groupName] = { };
			if (parameter.groupBy) {
				groupedRows[groupName][parameter.groupBy] = groupName;
			}
			for (const [aggregateName, aggregate] of Object.entries(parameter.aggregate)) {
				groupedRows[groupName][aggregateName] = parameter.aggregate[aggregateName](group, this);
			}
		}
		rows = Object.values(groupedRows);
		if (parameter.having) {
			rows = rows.filter(parameter.having);
		}
		return rows;
	}

	static select(parameter) {
		return new Promise(async (resolve) => {
			const result = {
				columnNames: parameter.select ? Object.keys(parameter.select) : [],
				rows: null,
			};
			const transaction = this.transaction(parameter.from, "readonly", (event) => resolve(result));
			const objectStore = transaction.objectStore(parameter.from);
			const getAllRequest = objectStore.getAll();
			let rows = await new Promise(resolve => {
				objectStore.getAll().onsuccess = event => {
					let rows = event.target.result;
					resolve(rows);
				};
			});
			if (parameter.join) {
				rows = await this.#join(parameter.join, rows);
			}
			if (parameter.where) {
				rows = rows.filter(parameter.where);
			}
			if (parameter.aggregate) {
				rows = this.#groupBy(parameter, rows);
			}
			if (!parameter.select) {
				for (const row of rows) {
					result.columnNames = [...new Set([...result.columnNames, ...Object.keys(row)])];
				}
			}
			if (parameter.orderBy) {
				rows = rows.sort(parameter.orderBy);
			}
			if (parameter.limit) {
				rows = rows.slice(parameter.limit[0], parameter.limit[1]);
			}
			result.rows = rows;
		});
	}

	static dropColumns(parameter) {
		return new Promise((resolve, reject) => {
			const result = {
				numUpdatedRows: 0,
			};
			const transaction = this.transaction(parameter.from, "readwrite", (event) => resolve(result));
			const objectStore = transaction.objectStore(parameter.from);
			const getAllRequest = objectStore.getAll();
			getAllRequest.onsuccess = (event) => {
				let rows = event.target.result;
				for (const [i, row] of rows.entries()) {
					for (const columnName of parameter.columnNames) {
						delete row[columnName];
					}
					try {
						const request = objectStore.put(row);
						request.onsuccess = (event) => {
							result.numUpdatedRows++;
						};
					}
					catch (error) {
						return reject(new DOMException(error + ` (At row #${i + 1})`));
					}
				}
			};
		});
	}
}
