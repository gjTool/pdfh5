import React from 'react';
import logo from './logo.svg';
import './App.css';
import Pdf from './pdf.js'
function App() {
  return (
    <div className="App">
      <Pdf src= 'https://www.gjtool.cn/pdfh5/git.pdf' />
    </div>
  );
}

export default App;
