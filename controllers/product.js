import Product from '../models/product.js';
import getProductFromCache from '../getProductFromCache.js';

export const addProduct= async(req,res)=>{
    try{
        const{ name,price,stock }= req.body;
        const product = await Product.create({
            name,
            price,
            stock
        });
        res.status(201).json([product,'product created'])
    }catch(error){
        console.error("unable to add product",error)
    }
}

export const getAllProducts = async(req,res)=>{
    try{
    const products = await Product.find();
    res.status(200).json(products);
}catch(error){
    console.error('error fetching products')
    res.status(500).send('error fetching products')
}
}

export const getProduct = async(req,res)=>{
    try{
    const productId = req.params.id
    //console.log(productId)
    const product = await getProductFromCache(productId)
    res.status(200).json(product)
}catch(error){
    res.status(500).send('error fetching products')
    }
}


