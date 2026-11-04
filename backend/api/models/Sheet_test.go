package models

import (
	"testing"

	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/sqlite"
	"github.com/lib/pq"
)

func TestListFiltersAndPaginatesByInstrument(t *testing.T) {
	db, err := gorm.Open("sqlite3", ":memory:")
	if err != nil {
		t.Fatal(err)
	}
	defer db.Close()

	if err := db.AutoMigrate(&Sheet{}).Error; err != nil {
		t.Fatal(err)
	}

	sheets := []Sheet{
		{SafeSheetName: "piano-1", Instruments: pq.StringArray{"Piano"}},
		{SafeSheetName: "piano-2", Instruments: pq.StringArray{"Piano", "Violin"}},
		{SafeSheetName: "violin-1", Instruments: pq.StringArray{"Violin"}},
	}
	for _, sheet := range sheets {
		if err := db.Create(&sheet).Error; err != nil {
			t.Fatal(err)
		}
	}

	pagination := Pagination{Page: 2, Limit: 1, Sort: "safe_sheet_name asc"}
	result, err := (&Sheet{}).List(db, pagination, "", "piano")
	if err != nil {
		t.Fatal(err)
	}
	if result.TotalRows != 2 || result.TotalPages != 2 {
		t.Fatalf("got %d rows across %d pages, want 2 rows across 2 pages", result.TotalRows, result.TotalPages)
	}

	rows, ok := result.Rows.([]*Sheet)
	if !ok {
		t.Fatalf("rows have unexpected type %T", result.Rows)
	}
	if len(rows) != 1 || rows[0].SafeSheetName != "piano-2" {
		t.Fatalf("unexpected page rows: %#v", rows)
	}
}

func TestGetAllInstrumentsReturnsUniqueSortedValues(t *testing.T) {
	db, err := gorm.Open("sqlite3", ":memory:")
	if err != nil {
		t.Fatal(err)
	}
	defer db.Close()

	if err := db.AutoMigrate(&Sheet{}).Error; err != nil {
		t.Fatal(err)
	}
	sheets := []Sheet{
		{SafeSheetName: "sheet-1", Instruments: pq.StringArray{"Piano", "Violin"}},
		{SafeSheetName: "sheet-2", Instruments: pq.StringArray{"piano", "Cello"}},
	}
	for _, sheet := range sheets {
		if err := db.Create(&sheet).Error; err != nil {
			t.Fatal(err)
		}
	}

	instruments, err := GetAllInstruments(db)
	if err != nil {
		t.Fatal(err)
	}
	want := []string{"Cello", "Piano", "Violin"}
	if len(instruments) != len(want) {
		t.Fatalf("got instruments %#v, want %#v", instruments, want)
	}
	for index := range want {
		if instruments[index] != want[index] {
			t.Fatalf("got instruments %#v, want %#v", instruments, want)
		}
	}
}
