const express = require('express');
const mainRouter = require('./router/mainRouter');
const customErrorHandler = require('./middlewares/errors/customErrorHandler');
const connectDatabase = require('./helpers/database/connectDatabase');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

dotenv.config({ path: './config/env/config.env' });

connectDatabase();

const PORT = process.env.PORT;
const app = express();
app.use(cors());

app.use(express.json());
app.use(mainRouter);
app.use(customErrorHandler);

var options = {
  dotfiles: 'ignore',
  etag: false,
  extensions: ['jpeg', 'png', 'gif', 'jpg'],
  index: false,
  maxAge: '1d',
  redirect: false,
  setHeaders: function (res, path, stat) {
    res.set('x-timestamp', Date.now());
  },
};

app.use('/public', express.static(path.join(__dirname, 'public'), options));

app.listen(PORT, () => {
  console.log(`App listening at http://localhost:${PORT}`);
});
