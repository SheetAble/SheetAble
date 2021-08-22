/* Split string by 'T' */
export const displayTimeAsString = (str) => {
	return str.split("T")[0]
}

/* Returns sheet with sheetName from sheetPages */
export function findSheet(sheetName, sheetPages) {
	for (let key in sheetPages) {
		if (!sheetPages.hasOwnProperty(key)) continue;
		const page = sheetPages[key]
		const result = page.find(sheet => sheet.sheet_name == sheetName)

		if (result != undefined) return result
	}
}

/* Returns composer with composerName from composers */
export function findComposer(composerName, composers) {
	return composers.find(composer => composer.name == composerName);
}