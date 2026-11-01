const express = require('express');
const routerTags = express.Router();
const tagsController = require('../controllers/tags_api_controller.js');

routerTags.post('/', tagsController.createTag);
routerTags.get('/', tagsController.getTags);

routerTags.use('/:id', tagsController.authTagsMiddleware);

routerTags.get('/:id', tagsController.getTag);
routerTags.patch('/:id', tagsController.updateTag);
routerTags.delete('/:id', tagsController.deleteTag);

module.exports = routerTags;