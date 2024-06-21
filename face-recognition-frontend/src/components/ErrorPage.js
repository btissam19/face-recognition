import React from 'react';
import '../style/ErrorPage.css';
import { Link } from 'react-router-dom';

function ErrorPage() {
  return (
    <div className="error-page">
      <div className="error-content">
        <div className="error-icon-container">
          <div className="error-icon">⚠️</div>
        </div>
        <h1 className="error-title">Malheureusement, nous n'avons pas pu accepter ce document</h1>
        <p className="error-message">
          L'image n'est pas nette. Prenez-en une nouvelle et assurez-vous que toutes les données sont visibles.
        </p>
        <div className="error-buttons">
        <Link to="/verification">
          <button className="retry-button">RÉESSAYER</button>
        </Link>
        </div>
      </div>
    </div>
  );
}

export default ErrorPage;
