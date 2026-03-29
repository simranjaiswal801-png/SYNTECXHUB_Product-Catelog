const Product = require("../models/Product");

// CREATE
exports.createProduct = async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json(product);
};

// GET ALL + SEARCH + PAGINATION
exports.getProducts = async (req, res) => {
  const { keyword, category, page = 1, limit = 5 } = req.query;

  let query = {};

  if (keyword) {
    query.name = { $regex: keyword, $options: "i" };
  }

  if (category) {
    query.category = category;
  }

  const products = await Product.find(query)
    .limit(limit * 1)
    .skip((page - 1) * limit);

  res.json(products);
};

// UPDATE
exports.updateProduct = async (req, res) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.json(product);
};

// DELETE
exports.deleteProduct = async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: "Product deleted" });
};