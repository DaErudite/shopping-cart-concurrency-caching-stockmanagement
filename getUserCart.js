import Cart from "./models/cart.js";
import Product from "./models/product.js";
//import client from "./redisClient.js";
//import redis from 'redis';

import client from './redisClient.js'

// Caching: Retrieve product from Redis
async function getUserCart(userId) {
	return new Promise((resolve, reject) => {
		//console.log(productId)
	  client.get(`user:${userId}`, async ( err, cachedCart) => {
		//const productId = req.params.id
		if (err) reject(err);
		if (cachedCart) {
		  return resolve(JSON.parse(cachedCart)); // Return cached data if available
		} else{
		
		// If not cached, fetch from MongoDB and cache it
		const cart = await Cart.find({"userId":userId});
		if (cart) {
		  client.setEx(`user:${userId}`, 3600, JSON.stringify(cart)); // Cache for 1 hour
		  resolve(JSON.parse(cart));
		} else {
		  reject('Cart not found');
		}
		}
	  });
	});
}

export default getUserCart;

