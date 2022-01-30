var express = require('express');
var app = express();
const inventoryRouter = require("./routers/inventory")


// app.use(bodyParser.json());       // to support JSON-encoded bodies
// app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
//     extended: true
// }));
app.use(express.json())
app.use(inventoryRouter)


module.exports = app