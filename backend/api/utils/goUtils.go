package utils

func RemoveElementOfSlice(slice []string, index int) []string {
	/*
		Remove element of string slice by index
	*/

	return append(slice[:index], slice[index+1:]...)
}
