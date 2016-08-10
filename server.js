let app = require('express')();
let xmlparser = require('express-xml-bodyparser')({explicitArray: false});
let mysql = require('mysql');

let tableName = 'contact';

function transform(sobject) {
  return {
    'id': sobject['sf:id'],
    'name': sobject['sf:firstname'] + ' ' + sobject['sf:lastname'],
    'email': sobject['sf:email']
  };
}

let pool = mysql.createPool(process.env.CLEARDB_DATABASE_URL || 'mysql://root@localhost/demo');

// create the table if it doesn't exist
pool.query(`SELECT * FROM ${tableName}`, function(err) {
  if ((err != null) && (err.code == 'ER_NO_SUCH_TABLE')) {
    pool.query('create table contact (id VARCHAR(18) PRIMARY KEY, name VARCHAR(128), email VARCHAR(128))');
  }
});

function ack() {
  return `<?xml version="1.0" encoding="UTF-8"?>
    <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
      <soap:Body>
        <notificationsResponse xmlns:ns2="urn:sobject.enterprise.soap.sforce.com" xmlns="http://soap.sforce.com/2005/09/outbound">
          <Ack>true</Ack>
        </notificationsResponse>
      </soap:Body>
    </soap:Envelope>`;
}

function nack(errorMessage) {
  return `<?xml version="1.0" encoding="UTF-8"?>
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
      <soapenv:Body>
        <soapenv:Fault>
          <faultcode>soap:Receiver</faultcode>
          <faultstring>${errorMessage}</faultstring>
        </soapenv:Fault>
      </soapenv:Body>
    </soapenv:Envelope>`;
}

app.use(xmlparser);

app.post('/', function(req, res) {

  try {
    let sobject = req.body['soapenv:envelope']['soapenv:body']['notifications']['notification']['sobject'];
    let data = transform(sobject);

    pool.query(`INSERT INTO ${tableName} SET ? ON DUPLICATE KEY UPDATE ?`, [data, data], function(err) {
      if (err != null) {
        console.error('Database error', err.message);
        res.status(500).send(nack(err.message));
      }
      else {
        res.status(200).send(ack());
      }
    });
  }
  catch (err) {
    console.error('Uncaught error', err);
    res.status(500).send(nack(err.message));
  }
});

app.listen(process.env.PORT || 5000);
