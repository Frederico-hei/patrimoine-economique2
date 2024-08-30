import React from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function Menu() {
  return (
    <div className="container">
      <nav className="navbar navbar-expand-lg navbar-light bg-light mb-4 h-25 bg-dark d-flex-row justify-content-center align-items-center">
        <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link className="nav-link text-white" to="/add">Ajout d'un possession</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-white" to="/">Patrimoine</Link>
            </li>
          </ul>
        </div>
      </nav>
    </div>
  );
}
