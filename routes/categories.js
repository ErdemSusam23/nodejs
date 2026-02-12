const express = require('express');
const router = express.Router();
const Categories = require('../db/models/Categories');
const Response = require('../lib/Response');
const Enums = require('../config/Enums');
const CustomError = require('../lib/Error');

router.get('/', async function(req, res, next) {
  try {
    let categories = await Categories.find({});
    res.json(Response.successResponse(categories));
    
    }
    catch (err) {
      let errorResponse = Response.errorResponse(err);
      res.status(err.code || Enums.HTTP_CODES.INTERNAL_SERVER_ERROR).json(errorResponse);
    } 
});

router.post('/add', async function(req, res, next) {
  let body = req.body;
  try {
    if(!body.name) {
      throw new CustomError(Enums.HTTP_CODES.BAD_REQUEST, 'Validation Error', 'The name field is required to create a category');
    }
    let category = new Categories({
        name: body.name,
        is_active: body.is_active,
        created_by: req.user?.id
      }); 
      category = await category.save();
      res.json(Response.successResponse(category));
  }
  catch (err) {
    let errorResponse = Response.errorResponse(err);
    res.status(err.code || Enums.HTTP_CODES.INTERNAL_SERVER_ERROR).json(errorResponse);
  }
});

router.post('/update', async function(req, res, next) {
  let body = req.body;
  try {
    if (!body._id) {
      throw new CustomError(Enums.HTTP_CODES.BAD_REQUEST, 'Validation Error', 'The _id field is required to update a category');
    }
    let updates = {};
    
    if (body.name) updates.name = body.name;
    
    if (typeof body.is_active === 'boolean') updates.is_active = body.is_active;

    await Categories.updateOne({ _id: body._id }, { $set: updates });

    res.json(Response.successResponse({ success: true }));

  } catch (err) {
    let errorResponse = Response.errorResponse(err);
    res.status(err.code || Enums.HTTP_CODES.INTERNAL_SERVER_ERROR).json(errorResponse);
  }
});

router.post('/delete', async function(req, res, next) {
  let body = req.body;
  try {
    if (!body._id) {
      throw new CustomError(Enums.HTTP_CODES.BAD_REQUEST, 'Validation Error', '_id is required to delete');
    }

    await Categories.deleteOne({ _id: body._id });

    res.json(Response.successResponse({ success: true }));
  } catch (err) {
    let errorResponse = Response.errorResponse(err);
    res.status(err.code || Enums.HTTP_CODES.INTERNAL_SERVER_ERROR).json(errorResponse);
  }
});


module.exports = router;