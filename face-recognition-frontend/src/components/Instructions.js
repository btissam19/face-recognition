import React from 'react';
import { Link } from 'react-router-dom';
import { FaIdCard, FaCamera } from 'react-icons/fa';
import '../style/Instructions.css';

function Instructions() {
  return (
    <div className="instructions-container">
      <h2>PAS ENCORE VÉRIFIÉ ?</h2>
      <Link to="/confidality">
        <button className="continue-button">CONTINUER</button>
      </Link>
      <p>Follow these steps:</p>
      <div className="step">
        <FaIdCard className="icon" />
        <span>Document d'identité</span>
      </div>
      <p className="description">
        Fournissez votre document d'identité (Passeport, Carte d'identité, Permis de conduire, Titre de séjour) pour qu'il soit numérisé. Assurez-vous qu'il est toujours valide et qu'il n'est pas endommagé.
      </p>
      <div className="step">
        <FaCamera className="icon" />
        <span>Selfie</span>
      </div>
      <p className="description">
        Prenez un selfie avec votre webcam sur un fond neutre. Veuillez retirer tout objet pouvant couvrir votre visage, comme un masque ou des lunettes de soleil.
      </p>
    </div>
  );
}

export default Instructions;
