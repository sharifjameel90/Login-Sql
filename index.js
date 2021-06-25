const express = require('express');
const app = express();
const bcrypt = require('bcrypt')
const bodyParser = require('body-parser')
const PORT = process.env.PORT || 8000;
const sql = require('./sql/sql');
const session = require('express-session');

app.use(session({
    key: 'userId',
    secret: 'VeryBigSecret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      expires: 60 * 60 * 24,
    }
}))

app.set('view engine', 'ejs')
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.get('/', (req,res) => {
    if(req.session.user) {
        res.render('index', {
            name: req.session.user[0].name
        })
    } else {
        res.redirect('/Login')
    }
})


app.get('/Login', (req, res) => {
    if(!req.session.user) {
        res.render('form_login', {error_msg:""})
    } else {
        res.redirect('/')
    }
})

app.get('/signup', (req, res) => {
    if(!req.session.user) {
        res.render('form_signup',{error_msg: ""})
    } else {
        res.redirect('/')
    }
})

app.post('/signup', (req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    sql.query('SELECT * FROM users WHERE email = ?;',[email], (err, result) => {
      if(err) {
        res.render("form_signup", { error_msg: err})
      }
      if(result.length > 0) {
        res.render("form_signup", { error_msg: "User Exist Try to Login"})
      } else {
        bcrypt.hash(password, 10,(err, data) => {
          if(err) console.error(err)
          sql.query(`INSERT INTO users ( name, email , password ) VALUES ( '${name}' , '${email}', '${data}')`, (err) => {
              if(err) console.log(err)
          })
          sql.query('SELECT * FROM users WHERE email = ?;',[email], (err, result) => {
            if(err) {
              res.render("form_signup", { error_msg: err})
            }
            if(result.length > 0) {
              bcrypt.compare(password,result[0].password, (err,response) => {
                if(response) {
                  req.session.user = result;
                  res.redirect('/')
                } else {
                  res.render("form_signup", { error_msg: "Something Went Wrong Try Creating A New Account"})
                }
              })
            } else {
              res.render("form_signup", { error_msg: "Something Went Wrong Try Creating A New Account"})
            }
          }
        ) 
      }) 
      }
    }
  )
})

app.post('/login', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    sql.query('SELECT * FROM users WHERE email = ?;',[email], (err, result) => {
        if(err) {
          res.render("form_login", { error_msg: err})
        }
        if(result.length > 0) {
          bcrypt.compare(password,result[0].password, (err,response) => {
            if(response) {
              req.session.user = result;
              res.redirect('/')
            } else {
              res.render("form_login", { error_msg: "Credentials Are Invalid"})
            }
          })
        } else {
          res.render("form_login", { error_msg: "User Does Not Exist"})
        }
      }
    )
})


app.get('/LogOut', (req, res) => {
  if(req.session.user) {
    req.session.destroy(err => {
      if(err) console.log(err)
      res.redirect('/Login')
    });
  } else {
    res.redirect('/Login')
  }
})

app.listen(PORT, () => console.log(`listening on ${PORT}`))