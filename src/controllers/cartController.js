const cartModel = require('../models/cartModel');
const productModel = require('../models/productModel');
const userModel = require('../models/userModel')
const validator = require('../validators/validations');

const createCart = async function (req, res) {
    try {
        const userId = req.params.userId;
        //<---------UserId Validation---------------->
        if (!(validator.isValidObjectId(userId)))
            return res.status(400).send({ status: false, message: "Please provide valid User Id" });


        let data = req.body
        // <-----------reqBody Validations--------------->
        if (!(validator.isValidBody(data)))
            return res.status(404).send({ status: false, message: "plz provide the data" })

        let { productId, quantity } = data;

        // <------ProductId Validation--------->
        if(!productId)
            return res.status(400).send({ status: false, message: "Product ID is required" })

        //<---------Quantity Validation------------>
        if (quantity) {
            if (quantity <= 0)
                return res.status(400).send({ status: false, message: "quantity must be greater than 0" });
        }
        if (!quantity) {
            quantity = 1;
        }


        if (!(validator.isValidObjectId(userId)))
            return res.status(400).send({ status: false, message: "Please provide valid User Id" });

        //   <----------Check user Doc exist in db or not-------------->
        const findUser = await userModel.findById(userId);


        if (!findUser)
            return res.status(400).send({ status: false, message: `User doesn't exist by ${userId}` });


        // <----------Check product Doc is existing in db or not------------->
        const findProduct = await productModel.findOne({ _id: productId, isDeleted: false });

        if (!findProduct)
            return res.status(400).send({ status: false, message: `Product doesn't exist by ${productId}` });


        // <----------Check userId exist in cart Collection or not---------->
        const findUserCart = await cartModel.findOne({ userId });

        //<--------------if No Cart Doc exist in db ------------------->
        if (!findUserCart) {
            var cartData = {
                userId,
                items: [
                    {
                        productId: productId,
                        quantity: quantity,
                    },
                ],
                totalPrice: (findProduct.price * quantity).toFixed(2),
                totalItems: 1,
            };
            const createCart = await cartModel.create(cartData);
            return res.status(201).send({ status: true, message: 'Cart created successfully', data: createCart });
        }

        // <------------If Cart Doc exist in db then we have to update that-------------->

        if (findUserCart) {
            let price = findUserCart.totalPrice + ((quantity) * findProduct.price);

            let arr = findUserCart.items;
            for (let i = 0; i < arr.length; i++) {
                if (arr[i].productId.toString() === productId) {
                    arr[i].quantity += quantity
                    let updatedCart = {
                        items: arr,
                        totalPrice: price,
                        totalItems: arr.length,
                    };

                    let responseData = await cartModel.findOneAndUpdate(
                        { _id: findUserCart._id },
                        updatedCart,
                        { new: true }
                    );
                    return res.status(200).send({ status: true, message: 'Product added successfully', data: responseData });
                }
            }
            arr.push({ productId: productId, quantity: quantity });
            let updatedCart = {
                items: arr,
                totalPrice: price,
                totalItems: arr.length,
            };

            let responseData = await cartModel.findOneAndUpdate({ _id: findUserCart._id }, updatedCart, { new: true });
            return res.status(200).send({ status: true, message: 'Product added successfully', data: responseData });
        }
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}



module.exports = { createCart}
