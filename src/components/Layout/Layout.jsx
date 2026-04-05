import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import './Layout.css';

const Layout = () => {
  return (
    <div className="layout-container">
      <nav className="sidebar">
        <h2>소상공인 광고 도우미</h2>
        <ul>
          <li><NavLink to="/image-generation" className={({isActive}) => isActive ? "active" : ""}>이미지 생성</NavLink></li>
          <li><NavLink to="/adcopy-generation" className={({isActive}) => isActive ? "active" : ""}>광고문구 생성</NavLink></li>
          <li><NavLink to="/image-prompt" className={({isActive}) => isActive ? "active" : ""}>이미지/프롬프트</NavLink></li>
          <li><NavLink to="/test" className={({isActive}) => isActive ? "active" : ""}>테스트</NavLink></li>
        </ul>
      </nav>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
