package utils

func RemoveElementOfSlice(slice []string, index int) []string {

	// Remove element of string slice by index
	return append(slice[:index], slice[index+1:]...)
}

func FindIndexByValue(slice []string, value string) int {
	
	// Return Index of a specific value in a slice
	for p, v := range slice {
		if v == value {
			return p
		}
	}
	return -1
}

func CheckSliceContains(slice []string, e string) bool {
	for _, a := range slice {
		if a == e {
			return true
		}
	}
	return false
}
