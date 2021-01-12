const FoldersService = {
  getAllFolders(db) {
    return db.select('*').from('noteful_folders');
  },
  getFolderById(db, id) {
    return db.select('*').from('noteful_folders').where('id', id).first();
  },
  createFolder(db, newFolder) {
    return db
      .into('noteful_folders')
      .insert(newFolder)
      .returning('*')
      .then((rows) => {
        return rows[0];
      });
  },
  deleteFolder(db, id) {
    return db('noteful_folders').where({ id }).delete();
  },
  updateFolder(db, id, newFolderFields) {
    return db('noteful_folders').where({ id }).update(newFolderFields);
  },
};

module.exports = FoldersService;
