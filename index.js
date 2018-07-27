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
const foxxColl = db._collection('users');
const DOC_NOT_FOUND = errors.ERROR_ARANGO_DOCUMENT_NOT_FOUND.code;


// continued
const aql = require('@arangodb').aql;

router.get('/doctors/:key/:value', function (req, res) {
  const keys = db._query(aql`
  	FOR doctor IN doctors
    FILTER doctor.${req.pathParams.key} == ${req.pathParams.value}
  	SORT doctor.display_name
  	RETURN doctor
  `);
  res.send(keys);
})
.response(joi.array().items(
  joi.string().required()
).required(), 'List of entry keys.')
.summary('List entry keys')
.description('Assembles a list of keys of entries in the collection.');


router.get('/checkup/:doctor_id/:date', function (req, res) {
  const keys = db._query(aql`
    FOR c IN checkup
    FILTER c.doctor_id == ${req.pathParams.doctor_id} && c.date == ${req.pathParams.date}
    COLLECT AGGREGATE  maxQue = MAX(c.que_number)
    RETURN {
       maxQue
    }
  `);
  res.send(keys);
})
.response(joi.array().items(
  joi.string().required()
).required(), 'List of entry keys.')
.summary('List entry keys')
.description('Assembles a list of keys of entries in the collection.');

// list key user
router.get('/listuser', function(req,res){
  const keys = db._query(aql`
    FOR entry IN ${foxxColl}
    RETURN entry._key
  `);
  res.send(keys);
})
.response(joi.array().items(joi.string().required()).required(), 'List of keys')
.summary('Retrieve an entry')
.description('Retrieves an entry from the "users" collection by key.');

// list user based on key
router.get('/user/:key', function(req,res){
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
.description('Retrieves an entry from the "users" collection by key.');


// post new user
const docSchema = {
  "display_name": joi.string().required(),
  "status": joi.string().required()
}


router.post('/user', function(req,res){
  const data = req.body;
  const meta = foxColl.save(req.body);
  res send(Object.assign(data, meta));

})
.body(joi.object(docSchema).required(), 'tambahkan user baru')
.response(joi.object().required(), 'user baru')
.summary('data diri')
.description('data pasien');