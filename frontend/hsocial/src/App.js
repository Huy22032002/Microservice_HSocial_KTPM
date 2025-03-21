import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import './App.css';
import React from 'react';
import Login from './components/login';
import SignUp from './components/signup';
import Home from './components/home';
import Chat from './components/ChatWebSocket'
import { Provider } from 'react-redux';
import { store } from './redux/userSlice';
function App() {
  return (
    <Provider store={store}>
    <BrowserRouter>
      <Routes>
          <Route path='/' element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<SignUp />} /> 
          <Route path='chat' element={<Chat />}/>
      </Routes>
    </BrowserRouter>
    </Provider>
  );
}

export default App;
