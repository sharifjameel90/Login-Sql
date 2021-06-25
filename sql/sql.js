const mysql = require("mysql");
const sql = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "loginsql",
});
sql.connect((err) => {
  if (err) console.log(err);
});
module.exports=sql