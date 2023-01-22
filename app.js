const mysql = require("mysql2");
const express = require("express");
const hbs = require("hbs");
const expressHbs = require("express-handlebars");
const urlencodedParser = express.urlencoded({ extended: false });
const jsonParser = express.json();

const app = express();


const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  database: "django",
  password: "MySql:65108bipE;"
});

connection.connect(function (err) {
  if (err) {
    return console.error("Ошибка: " + err.message);
  }
  else {
    console.log("Подключение к серверу MySQL успешно установлено");
  }
});

app.engine("hbs", expressHbs.engine(
  {
    layoutsDir: "views/layouts",
    defaultLayout: "layout",
    extname: "hbs"
  }
));

app.set("view engine", "hbs");
hbs.registerPartials(__dirname + "/views/partials");

app.post('/registr', jsonParser, function (req, res) {
  if (!req.body) return res.sendStatus(400);
  const name = req.body.email;
  const password = req.body.password;
  connection.query(`SELECT * FROM users WHERE name=?`, [name],
    function (err, data) {
      if (!data.length) {
        connection.query(`INSERT INTO users(name, password) VALUES(?,?)`, [name, password],
          function (err, data) {
            res.send(JSON.stringify('{"message": "пользователь зарегистрирован"}'))
          });
      } else {
        res.send(JSON.stringify('{"message": "пользователь с таким именем уже существует"}'))
      }
    });
});

app.get('/add', function(res,req){
  const name = res.query.name;

  req.render('add.hbs',{ title: 'Добавить',name: name});
});

app.post('/add', jsonParser, function(res, req){
  const name = res.body.name;
  const text = res.body.text;
  const head = res.body.head;
  let date = new Date;
  date = date.toISOString().slice(0,10);

  connection.query('INSERT tasks(author,text,heder,date) VALUES(?,?,?,?)',[name,text,head,date],function(err, data){
    req.json({message: 'ok'});
  })
})

app.post('/list', jsonParser, function (res, req) {
  const name = res.body.name;

  connection.query('SELECT * FROM tasks WHERE author=?', [name], function (err, data) {
    req.json(data);
  })
})

app.get('/rigistr', function (res, req) {
  req.render('registration.hbs', { title: 'Регистрация' });
});

app.post('/change', jsonParser, function(res,req){
  const text = res.body.text;
  const head = res.body.head;
  const name = res.body.name;
  const pastHead = res.body.pastHead;
  let date = new Date;
  date = date.toISOString().slice(0,10);
  connection.query('UPDATE tasks SET heder=?,text=?,date=? WHERE author=? AND heder=?',[
    head,text,date,name,pastHead], function(err,data){
      req.json({message: 'ok'});
    })
})


app.post('/', jsonParser, function (res, req) {
  const email = res.body.email;
  const password = res.body.password;
  connection.query('SELECT * FROM users WHERE name=? AND password=?',
    [email, password], function (err, data) {
      if (err) return console.log(err);
      if (data.length !== 0) {
        req.send(JSON.stringify('{"vision": "hidden", "message": ""}'));
      } else {
        req.send(JSON.stringify('{"vision": "visible", "message": "Неверный пароль или логин"}'));
      }
    });
});

app.get('/cart', function (res, req) {
  let head = res.query.head;
  let name = res.query.name;

  connection.query('SELECT * FROM tasks WHERE author=? AND heder=?', [name, head], function (err, dat) {
    const data = dat[0];
    req.render('cart.hbs', { title: 'Заметка',head: data.heder,text: data.text, date: data.date, name: data.author});
  });
})

app.use('/', function (res, req) {
  const regName = res.query.name;
  if (regName){
    req.render('index.hbs', { title: 'Блокнот', message: '' ,name: regName});
  }
  else{
    req.render('index.hbs', { title: 'Блокнот', message: '' });
  }
});

app.listen(3000, function () {
  console.log("Сервер ожидает подключения...");
});