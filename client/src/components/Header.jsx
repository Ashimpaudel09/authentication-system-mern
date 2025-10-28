import { assets } from "../assets/assets";

import React, { useContext } from 'react'
import { AppContext } from "../context/AppContext";

const Header = () => {
    const {isLoggedIn} = useContext(AppContext)
    if(isLoggedIn){
        console.log("loggedin")
    }
    else{
        console.log("not lpgin")
    }
    return (
        <div className="flex flex-col items-center mt-20  px-4 text-center text-gray-800">
            <img src={assets.header_img} alt=""
                className="w-36 h-36 rounded-full mb-6" />
            <h1 className="flex items-center gap-2 text-xl sm:text-3xl font-medium mb-2">Hey Developers <img src={assets.hand_wave} alt="" className="w-8 aspect-square" /></h1>
            <h2 className="text-3xl sm:text-5xl font-semibold mb-4">Welcome to my Authentication App</h2>
            <p className="mb-8 max-w-md">Hello My name is ashim paudel. and this is just the authentication page i created so nothing much. thank you!!!!</p>
            <button className="border border-gray-500 rounded-full px-8 py-2.5 hover:bg-gray-100 transition-all hover:cursor-pointer">Get Startded</button>
        </div>
    )
}

export default Header
