const app = require('./app');
const logger = require('./logger');
const port = process.env.PORT || 3000

app.listen(port, () => {
    logger.info("server is up on port" + port)
})
