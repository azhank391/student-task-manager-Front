import { useState } from 'react'
import React from 'react'
import { Routes,Route,Link } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import TaskForm from './components/TaskForm'
import AdminPanel from './pages/AdminPanel'
import 'react-toastify/dist/ReactToastify.css';
function App() {


  return (
    <>
      
      <Routes>
        <Route path='/login' element={<Login />} />
        <Route path='/' element={<Register />} />
        <Route path='/dashboard' element={<Dashboard />} />
        <Route path='/task-form' element={<TaskForm />} />
        <Route path='/admin' element={<AdminPanel />} />
        {/* Add more routes here as needed */}
      </Routes>
      
    </>
  )
}

export default App
