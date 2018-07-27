'use strict';
const createRouter = require('@arangodb/foxx/router');
const router = createRouter();

module.context.use(router);


// continued
const db = require('@arangodb').db;
const errors = require('@arangodb').errors;
const foxxColl = db._collection('quesystem_doctors');
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

