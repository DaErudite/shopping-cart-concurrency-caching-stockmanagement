import Product from "./models/product.js";

// Concurrency Handling: Update product stock with Optimistic Concurrency Control (OCC)
async function updateProductStock(productId, quantity, version) {
    const product = await Product.findOneAndUpdate(
      { _id: productId, __v: version }, // Ensure version matches for OCC
      { $inc: { stock: -quantity }, $set: { updatedAt: new Date() } }, // Decrease stock
      { new: true }
    );
    return product;
  }

export default updateProductStock