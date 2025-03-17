import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../../providers/AuthProvider';
import { FaCartShopping, FaUser } from 'react-icons/fa6';
import useCart from '../../../hooks/useCart';
import useAdmin from '../../../hooks/useAdmin';

import logo from '../../../assets/home/KinunShojeLogo.png';

const Navbar = () => {
    const { user, logOut } = useContext(AuthContext);
    const [isAdmin]= useAdmin();
    const [cart]= useCart();

    console.log('user now',user)

    const handleLogOut = () => {
        logOut()
            .then(() => { })
            .catch(error => console.log(error))
    }

    const navOptions = <>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/menu">Our Menu</Link></li>
        <li><Link to="/order/salad">Order Food</Link></li>
        {
            user && isAdmin && <li><Link to="/dashboard/adminHome">Dashboard</Link></li>
        }
        {
            user && !isAdmin && <li><Link to="/dashboard/userHome">Dashboard</Link></li>
        }
        <li><Link to="/dashboard/cart">
            <button className="btn">
                <FaCartShopping />
                <div className="badge badge-secondary">+{cart.length}</div>
            </button>
        </Link></li>
        {
            // user ? <>
            //     {/* <span>{user?.displayName}</span> */}
            //     <button onClick={handleLogOut} className="btn btn-ghost">LogOut</button></> : <>
            //     <li><Link to="/login">Login</Link></li></>
        }
    </>
    return (
        <>
            <div className="navbar fixed z-10 bg-opacity-30 max-w-screen-xl bg-black text-white">
                <div className="navbar-start">
                    <div className="dropdown">
                        <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M4 6h16M4 12h8m-8 6h16" />
                            </svg>
                        </div>
                        <ul
                            tabIndex={0}
                            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow">
                            {navOptions}
                        </ul>
                    </div>
                    {/* <a className="btn btn-ghost text-xl">Bistro Boss</a> */}
                    <div className='h-[40px] md:h-[100px]'>
                    <img className='w-auto h-full' src={logo}></img>
                    </div>
                </div>
                <div className="navbar-center hidden lg:flex">
                    <ul className="menu menu-horizontal px-1">
                        {navOptions}
                    </ul>
                </div>
                <div className="navbar-end">
                    {
                        user ? <>
                        {/* <span>{user?.displayName}</span> */}
                        <a className="btn btn-ghost"><FaUser></FaUser>{user.displayName}</a>
                        <button onClick={handleLogOut} className="btn btn-ghost">LogOut</button></> : <>
                        <Link to="/login"><button className="btn btn-ghost mr-5 text-xl">Login</button></Link>
                        {/* <li><Link to="/login">Login</Link></li> */}
                        </>
                    }
                </div>
            </div>
        </>
    );
};

export default Navbar;