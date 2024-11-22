import getProductFromCache from '../getProductFromCache.js';
import Order from '../models/order.js';
import Product from '../models/product.js';
import updateProductStock from '../updateProductStock.js';
import Cart from '../models/cart.js'
import getUserCart from '../getUserCart.js';
import client from '../redisClient.js';

export const createOrder= async(req,res)=>{
  const userId = (req.user._id).toString();
  const userCart = await getUserCart(userId);

    const cartItems = userCart.products; // Assume cartItems contains { productId, quantity }
    console.log(cartItems)

    if( cartItems.length === 0){
      res.status(400).send('cart is empty')
    } else {

  // Calculate total amount and check stock
    let totalAmount = 0;
    const orderItems = [];


    //iterate through each product
    for (let { productId, quantity } of cartItems) {
    const product = await getProductFromCache(productId);
    if (!product || product.stock < quantity) {
      console.log('error')
     res.status(400).send(`Insufficient stock for product: ${product.name}`);
    }

    // Lock product: update stock using OCC
    const updatedProduct = await updateProductStock(productId, quantity, product.__v);
    if (!updatedProduct) {
      return res.status(400).send(`Stock updated for product: ${product.name}. Please retry.`);
    }
    
    totalAmount += product.price * quantity;
    orderItems.push({ productId, quantity });
  }

  // Create order
  const order = new Order({ userId, products: orderItems, totalAmount });
  await order.save();

  //update cart in DB and Redis after creating order by clearing the cart
  if(order){
    const updatedCart= await Cart.findOneAndUpdate({userId}, {$set: {"products":[]}}, {new:true});
    console.log(updatedCart)
    client.setEx(`user:${userId}`, 3600, JSON.stringify(updatedCart)); // Cache for 1 hour

    res.json({ message: 'Order placed successfully', orderId: order._id, amount:totalAmount });
  }

    }  
}