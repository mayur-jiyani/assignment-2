const express = require("express")
const router = new express.Router()
var mysql = require('mysql2');
const multer = require('multer');
const logger = require('../logger');


var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'inventorydb'
});


connection.connect((err) => {
    if (err) {
        logger.error(err)
        throw err;
    }
    logger.info('You are now connected...')
})

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

//rest API to insert inventory data
router.post('/inventory/create', upload.single('avatar'), (req, res) => {

    // var id = req.body.id;
    var inventory_name = req.body.inventory_name;
    var inventory_category = req.body.inventory_category;
    var expiry_time = req.body.expiry_time;
    var quantity = req.body.quantity;
    var manufacturing_time = req.body.manufacturing_time;
    var inventory_image = upload;

    //converting time into CST
    expiry_time = expiry_time.toLocaleString('en-US', { timeZone: 'CST' })
    manufacturing_time = manufacturing_time.toLocaleString('en-US', { timeZone: 'CST' })

    var sql = `INSERT INTO inventorydata (inventory_name, inventory_category, expiry_time,quantity,manufacturing_time,inventory_image) 
    VALUES ("${inventory_name}", "${inventory_category}","${expiry_time}","${quantity}","${manufacturing_time}","${inventory_image}")`

    connection.query(sql, (error, results, fields) => {
        if (error) {
            logger.error(error)
            throw error;
        }
        res.send("successfully added");
    });
});

//rest API to search inventory data
router.get('/inventory/search', (req, res) => {

    var inventory_name = req.body.inventory_name;


    connection.query('select inventory_name, inventory_category, expiry_time, quantity, inventory_id, inventory_image from inventorydata where inventory_name=?', [inventory_name], (error, results, fields) => {
        if (error) {
            logger.error(error)
            throw error;
        }

        const dateInPast = (firstDate, secondDate) => {
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

        const jsonArr = JSON.stringify(newArr)
        res.end(jsonArr);
    });
});


//rest API to update the quantity of inventory
router.patch('/inventory/update/:inventory_id', (req, res) => {

    const updates = Object.keys(req.body)
    const allowedUpdates = ['quantity']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        logger.error('Invalid updates!')
        return res.status(400).send({ error: 'Invalid updates!' })
    }


    connection.query('UPDATE `inventorydata` SET `quantity`=? where `inventory_id`=?', [req.body.quantity, req.params.inventory_id], (error, results, fields) => {
        if (error) {
            logger.error(error)
            throw error;
        }
        res.end(JSON.stringify(results));
    });
});


//rest api to delete record from mysql database by id
router.delete('/inventory/delete/:inventory_id', (req, res) => {
    // console.log(req.body);
    connection.query('DELETE FROM `inventorydata` WHERE `inventory_id`=?', [req.params.inventory_id], (error, results, fields) => {
        if (error) {
            logger.error(error)
            throw error;
        }
        res.end('Record has been deleted!');
    });
});


//rest api to delete record from mysql database by inventory name
router.delete('/inventory/delete/name', (req, res) => {

    var inventory_name = req.body.inventory_name;
    connection.query('DELETE FROM `inventorydata` WHERE `inventory_name`=?', [inventory_name], (error, results, fields) => {
        if (error) {
            logger.error(error)
            throw error;
        }
        res.end('Record has been deleted!');
    });
});


//rest api to delete image from mysql database
router.patch('/inventory/delete/image/:inventory_id', (req, res) => {

    connection.query('UPDATE `inventorydata` SET `inventory_image`=? where `inventory_id`=?', [' ', req.params.inventory_id], (error, results, fields) => {
        if (error) {
            logger.error(error)
            throw error;
        }

        res.end(JSON.stringify(results));
    });

    // connection.query('select inventory_image from inventorydata where inventory_name=?', ['banana'],  (error, results, fields)=> {
    //     if (error) throw error;

    //     res.end(JSON.stringify(results));
    // });
});

module.exports = router
