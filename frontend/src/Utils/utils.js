/* Split string by 'T' */
export const displayTimeAsString = (str) => {
	return str.split("T")[0]
}

/* Returns sheet with sheetName from sheets */
export function findSheet(sheetName, sheets) {
	return sheets.find(sheet => sheet.sheet_name == sheetName);
}

/* Returns composer with composerName from composers */
export function findComposer(composerName, composers) {
	return composers.find(composer => composer.name == composerName);
}