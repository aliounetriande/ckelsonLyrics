import React from 'react';
import './Loader.css';

const Loader: React.FC = () => {
  return (
    <div className="loader">
      <img src="/logo.png" alt="Ckelson Logo" className="loader-logo" />
    </div>
  );
};

export default Loader;