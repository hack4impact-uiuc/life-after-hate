const express = require('express')
const mongoose = require('mongoose');
const app = express()
const port = process.env.PORT
app.use(require('./routes'));

mongoose.connect('mongodb://db:27017/LAH_DB', { useUnifiedTopology: true, useNewUrlParser: true });
app.listen(port, () => console.log(`Example app listening on port ${port}!`))
