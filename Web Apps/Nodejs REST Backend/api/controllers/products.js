const mongoose = require('mongoose');

const Order = require('../models/order');
const Product = require('../models/product');

const domain = process.env.DOMAIN;

exports.products_get_all = (req, res, next) => {
    Product.find()
        .select('name price productImage _id')
        .exec()
        .then(docs => {
            res.status(200).json({
                count: docs.length,
                products: docs.map(doc => {
                    return {
                        name: doc.name,
                        price: doc.price,
                        productImage: doc.productImage,
                        _id: doc._id,
                        request: {
                            type: 'GET',
                            description: 'Get info on this product',
                            url: 'http://'+domain+':3000/products/' + doc._id
                        }
                    }
                })
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
}

exports.products_create_product = (req, res, next) => {
    // console.log(req.file); - used for debuging file upload process
    // Product is the object constructor for implementing new Product model data objects
    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price,
        productImage: req.file.path
    });
    product.save().then(result => {
        console.log(result);
        res.status(201).json({
            message: "Created product successfully",
            createdProduct: {
                name: result.name,
                price: result.price,
                productImage: result.productImage,
                _id: result._id,
                request: {
                    type: 'GET',
                    description: 'Get info on this product',
                    url: 'http://'+domain+':3000/products/' + result._id
                }
            }
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({ error: err });
    });
}

exports.products_get_product = (req, res, next) => {
    const id = req.params.productId;
    Product.findById(id)
    .select('name price productImage _id')
    .exec()
    .then(doc => {
      console.log(doc);
      if (doc) {
          res.status(200).json({
              product: doc,
              request: {
                  type: 'GET',
                  description: 'Get all products',
                  url: 'http://'+domain+':3000/products/'
              }
          });
      } else {
        res
          .status(404)
          .json({ message: "No entry found for the provided ID" });
      }
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({ error: err });
    });
}

exports.products_update_product = (req, res, next) => {
    const id = req.params.productId;
    const updateOps = {};
    for (const ops of req.body) {
        updateOps[ops.propName] = ops.value;
    }
    Product.update({ _id: id }, { $set: updateOps })
        .exec()
        .then(result => {
            res.status(200).json({
            message: 'Updated product ' + id,
            request: {
                type: 'GET',
                description: 'Get info on this product',
                url: 'http://'+domain+':3000/products/' + id
            }
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({ error: err });
    });
}

exports.product_delete_product = (req, res, next) => {
    const id = req.params.productId;
    Product.remove({_id: id}).exec().then(result => {
        res.status(200).json({
            message: 'Deleted product ' + id
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        });
    });
}