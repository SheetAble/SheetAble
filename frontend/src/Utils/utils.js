/* Split string by 'T' */
export const displayTimeAsString = (str) => {
	return str.split("T")[0]
}

/* Returns sheet with sheetName from sheetPages */
export function findSheetByPages(sheetName, sheetPages) {
	for (let key in sheetPages) {
		if (!sheetPages.hasOwnProperty(key)) continue;
		const page = sheetPages[key]
		const result = page.find(sheet => sheet.sheet_name == sheetName)

		if (result != undefined) return result
	}
}

/* Returns sheet with sheetName from sheets */
export function findSheetBySheets(sheetName, sheets) {
	return sheets.find(sheet => sheet.sheet_name == sheetName);
}

/* Returns composer with composerName from composerPages */
export function findComposerByPages(composerName, composerPages) {
	for (let key in composerPages) {
		if (!composerPages.hasOwnProperty(key)) continue;
		const page = composerPages[key]
		const result = page.find(composer => composer.name == composerName)

		if (result != undefined) return result
	}
}

/* Returns composer with composerName from composers */
export function findComposerByComposers(composerName, composers) {
	return composers.find(composer => composer.name == composerName);
}