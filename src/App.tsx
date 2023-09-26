import React from 'react';
import logo from './logo.svg';
import './App.css';
import { RouterProvider } from 'react-router-dom';
import router from './config/routes';
import { ConfigProvider } from 'antd';

const App = () => {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#7d7ab9',
        },
      }}
    >
      <RouterProvider
        router={router}
      />
    </ConfigProvider>
  );
}

export default App;
