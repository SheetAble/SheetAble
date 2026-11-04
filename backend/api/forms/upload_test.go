package forms

import (
	"reflect"
	"testing"
)

func TestUploadRequestInstrumentList(t *testing.T) {
	request := UploadRequest{
		Instruments: " Piano, Violin, piano, ,  Cello ",
	}

	got := request.InstrumentList()
	want := []string{"Piano", "Violin", "Cello"}

	if !reflect.DeepEqual(got, want) {
		t.Fatalf("InstrumentList() = %#v, want %#v", got, want)
	}
}

func TestUploadRequestInstrumentListEmpty(t *testing.T) {
	request := UploadRequest{}

	if got := request.InstrumentList(); len(got) != 0 {
		t.Fatalf("InstrumentList() = %#v, want empty list", got)
	}
}
