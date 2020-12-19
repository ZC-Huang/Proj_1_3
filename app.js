const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const redis = require('redis');


// Create Redis Client
let client = redis.createClient();

client.on('connect', function(){
  console.log('Redis Server Connected!');
});

// Set Port to 3000
const port = 3000;

// Init app
const app = express();

// Set view engine
app.engine('handlebars', exphbs({defaultLayout:'main'}));
app.set('view engine', 'handlebars');

// Use body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

// methodOverride
app.use(methodOverride('_method'));

// Page for searching for a tenant
app.get('/', function(req, res, next){
  res.render('searchtenant');
});

// How searching works
app.post('/tenant/search', function(req, res, next){
  let id = req.body.id;

  client.hgetall(id, function(err, obj){
    if(!obj){
      res.render('searchtenant', {
        error: 'Tenant does not exist'
      });
    } else {
      obj.id = id;
      res.render('update', {
        tenant: obj
      });
    }
  });
});

// Page for adding a tenant
app.get('/tenant/add', function(req, res, next){
  res.render('addtenant');
});

// How adding works
app.post('/tenant/add', function(req, res, next){
  let id = req.body.id;
  let unit_number = req.body.unit_number;
  let first_name = req.body.first_name;
  let last_name = req.body.last_name;
  let email = req.body.email;
  let phone = req.body.phone;

  client.hmset(id, [
    'unit_number', unit_number,
    'first_name', first_name,
    'last_name', last_name,
    'email', email,
    'phone', phone
  ], function(err, reply){
    if(err){
      console.log(err);
    }
    console.log(reply);
    res.redirect('/');
  });
});

// Function to delete a tenant
app.delete('/tenant/delete/:id', function(req, res, next){
  client.del(req.params.id);
  res.redirect('/');
});

app.listen(port, function(){
  console.log('Server started on port '+port);
});
