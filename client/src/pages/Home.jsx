import React, { useContext, useEffect } from 'react'
import Navbar from '../components/Navbar.jsx'
import Header from '../components/Header.jsx'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext.jsx'
import Footer from '../components/Footer.jsx'
const Home = () => {
  const navigate = useNavigate()
  const {userData, isLoggedIn} = useContext(AppContext)
 useEffect(()=>{
  console.log(1)
  if(isLoggedIn & !userData.status){
    navigate('/email-verify')
  }
 },[])
  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-[url("/bg_img.png")] bg-cover bg-center'>
      <Navbar/>
      <Header/>
      <Footer/>
    </div>
  )
}

export default Home
