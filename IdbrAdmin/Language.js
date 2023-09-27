export class Language {

	static definitions = {
		welcome: {
			en: 'Welcome to IdbrAdmin! To install (or reset) sample database ("world") click this button.',
			ja: 'IdbrAdminへようこそ! サンプルデータベース("world")をインストール(またはリセット)するにはこのボタンをクリックしてください。',
		},
		databaseDeleted: {
			en: 'Database "$1" has been deleted.',
			ja: 'データベース"$1"が削除されました。',
		},
		databaseVersionUpgraded: {
			en: 'Database version has been upgraded.',
			ja: 'データベースのバージョンがアップグレードされました。',
		},
		databaseOpened: {
			en: 'Database "$1" (version $2) has been opened.',
			ja: 'データベース"$1"(バージョン $2)が開かれました。',
		},
		objectStores: {
			en: '$1 object store(s)',
			ja: '$1個のオブジェクトストア',
		},
		rowsInserted: {
			en: `$1 row(s) has been inserted.`,
			ja: '$1行が挿入されました。',
		},
		rowsDeleted: {
			en: `$1 row(s) has been deleted.`,
			ja: '$1行が削除されました。',
		},
		rowsImported: {
			en: `$1 row(s) has been imported.`,
			ja: '$1行がインポートされました。',
		},
		rowsExported: {
			en: `$1 row(s) has been exported.`,
			ja: '$1行がエクスポートされました。',
		},
		rowsUpdated: {
			en: `$1 row(s) has been updated.`,
			ja: '$1行が更新されました。',
		},
		rowsSelected: {
			en: `$1 row(s) has been selected.`,
			ja: '$1行が選択されました。',
		},
		parameterRequired: {
			en: `$1 is required.`,
			ja: '$1は必須です。',
		},
	};

	static get(definitionId, ...parameters) {
		if (this.definitions[definitionId] === undefined) {
			return `${definitionId} (Language definition not found)`;
		}
		const language = Object.keys(this.definitions[definitionId]).includes(navigator.language) ? navigator.language : 'en';
		let string = this.definitions[definitionId][language];
		if (parameters.length) {
			for (const [i, parameter] of parameters.entries()) {
				string = string.replace(`$${i + 1}`, parameter);
			}
		}
		return string;
	}
}
