import React, { useContext } from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import EmailVerify from './pages/EmailVerify';
import ResetPassword from './pages/ResetPassword';
import { ToastContainer } from 'react-toastify';
import { AppContext } from './context/AppContext';
import Footer from './components/Footer';
const App = () => {
  const { authReady } = useContext(AppContext);

  return (
    <div>
      {authReady && (
        <>
          <ToastContainer 
          autoClose={2000}
          closeOnClick={true}
          pauseOnFocusLoss={false}
          />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/email-verify" element={<EmailVerify />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Routes>
      <Footer/>

        </>
      )}
    </div>
  );
};

export default App;
