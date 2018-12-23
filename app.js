require('dotenv').config();
var path = require('path');
var express = require("express");
var bodyParser = require("body-parser");
var sql = require("mssql");
var app = express();
var exphbs = require('express-handlebars');
var express_handlebars_sections = require('express-handlebars-sections');
var bodyParser = require('body-parser');
app.engine('hbs', exphbs({
    defaultLayout: 'public',
    layoutsDir: 'Views/Layout/',
    partialsDir: 'Views/partials/',
    helpers: {
        section: express_handlebars_sections(),
        compareStatus: function (v1, v2, option) {
            if (v1 === v2) {
                return option.fn(this);
            }
            return option.inverse(this);
        },
    }
}));

app.set('view engine', 'hbs');
app.set("views", path.join(__dirname, 'Views'));
app.use(express.static(path.join(__dirname, '/public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

var dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: "localhost",
    database: process.env.DB_DATABASE,
    options: {
        trustedConnection: true,
        useUTC: true
    }
};

// here we connect to database and execute query
var executeQuery = function(res, query) {
    sql.connect(dbConfig, function(err) {
        if (err) {
            console.log("Error while connecting database :- " + err);
            //res.send(err);
        } else {
            // create requests object
            var request = new sql.Request();
            // query to the database
            request.query(query, function(err, recordset) {
                if (err) {
                    console.log("Error while query database :- " + err);
                    res.send(err);
                } else {
                    res.send(recordset);
                    sql.close();
                }
            });
        }
    });
}

app.get("/:IDKhachHang", function(req, res) {
    var idkh = req.params.IDKhachHang;

    var query = 'select TenKhachHang, SoDienThoai, Email from KhachHang where KhachHang.MaKhachHang = \'' +
                    idkh + '\'';
    executeQuery(res, query);
});

console.log('Starting app with config:', process.env);
app.listen(process.env.PORT, () => {
    console.log('Site running on port ' + process.env.PORT);
});