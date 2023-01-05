const userModel = require('../models/userModel');
const cartModel = require('../models/cartModel');
const orderModel = require('../models/orderModel');
const validator = require('../validators/validations');

const createOrder = async function (req, res) {
    try {
        const userId = req.params.userId;
        const body = req.body;
        let { cartId, cancellable } = body;

        // body Validation
        if (!validator.isValidBody(body)) return res.status(404).send({ status: false, message: "No data found !! 🙄" })

        // params Id Validation
        if (!validator.isValidObjectId(userId))
            return res.status(400).send({ status: false, message: `This UserId ${userId} is Invalid ! 🙄` })

        const userDoc = await userModel.findById(userId);
        if (!userDoc)
            return res.status(400).send({ status: false, message: `No User Found With this UserId ${userId} 🤣` })

        // cartId Validations
        if (!cartId) return res.status(404).send({ status: false, message: "CartId Is Required !!" })

        if (!validator.isValidObjectId(cartId))
            return res.status(400).send({ status: false, message: `This cartId ${cartId} is Invalid ! 🙄` })

        // cartmodel check

        const cartDoc = await cartModel.findOne({ _id: cartId, userId }).select({ _id: 0, __v: 0, createdAt: 0, updatedAt: 0 }).lean();
        // console.log(cartDoc)

        if (!cartDoc)
            return res.status(404).send({ status: false, message: `No Cart Found with this CartId ${cartId} 🛁` })

        if (cartDoc.items.length === 0)
            return res.status(404).send({ status: false, message: "No Product Found in this Cart 🛁 " })


        const orderDoc = await orderModel.findOne({ userId }).select({ _id: 0, __v: 0 })
       

        if (orderDoc)
            return res.status(409).send({ status: false, message: "Order already exists !! 😎", data: orderDoc })

        let arr = cartDoc.items;

        let allQuantity = 0;
        for (let i = 0; i < arr.length; i++) {
            allQuantity += arr[i].quantity
        }

        // cartDoc = JSON.parse(JSON.stringify(cartDoc))

        // cancellable validations
        cancellable ? cartDoc['cancellable'] = cancellable : cartDoc['cancellable'] = cancellable;


        cartDoc['totalQuantity'] = allQuantity;
        cartDoc['deletedAt'] = null;

         

        await cartModel.findOneAndUpdate({ _id: cartId }, { items: [], totalItems: 0, totalPrice: 0 })

        const data = await orderModel.create(cartDoc);

        return res.status(201).send({ status: true, message: "Order Created successfully  !! 😎", data })

    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

const orderDetails = async function(req,res){
    try{
        let  params = req.params
        let { userId,orderId} = params
        if (!validator.isValidObjectId(userId))
        return res.status(400).send({ status: false, message: "Enter a Valid userId  !!" });

        if (!validator.isValidObjectId(orderId))
        return res.status(400).send({ status: false, message: "Enter a Valid orderId  !!" });

        let orderData= await orderModel.findOne({userId,orderId})
        if(!orderData) return res.status(404).send({status:false,message:"No such order exists"})
        return res.status(200).send({status:true,message:"Order Details",data:orderData})
    }
     catch(err){
    return res.status(500).send({status:false,message:err.message})
    }
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////

const getOrderList = async function (req,res){
    try{
        let userId = req.params.userId
        let customerId = req.query.customerId
        if (!validator.isValidObjectId(userId))
        return res.status(400).send({ status: false, message: "Enter a Valid userId  !!" });
       
        if (!validator.isValidObjectId(customerId))
        return res.status(400).send({ status: false, message: "Enter a Valid customerId  !!" });

        let userInfo = await userModel.findById({ _id: userId });
        if (userInfo.role != "admin")
          return res
            .status(403)
            .send({ status: false, message: "you are not admin" });

        let orderData= await orderModel.find({userId:customerId})
        if(!orderData) return res.status(404).send({status:false,message:"No such order exists"})
        return res.status(200).send({status:true,message:"Order Details",data:orderData})
    }
     catch(err){
    return res.status(500).send({status:false,message:err.message})
    }
} 




module.exports = { createOrder, getOrderList ,orderDetails}