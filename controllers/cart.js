import Cart from "../models/cart.js";
import Product from "../models/product.js";
import getProductFromCache from "../getProductFromCache.js";
import updateProductStock from "../updateProductStock.js";
import client from "../redisClient.js";
import getUserCart from "../getUserCart.js";


export const getCart= async(req,res)=>{
    try{
    const userId= (req.user._id).toString();
    console.log(userId)
    const cart= await getUserCart(userId);

    res.send(cart);
    }catch(error){
        res.status(500).send('an error occurred')
    };

}

export const addToCart= async(req,res)=>{
    const { productId, quantity } = req.body;
  const userId = req.user._id;

  try {
    // Retrieve product details from cache or DB
    const product = await getProductFromCache(productId);
    
    if (product.stock < quantity) {
      return res.status(400).send('Insufficient stock');
    }

    // Optimistic Concurrency Control: Check version before updating
    const updatedProduct = await updateProductStock(productId, quantity, product.__v);
    if (!updatedProduct) {
      return res.status(400).send('Stock was updated by another user, please try again');
    }

    // Product successfully added to cart (this part can be expanded)
	const updatedCart= await Cart.findOneAndUpdate({userId}, {$addToSet: {"products":{"productId":productId, "quantity":quantity}}}, {new:true});

	//update cart to redis
	
    if (updatedCart) {
        client.setEx(`user:${userId}`, 3600, JSON.stringify(updatedCart)); // Cache for 1 hour
        return res.send(updatedCart);
      } else {
        reject('an error occurred');
    }

    res.send('Item added to cart', updatedCart);
  } catch (error) {
    res.status(500).send('Error adding item to cart');
  }

}



export const deleteFromCart= async(req,res)=>{
    const { productId, quantity } = req.body;
  const userId = req.user._id;

  try {
    // Retrieve product details from cache or DB
    const product = await getProductFromCache(productId);
    
    // Product successfully added to cart (this part can be expanded)
	const updatedCart= await Cart.findOneAndUpdate({userId}, {$pull: {"products":{"productId":productId}}}, {new:true});

	//update cart to redis cache

    if (updatedCart) {
        client.setEx(`user:${userId}`, 3600, JSON.stringify(updatedCart)); // Cache for 1 hour
        return res.send(userId, updatedCart);
      } else {
        reject('an error occurred');
    }
	
    res.send('Item removed from cart', updatedCart);
  } catch (error) {
    res.status(500).send('Error occurred');
  }

}

