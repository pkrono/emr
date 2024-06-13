const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const drugRoutes = require('./routes/drugs');

dotenv.config();

const app = express();

app.use(express.json()); // parsing JSON objects
app.use(bodyParser.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/drugs', drugRoutes);

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Listening on port ${port}...`));
