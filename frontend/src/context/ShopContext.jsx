import React, { useEffect, useState } from "react";
import { createContext } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from 'axios'
import { jwtDecode } from "jwt-decode";

export const ShopContext = createContext();

const ShopContextProvider = (props) => {

   const currency = '$';
   const delivery_fee = 10;
   const backendUrl = import.meta.env.VITE_BACKEND_URL
   const [search, setSearch] = useState('');
   const [showSearch, setShowSearch] = useState(false);
   const [cartItems, setCartItems] = useState({});
   const [products, setProducts] = useState([]);
   const [token, setToken] = useState('')
   const navigate = useNavigate();

   const addToCart = async (itemId, size) => {
  if (!size) {
    toast.error("Select Product Size");
    return;
  }

  let cartData = structuredClone(cartItems);

  if (cartData[itemId]) {
    if (cartData[itemId][size]) {
      cartData[itemId][size] += 1;
    } else {
      cartData[itemId][size] = 1;
    }
  } else {
    cartData[itemId] = {};
    cartData[itemId][size] = 1;
  }

  setCartItems(cartData);

  if (token) {
    try {
      const userId = jwtDecode(token).id;
      await axios.post(
        backendUrl + "/api/cart/add",
        { itemId, size, userId },
        { headers: { token } }
      );
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  }
};

   
const getCartCount = () => {
  let totalCount = 0;

  for (const itemId in cartItems) {
    const sizes = cartItems[itemId];
    for (const size in sizes) {
      try {
        if (sizes[size] > 0) {
          totalCount += sizes[size];
        }
      } catch {
        // Ignored
      }
    }
  }
  return totalCount;
}
    
 const updateQuantity = async (itemId, size, quantity) => {
  let cartData = structuredClone(cartItems);
  cartData[itemId][size] = quantity;
  setCartItems(cartData);

  if (token) {
    try {
      const userId = jwtDecode(token).id;
      await axios.post(
        backendUrl + "/api/cart/update",
        { itemId, size, quantity, userId },
        { headers: { token } }
      );
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  }
};

   const getCartAmount = () => {
    let totalAmount = 0;
    for(const items in cartItems){
      let itemInfo = products.find((product)=> product._id === items);
      for(const item in cartItems[items]){
        try {
          if(cartItems[items][item] > 0){
            totalAmount += itemInfo.price * cartItems[items][item];
          }
        } catch (error) {
          console.error(error);
        }
      }
    }
    return totalAmount;
   }

   const getProductsData = async () => {
    try {
      
      const response = await axios.get(backendUrl + '/api/product/list')
      if(response.data.success){
        setProducts(response.data.products)
      } else{
        toast.error(response.data.message)
      }

    } catch (error) {
      console.log(error);
      toast.error(error.message)
    }
   }

 useEffect(() => {
  const savedToken = localStorage.getItem('token');
  if (savedToken) {
    setToken(savedToken);
  }
}, []);

useEffect(() => {
  if (token) {
    getUserCart(token); // ✅ Now get cart when token is available
  }
}, [token]);


   const getUserCart = async ( token ) => {
    try {
      
      const response = await axios.post(backendUrl + '/api/cart/get', {}, {headers:{token}})
      if(response.data.success){ 
         console.log("Cart response from backend:", response.data); // 👈 Check this
           setCartItems(response.data.cartItems); // Ensure this matches your backend key
}

    } catch (error) {
      console.log(error)
    }
   }

   useEffect(()=>{
    getProductsData()
   },[])

   useEffect(()=>{
    if(!token && localStorage.getItem('token')){  
      setToken(localStorage.getItem('token'))
    }
   },[])

    const value = {
        products , currency, delivery_fee,
        search, setSearch, showSearch, setShowSearch,
        cartItems, setCartItems, addToCart, getCartCount, updateQuantity,
        getCartAmount, navigate, backendUrl, setToken, token
    }
 
    return (
        <ShopContext.Provider value={value}>
            {props.children}
        </ShopContext.Provider>
    )
}

export default ShopContextProvider;