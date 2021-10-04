package utils

func RemoveElementOfSlice(slice []string, index int) []string {
	/*
		Remove element of string slice by index
	*/

	slice[index] = slice[len(slice)-1]
	return slice[:len(slice)-1]
}
