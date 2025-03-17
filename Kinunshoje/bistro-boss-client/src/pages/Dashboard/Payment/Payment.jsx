import React, { useState } from 'react';
import SectionTitle from '../../../components/SectionTitle/SectionTitle';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutFrom from './CheckoutFrom';
import CheckoutFromSSL from './CheckoutFromSSL';

// TODO: add publish key
const stripePromise = loadStripe(import.meta.env.VITE_Payment_Gateway_PK);

const Payment = () => {
    let [paymentType, setPaymentType]= useState("ssl");
    const valueChanged= (n)=>{
        
        setPaymentType(n);
        console.log(paymentType)
    }
    return (
        <div>
            <SectionTitle heading="Payment" subHeading="Please pay to eat"></SectionTitle>
            <div>
                <div>
                    <Elements stripe={stripePromise}>
                    <label className="text-lg font-semibold">Select Payment Type:</label>
                        <select value={paymentType} onChange={(e)=> setPaymentType(e.target.value)} className="select select-bordered join-item m-10">
                            <option value="ssl">SSL Commerze</option>
                            <option value="stripe">Stripe</option>
                        </select>
                        <div className='menu xl:menu-horizontal bg-base-200 rounded-box w-full'>
                        {
                            paymentType ==='stripe' ? <CheckoutFrom></CheckoutFrom> : <CheckoutFromSSL></CheckoutFromSSL>
                        }
                        </div>
                    </Elements>
                </div>
            </div>
        </div>
    );
};

export default Payment;