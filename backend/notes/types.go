package notes

import "time"

type Note struct {
	ID        int64     `json:"id"`
	Author    string    `json:"author"`
	Text      string    `json:"text"`
	Emoji     string    `json:"emoji"`
	CreatedAt time.Time `json:"created_at"`
}

type CreateNoteReq struct {
	Author string `json:"author"`
	Text   string `json:"text"`
	Emoji  string `json:"emoji"`
}
