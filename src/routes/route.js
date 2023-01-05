const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController')
const productController = require('../controllers/productController')
const {Authenticate, Authorisation} = require('../middleware/middware')
const cartController = require('../controllers/cartController')
const orderController = require('../controllers/orderCotroller')

// <------------User Api's----------------->
router.post('/register', userController.register)
router.post('/login', userController.login)
router.get('/user/:userId/profile', Authenticate, Authorisation, userController.getProfile)
router.put('/user/:userId/profile', Authenticate, Authorisation, userController.updateProfile)

//<------------------Products Api's------------------->
router.post('/products/:userId',Authenticate, Authorisation, productController.product)
router.get('/products/:userId',Authenticate, Authorisation, productController.getAllProducts)
router.put('/products/:userId/:productId',Authenticate, Authorisation, productController.updateProduct)
router.get('/products/:userId/:productId',Authenticate, Authorisation, productController.getProductById)
router.delete('/products/:userId/:productId',Authenticate, Authorisation, productController.deleteProductById)

//<------------------Cart Api's-------------------------->
router.post('/users/:userId/cart', Authenticate, Authorisation, cartController.createCart)
router.put('/users/:userId/cart', Authenticate, Authorisation, cartController.updateCart)
router.get('/users/:userId/cart',Authenticate, Authorisation, cartController.getCart)
router.delete('/users/:userId/cart', Authenticate, Authorisation, cartController.deleteCart)

// <-----------Order Api's----------------->
router.post('/users/:userId/orders', Authenticate, Authorisation, orderController.createOrder)
router.get('/users/:userId/orders/:orderId', Authenticate, Authorisation, orderController.orderDetails)
router.get('/users/:userId/orders', Authenticate, Authorisation, orderController.getOrderList)

router.all("*", function (req, res) {
    res.status(404).send({
        status: false,
        message: "Page Not Found 🙄"
    })
})

module.exports = router;