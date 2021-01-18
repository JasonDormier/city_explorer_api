'use strict';
/* ----------------- creating the server ----------------- */
const express = require('express');
const cors = require('cors');
require('dotenv').config();

/* ----------------- Setup Application Server ----------------- */

const app = express();
app.use(cors());

/* ----------------- Global Varibles ----------------- */
const PORT = process.env.PORT || 3111;

/* ----------------- Routes ----------------- */







/* ----------------- Start the server ----------------- */

app.listen(PORT, () => console.log(`we are up and running on ${PORT}`));
