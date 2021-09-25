package utils

import (
	"io/ioutil"
	"os"
	"path"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
)

func TestCreateDirNew(t *testing.T) {
	dirToMake := path.Join(os.TempDir(), uuid.NewString())
	defer os.RemoveAll(dirToMake)
	assert.NoDirExists(t, dirToMake)
	err := CreateDir(dirToMake)
	if err != nil {
		t.Fatal(err)
	}
	assert.DirExists(t, dirToMake)
}

func TestCreateDirExisting(t *testing.T) {
	dir, err := ioutil.TempDir("", "testing-dir")
	defer os.RemoveAll(dir)
	if err != nil {
		t.Fatal(err)
	}
	assert.DirExists(t, dir)
	err = CreateDir(dir)
	if err != nil {
		t.Fatal(err)
	}
	assert.DirExists(t, dir)
}
