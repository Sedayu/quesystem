'use strict';
const createRouter = require('@arangodb/foxx/router');
const router = createRouter();

module.context.use(router);

const joi = require('joi');

// continued
const db = require('@arangodb').db;
const errors = require('@arangodb').errors;
const foxxColl = db._collection('users');
const checkupColl = db._collection('checkup');
const DOC_NOT_FOUND = errors.ERROR_ARANGO_DOCUMENT_NOT_FOUND.code;


// continued
const aql = require('@arangodb').aql;

router.get('/doctors/:key/:value', function (req, res) {
  const keys = db._query(aql`
  	FOR doctor IN doctors
    FILTER doctor.${req.pathParams.key} == ${req.pathParams.value}
  	SORT doctor.room
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

// status antrian
router.get('/checkup_status/:doctor_id/:date/:status', function(req,res){
  // const keys = db._query(aql`
  //   FOR entry IN ${checkupColl}
  //   FILTER entry.doctor_id == ${req.pathParams.doctor_id} && entry.date == ${req.pathParams.date}
  //   RETURN entry
  // `);
  // res.send(keys);

  if (req.pathParams.status =="all") {
     const keys = db._query(aql`
      FOR entry IN checkup
      FOR u IN users
      FOR d IN doctors
      SORT entry.que_number ASC
      FILTER u._key == entry.user_id && d._key == entry.doctor_id && entry.doctor_id == ${req.pathParams.doctor_id} && entry.date == ${req.pathParams.date} 
      RETURN { checkup: entry, users: u , doctors: d}
    `);
     res.send(keys);
  } else if (req.pathParams.status =="xsudah") {
     const keys = db._query(aql`
      FOR entry IN checkup
      FOR u IN users
      FOR d IN doctors
      SORT entry.que_number ASC
      FILTER u._key == entry.user_id && d._key == entry.doctor_id && entry.doctor_id == ${req.pathParams.doctor_id} && entry.date == ${req.pathParams.date} && entry.status != "sudah"
      RETURN { checkup: entry, users: u , doctors: d}
    `);
     res.send(keys);
  } else {
     const keys = db._query(aql`
      FOR entry IN checkup
      FOR u IN users
      FOR d IN doctors
      SORT entry.que_number ASC
      FILTER u._key == entry.user_id && d._key == entry.doctor_id && entry.doctor_id == ${req.pathParams.doctor_id} && entry.date == ${req.pathParams.date} && entry.status == ${req.pathParams.status}
      RETURN { checkup: entry, users: u , doctors: d}
    `);
     res.send(keys);
  }

 
  
})
.response(joi.array().items(joi.string().required()).required(), 'List of keys')
.summary('Retrieve an entry')
.description('Retrieves an entry from the "users" collection by key.');

// list key user
router.get('/listuser', function(req,res){
  const keys = db._query(aql`
    FOR entry IN ${foxxColl}
    SORT entry.display_name
    RETURN entry
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
  "status": joi.string().required(),
  "_key": joi.string().required()
}


router.post('/user', function(req,res){
  const data = req.body;
  const meta = foxxColl.save(req.body);
  res.send(Object.assign(data, meta));

})
.body(joi.object(docSchema).required(), 'tambahkan user baru')
.response(joi.object().required(), 'user baru')
.summary('data diri')
.description('data pasien');


// post new checkup
const checkupSchema = {
  "doctor_id": joi.string().required(),
  "user_id": joi.string().required(),
  "date": joi.string().required(),
  "status": joi.string().required(),
  "que_number": joi.number().integer().required()
}


router.post('/checkup', function(req,res){
  const data = req.body;
  const meta = checkupColl.save(req.body);
  res.send(Object.assign(data, meta));

})
.body(joi.object(checkupSchema).required(), 'tambahkan checkup baru')
.response(joi.object().required(), 'checkup baru')
.summary('data checkup')
.description('data antrian');


const updatecheckupSchema = {
  "key": joi.string().required(),
  "status": joi.string().required()
}

router.put('/update_status', function(req,res){
  const data = req.body;
  const keys = db._query(aql`
    FOR c IN checkup
      FILTER c._key == ${data.key}
      UPDATE c WITH { status: ${data.status} } IN checkup
      return c
  `);
  res.send(keys);

})
.body(joi.object(updatecheckupSchema).required(), 'edit checkup')
.response(joi.object(updatecheckupSchema).required(), 'checkup edit')
.summary('data checkup edit')
.description('data antrian edit');

const updatedoctorSchema = {
  "key": joi.string().required(),
  "display_name": joi.string().required(),
  "poly": joi.string().required()
}

router.put('/update_doctor', function(req,res){
  const data = req.body;
  const keys = db._query(aql`
    FOR c IN doctor
      FILTER c._key == ${data.key}
      UPDATE c WITH { status: ${data.status} } IN doctor
      return c
  `);
  res.send(keys);

})
.body(joi.object(updatedoctorSchema).required(), 'edit doctor')
.response(joi.object(updatedoctorSchema).required(), 'doctor edit')
.summary('data doctor edit')
.description('data doctor edit');


