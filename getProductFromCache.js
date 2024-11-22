import Product from "./models/product.js";
//import client from "./redisClient.js";
//import redis from 'redis';

import client from './redisClient.js'

// Caching: Retrieve product from Redis
async function getProductFromCache(productId) {
	return new Promise((resolve, reject) => {
		//console.log(productId)
	  client.get(`product:${productId}`, async ( err, cachedProduct) => {
		//const productId = req.params.id
		if (err) reject(err);
		if (cachedProduct) {
		  return resolve(JSON.parse(cachedProduct)); // Return cached data if available
		} else{
		
		// If not cached, fetch from MongoDB and cache it
		const product = await Product.findById(productId);
		if (product) {
		  client.setEx(`product:${productId}`, 3600, JSON.stringify(product)); // Cache for 1 hour
		  resolve(product);
		} else {
		  reject('Product not found');
		}
		}
	  });
	});
}

export default getProductFromCache;

