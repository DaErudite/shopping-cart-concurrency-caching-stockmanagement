import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import redis from 'redis';
//import { rateLimit } from 'express-rate-limit';
import cookieParser from 'cookie-parser';
//import session from 'express-session';
import passport from 'passport';
import cors from 'cors';
import dotenv from 'dotenv';
//import helmet from 'helmet';
//import fs from 'fs';
import path from 'path';
//import morgan from 'morgan';
//import { fileURLToPath } from 'url';
//import swaggerUi from 'swagger-ui-express';
//import YAML from 'yaml';

// routes 
import productRoutes from './routes/product.js';
import userRoutes from './routes/user.js'
import orderRoutes from './routes/order.js'




// setups
//const __filename = fileURLToPath(import.meta.url);
//const __dirname = path.dirname(__filename);
//const file = fs.readFileSync(path.resolve(__dirname, './swagger.yaml'), 'utf8');
//const swaggerDocument = YAML.parse(file);
/* CONFIGURATION */
dotenv.config();
const app = express();

const PORT = process.env.PORT || 9000;

// Apply the rate limiting middleware to all requests

app.use(express.json());

app.use(bodyParser.json());
app.use(express.static('public')); // configure static file to save images locally
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors('*'));


/* ROUTES */
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/users', userRoutes)




// error


/* MONGOOSE SETUP */
mongoose
	.connect(process.env.MONGO_URL, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	.then(() => {
		app.listen(PORT, () => console.log(`Server Port: ${PORT}`));
	})
	.catch((error) => console.log(`${error} did not connect`));
