'use strict';
const createRouter = require('@arangodb/foxx/router');
const router = createRouter();

module.context.use(router);

router.get('/hello-world', function (req, res) {
  res.send('Halo Halo Bandung!');
})
.response(['text/plain'], 'A generic greeting.')
.summary('Generic greeting')
.description('Prints a generic greeting.');

const joi = require('joi');

router.get('/hello/:name', function (req, res) {
  res.send(`Hello ${req.pathParams.name}`);
})
.pathParam('name', joi.string().required(), 'Name to greet.')
.response(['text/plain'], 'A personalized greeting.')
.summary('Personalized greeting')
.description('Prints a personalized greeting.');

// continued
router.post('/sum', function (req, res) {
  const values = req.body.values;
  res.send({
    result: values.reduce(function (a, b) {
      return a + b;
    }, 0)
  });
})
.body(joi.object({
  values: joi.array().items(joi.number().required()).required()
}).required(), 'Values to add together.')
.response(joi.object({
  result: joi.number().required()
}).required(), 'Sum of the input values.')
.summary('Add up numbers')
.description('Calculates the sum of an array of number values.');


// continued
const db = require('@arangodb').db;
const errors = require('@arangodb').errors;
const foxxColl = db._collection('doctors');
const DOC_NOT_FOUND = errors.ERROR_ARANGO_DOCUMENT_NOT_FOUND.code;

router.post('/doctors', function (req, res) {
  const data = req.body;
  const meta = foxxColl.save(req.body);
  res.send(Object.assign(data, meta));
})
.body(joi.object().required(), 'Entry to store in the collection.')
.response(joi.object().required(), 'Entry stored in the collection.')
.summary('Store an entry')
.description('Stores an entry in the "doctors" collection.');

router.get('/doctors/:key', function (req, res) {
  try {
    const data = foxxColl.document(req.pathParams.key);
    res.send(data)
  } catch (e) {
    if (!e.isArangoError || e.errorNum !== DOC_NOT_FOUND) {
      throw e;
    }
    res.throw(404, 'The entry does not exist', e);
  }
})
.pathParam('key', joi.string().required(), 'Key of the entry.')
.response(joi.object().required(), 'Entry stored in the collection.')
.summary('Retrieve an entry')
.description('Retrieves an entry from the "myFoxxCollection" collection by key.');