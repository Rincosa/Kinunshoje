import React from 'react';
import useCart from '../../../hooks/useCart';
import useAuth from '../../../hooks/useAuth';
import axios from 'axios';

const CheckoutFromSSL = () => {
    const [cart, refetch]= useCart();
    const {user}= useAuth();
    const totalPrice= cart.reduce((total,item)=> total + item.price, 0);

    const handleCreatePayment= async ()=>{
        // now save the payment in the database
        const payment= {
            email: user.email,
            price: totalPrice,
            transactionId: "",
            date: new Date(),
            cartIds: cart.map((item)=>item._id),
            menuItemIds: cart.map((item)=> item.menuId),
            status: "pending",
        };

        const response= await axios.post('https://bistro-boss-server-theta-ivory.vercel.app/create-ssl-payment', payment)

        if(response.data?.gatewayUrl){
            window.location.replace(response.data?.gatewayUrl)
        }

        console.log("response", response);
    };

    return (
        <div className=' w-full'>
            <div className="phone-1 p-5 flex flex-col gap-4">
                <h1 className='font-bold text-xl'>Payment Details</h1>
                <p>Complete your order by providing Your payment details.</p>

                <p className='font-semibold'>Email</p>
                <input
                    type="text"
                    placeholder={user.email}
                    className="input input-bordered input-info w-full max-w-full" />
                    <button onClick={handleCreatePayment} className="btn btn-neutral">Place Order</button>
            </div>
        </div>
    );
};

export default CheckoutFromSSL;