const NotesService = {
  getAllNotes(db) {
    return db.select('*').from('noteful_notes');
  },
  createNewNote(db, newNote) {
    return db
      .insert(newNote)
      .into('noteful_notes')
      .returning('*')
      .then((note) => {
        return note[0];
      });
  },
  getNoteById(db, id) {
    return db.select('*').from('noteful_notes').where({ id }).first();
  },
  deleteNote(db, id) {
    return db('noteful_notes').where({ id }).delete();
  },
  updateNote(db, id, newNoteFields) {
    return db('noteful_notes').where({ id }).update(newNoteFields);
  },
};

module.exports = NotesService;
