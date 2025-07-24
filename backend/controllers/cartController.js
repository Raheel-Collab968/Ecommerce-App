import userModel from "../models/userModel.js";
import jwt from 'jsonwebtoken';

// add products to user cart
const addToCart = async (req, res) => {
    try {
        
        const {userId, itemId, size } = req.body

        const userData = await userModel.findById(userId)
        const cartData = await userData.cartData;

        if(cartData[itemId]){
            if(cartData[itemId][size]){
                cartData[itemId][size] += 1;
            } else {
                cartData[itemId][size] = 1;
            }
        } else{
            cartData[itemId] = {}
            cartData[itemId][size] = 1
        }

        await userModel.findByIdAndUpdate(userId, {cartData})

        res.json({ success: true, message: "Added To Cart"})

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// update user cart
const updateCart = async (req, res) => {
    try {
        
        const { userId, itemId, size, quantity } = req.body

        const userData = await userModel.findById(userId)
        const cartData = await userData.cartData;

        cartData[itemId][size] = quantity

         await userModel.findByIdAndUpdate(userId, {cartData})
        res.json({ success: true, message: "Cart Updated"})

    } catch (error) {
        console.log(error)
        res.json({success: false, message: error.message })
    }
}

// get user cart data
const getUserCart = async (req, res) => {
  try {
    const { token } = req.headers;

    if (!token) {
      return res.json({ success: false, message: 'Token missing' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id || decoded._id; // depends how you encode the token

    const userData = await userModel.findById(userId);
    const cartData = userData.cartData;

    res.json({ success: true, cartItems: cartData }); // ✅ match frontend key
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export { addToCart, updateCart, getUserCart }