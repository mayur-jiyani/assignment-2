const express = require("express")
const router = new express.Router()
var mysql = require('mysql2');
const multer = require('multer');
const logger = require('../logger');
const fs = require('fs')
const moment = require('moment-timezone');

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

// const storage = multer.memoryStorage()
// var upload = multer({
//     dest: 'public/img',
//     limits: {
//         fileSize: 1000000
//     },
//     fileFilter(req, file, cb) {
//         if (!file.originalname.match(/\.(jpg|png|jpeg)$/)) {

//             logger.error('Upload an image')

//             return cb(new Error('Upload an image'))
//         }

//         cb(undefined, true)
//     },
//     storage
// })

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/');
    },
    filename: function (req, file, cb) {
        // let extension = file.originalname.split(".").pop()
        cb(null, file.originalname);
    }
});

const upload = multer({
    storage: storage,
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(png|jpeg|jpg)$/)) {

            logger.error('Please upload an Image.')

            return cb(new Error('Please upload an Image.'))
        }
        // console.log(req, file)
        cb(undefined, true)
    }
})

//rest API to insert inventory data
router.post('/inventory/create', upload.single('avatar'), (req, res) => {

    // var id = req.body.id;
    var inventory_name = req.body.inventory_name;
    var inventory_category = req.body.inventory_category;
    var expiry_time = req.body.expiry_time;
    var quantity = req.body.quantity;
    var manufacturing_time = req.body.manufacturing_time;
    var inventory_image = 'G:/Mtech/assign/assignment-2/public/' + req.file.filename;


    //converting time into CST
    expiry_time = moment.tz(expiry_time, "America/Chicago").format()
    manufacturing_time = moment.tz(manufacturing_time, "America/Chicago").format()

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


    connection.query('select inventory_name, inventory_category, expiry_time, quantity, inventory_id, inventory_image from inventorydata where `inventory_name`=? or inventory_category', [inventory_name], (error, results, fields) => {
        if (error) {
            logger.error(error)
            throw error;
        }

        const dateInPast = (firstDate, secondDate) => {
            if ((firstDate == '0000-00-00 00:00:00') || (firstDate > secondDate)) {
                return false
            }
            return true
        };


        const newArr = results.map((element) => {

            // convert current date into CST
            current_date = moment.tz(new Date(), "America/Chicago").format()

            //check date is expired or not
            is_expired = dateInPast(element.expiry_time, current_date)

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

        //if requested id not found then
        if (results.affectedRows === 0) {
            logger.error("Id not found")
            return res.status(400).send({ error: 'Id not found' })
        }

        res.end(JSON.stringify(results));
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

        //if requested name not found then
        if (results.affectedRows === 0) {
            logger.error("Name not found")
            return res.status(400).send({ error: 'Name not found' })
        }

        res.end('Record has been deleted!');
    });
});


//rest api to delete image from mysql database
router.patch('/inventory/delete/image/:inventory_id', (req, res) => {

    connection.query('UPDATE `inventorydata` SET `is_deleted`=? where `inventory_id`=?', ['1', req.params.inventory_id], (error, results, fields) => {
        if (error) {
            logger.error(error)
            throw error;
        }

        //if requested id not found then
        if (results.affectedRows === 0) {
            logger.error("Id not found")
            return res.status(400).send({ error: 'Id not found' })
        }


        connection.query('select inventory_image from inventorydata where `inventory_id`=?', [req.params.inventory_id], (error, results, fields) => {
            fs.unlink(results[0].inventory_image, (error) => {

                if (error) {
                    logger.error(error)
                    throw error;
                }


                logger.info('successfully unlink image data')
            })

            res.end('successfully deleted image.');
        });

        // res.end(JSON.stringify(results));
    });

    // connection.query('select inventory_image from inventorydata where inventory_name=?', ['banana'],  (error, results, fields)=> {
    //     if (error) throw error;

    //     res.end(JSON.stringify(results));
    // });
});

module.exports = router
