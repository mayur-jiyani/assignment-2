var express = require('express');
var app = express();
var mysql = require('mysql2');
var bodyParser = require('body-parser');
const multer = require('multer');


var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'inventorydb'
});


connection.connect(function (err) {
    if (err) throw err
    console.log('You are now connected...')
})

app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));

var server = app.listen(3000, "127.0.0.1", function () {

    var host = server.address().address
    var port = server.address().port

    console.log("Example app listening at http://%s:%s", host, port)

});


const storage = multer.memoryStorage()
var upload = multer({
    dest: 'public',
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|png|jpeg)$/)) {
            return cb(new Error('Upload an image'))
        }

        cb(undefined, true)
    },
    storage
})

//rest api to create a new record into mysql database
app.post('/create-inventory', upload.single('avatar'), (req, res) => {

    // var id = req.body.id;
    var inventory_name = req.body.inventory_name;
    var inventory_category = req.body.inventory_category;
    var expiry_time = req.body.expiry_time;
    var quantity = req.body.quantity;
    var manufacturing_time = req.body.manufacturing_time;
    var inventory_image = upload;

    expiry_time = expiry_time.toLocaleString('en-US', { timeZone: 'CST' })
    manufacturing_time = manufacturing_time.toLocaleString('en-US', { timeZone: 'CST' })

    var sql = `INSERT INTO inventorydata (inventory_name, inventory_category, expiry_time,quantity,manufacturing_time,inventory_image) 
    VALUES ("${inventory_name}", "${inventory_category}","${expiry_time}","${quantity}","${manufacturing_time}","${inventory_image}")`

    connection.query(sql, (error, results, fields) => {
        if (error) throw error;
        res.send("successfully added");
    });
});

//rest api to get a single employee data
app.get('/search-inventory', (req, res) => {

    var inventory_name = req.body.inventory_name;


    connection.query('select inventory_name, inventory_category, expiry_time, quantity, inventory_id, inventory_image from inventorydata where inventory_name=?', [inventory_name], function (error, results, fields) {
        if (error) throw error;

        const dateInPast = function (firstDate, secondDate) {
            if (firstDate.setHours(0, 0, 0, 0) <= secondDate.setHours(0, 0, 0, 0)) {
                return true;
            }

            return false;
        };


        const newArr = results.map((element) => {
            is_expired = dateInPast(element.expiry_time, new Date())
            element.is_expired = is_expired
            return element
        });

        res.end(JSON.stringify(newArr));
    });
});