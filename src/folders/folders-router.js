const express = require('express');
const xss = require('xss');
const FoldersService = require('./folders-service');
const path = require('path');

const folderRouter = express.Router();
const jsonBodyParser = express.json();

const serializeFolder = (folder) => ({
  id: folder.id,
  name: xss(folder.folder_name),
  date_created: folder.date_created,
});

folderRouter
  .route('/')
  .get((req, res, next) => {
    FoldersService.getAllFolders(req.app.get('db'))
      .then((folders) => {
        return res.json(folders.map(serializeFolder));
      })
      .catch(next);
  })
  .post(jsonBodyParser, (req, res, next) => {
    const { folder_name } = req.body;
    const newFolder = { folder_name };

    //validate value of folder_name

    for (const [key, value] of Object.entries(newFolder)) {
      if (value == null) {
        return res.status(400).json({
          error: { message: 'Must include folder name in request body' },
        });
      }
    }

    //create folder in db

    FoldersService.createFolder(req.app.get('db'), newFolder)
      .then((folder) => {
        return res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${folder.id}`))
          .json(serializeFolder(folder));
      })
      .catch(next);
  });

folderRouter
  .route('/:folder_id')
  .all((req, res, next) => {
    const folderId = req.params.folder_id;
    FoldersService.getFolderById(req.app.get('db'), folderId)
      .then((folder) => {
        if (!folder) {
          return res.status(400).json({
            error: {
              message: `sorry, folder with id ${folderId} does not appear to exist`,
            },
          });
        }
        res.folder = folder;
        next();
      })
      .catch(next);
  })
  .get((req, res, next) => {
    return res.json(serializeFolder(res.folder));
  })
  .delete((req, res, next) => {
    const id = req.params.folder_id;
    FoldersService.deleteFolder(req.app.get('db'), id)
      .then((numRowsAffected) => {
        return res.status(204).end();
      })
      .catch(next);
  })
  .patch(jsonBodyParser, (req, res, next) => {
    const { folder_name } = req.body;
    const newFolderField = {
      folder_name,
    };

    //validate

    const numOfValues = Object.values(newFolderField).filter(Boolean).length;
    if (numOfValues === 0) {
      return res.status(400).json({
        error: { message: 'You must provide the folder name to update' },
      });
    }

    FoldersService.updateFolder(
      req.app.get('db'),
      req.params.folder_id,
      newFolderField
    )
      .then((numRowsAffected) => {
        return res.status(204).end();
      })
      .catch(next);
  });

module.exports = folderRouter;
