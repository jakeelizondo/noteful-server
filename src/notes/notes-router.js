const express = require('express');
const xss = require('xss');
const path = require('path');
const NotesService = require('./notes-service');

const notesRouter = express.Router();

const jsonBodyParser = express.json();

const serializeNote = (note) => ({
  id: note.id,
  name: xss(note.note_name),
  content: xss(note.description),
  modified: note.date_modified,
  folderId: note.folder,
});

notesRouter
  .route('/')
  .get((req, res, next) => {
    NotesService.getAllNotes(req.app.get('db'))
      .then((notes) => {
        return res.json(notes.map(serializeNote));
      })
      .catch(next);
  })
  .post(jsonBodyParser, (req, res, next) => {
    const { name, content, folderId, modified } = req.body;
    const newNote = {
      note_name: name,
      folder: Number(folderId),
      description: content,
      date_modified: modified,
    };

    NotesService.createNewNote(req.app.get('db'), newNote).then((note) => {
      return res
        .status(201)
        .location(path.posix.join(req.originalUrl, `/${note.id}`))
        .json(serializeNote(note));
    });
  });

notesRouter
  .route('/:note_id')
  .all((req, res, next) => {
    const id = req.params.note_id;

    NotesService.getNoteById(req.app.get('db'), id)
      .then((note) => {
        if (!note) {
          return res.status(400).json({
            error: {
              message: `Sorry, it looks like note with id ${id} does not exist`,
            },
          });
        }
        res.note = note;
        next();
      })
      .catch(next);
  })
  .get((req, res, next) => {
    return res.json(serializeNote(res.note));
  })
  .delete((req, res, next) => {
    NotesService.deleteNote(req.app.get('db'), req.params.note_id)
      .then((numRowsAffected) => {
        return res.status(204).end();
      })
      .catch(next);
  })
  .patch(jsonBodyParser, (req, res, next) => {
    const { name, content, modified } = req.body;
    const newNoteFields = {
      note_name: name,
      description: content,
      date_modified: modified,
    };

    //validation

    const numOfValues = Object.values(newNoteFields).filter(Boolean).length;
    if (numOfValues === 0) {
      return res
        .status(400)
        .json({
          error: {
            message:
              'Your response must include one of the following fields: name, content',
          },
        });
    }

    NotesService.updateNote(
      req.app.get('db'),
      req.params.note_id,
      newNoteFields
    )
      .then((numRowsAffected) => {
        return res.status(204).end();
      })
      .catch(next);
  });

module.exports = notesRouter;
