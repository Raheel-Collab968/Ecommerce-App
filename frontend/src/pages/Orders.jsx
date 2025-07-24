import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import Title from '../components/Title';
import axios from 'axios';

const Orders = () => {
  const { backendUrl, token, currency } = useContext(ShopContext);

  const [orderData, setOrderData] = useState([]);
  const [products, setProducts] = useState([]);

  const loadOrderData = async () => {
    try {
      if (!token) return;

      // 1. Load product list
      const productRes = await axios.get(`${backendUrl}/api/product/list`);
      setProducts(productRes.data.products);

      // 2. Load user orders
      const orderRes = await axios.post(`${backendUrl}/api/order/userorders`, {}, { headers: { token } });

      if (orderRes.data.success) {
        let allItems = [];

        orderRes.data.orders.forEach((order) => {
          order.items.forEach((item) => {
            const product = productRes.data.products.find(p => p._id === item.itemId);

            allItems.push({
  ...item,
  status: order.status,
  payment: order.payment,
  paymentMethod: order.paymentMethod,
  date: order.date,
  name: product?.name || 'Unknown Product',
  image: (() => {
    const img = Array.isArray(product?.image) ? product.image[0] : product?.image;
    if (!img) return '/default-product.jpg';
    if (img.startsWith('http')) return img;
    return `${backendUrl}/${img}`;
  })()
});
       });
    });

        console.log("Rendering Order Item:", allItems);
        setOrderData(allItems.reverse());
      }
    } catch (error) {
      console.error('Order Fetch Error:', error);
    }
  };

  useEffect(() => {
    loadOrderData();
  }, [token]);

  return (
    <div className="border-t pt-16">
      <div className="text-2xl">
        <Title text1={'MY'} text2={'ORDERS'} />
      </div>

      <div>
        {
        orderData.length === 0 ? (
          <p className="text-gray-600 text-center py-8">No orders yet.</p>
        ) : (
          orderData.slice(0, 6).map((item, index) => (
            <div key={index} className="py-4 border-t border-b text-gray-700 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-start gap-6 text-sm">
                <img className='w-16 sm:w-20 object-cover rounded'
                 src={item.image.startsWith('http') ? item.image : `${backendUrl}/${item.image}`}
                 onError={(e) => (e.target.src = '/default-product.jpg')}
                 alt={item.name}
               />

                <div>
                  <p className="sm:text-base font-medium">{item.name}</p>
                  <div className="flex items-center gap-3 mt-1 text-base text-gray-700">
                    <p>{currency}{item.price}</p>
                    <p>Quantity: {item.quantity}</p>
                    <p>Size: {item.size}</p>
                  </div>
                  <p className="mt-1">Date: <span className="text-gray-400">{new Date(item.date).toDateString()}</span></p>
                  <p className="mt-1">Payment: <span className="text-gray-400">{item.paymentMethod}</span></p>
                </div>
              </div>
              <div className="md:w-1/2 flex justify-between">
                <div className="flex items-center gap-2">
                  <p className="min-w-2 h-2 rounded-full bg-green-500"></p>
                  <p className="text-sm md:text-base">{item.status}</p>
                </div>
                <button className="border px-4 py-2 text-sm font-medium rounded-sm cursor-pointer">Track Order</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Orders;
