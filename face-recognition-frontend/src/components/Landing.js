import React from 'react';
import { Link } from 'react-router-dom';
import { FaIdCard, FaCamera } from 'react-icons/fa';
import '../style/Landing.css'

function Landing() {
  return (
    <div className="landing-container">
      <h1>Vérification d'identité</h1>
      <p>Vous serez dirigé vers un site Web tiers pour effectuer les étapes suivantes.</p>
      <div className="steps">
        <div className="step">
          <FaIdCard className="icon" />
          <span>Vérification du document d'identité</span>
        </div>
        <div className="step">
          <FaCamera className="icon" />
          <span>Prenez un selfie.</span>
        </div>
      </div>
      <p>Cliquez sur <strong>«Continuer»</strong> pour poursuivre.</p>
      <div className="terms">
        <input type="checkbox" id="terms" />
        <label htmlFor="terms">
          Je comprends que mes informations personnelles seront traitées par un tiers pour effectuer une vérification d'identité et je confirme que j'accepte le traitement des données biométriques comme décrit dans la <a href="https://example.com">politique de confidentialité</a>.
        </label>
      </div>
      <Link to="/instructions">
        <button className="continue-button">Continuer</button>
      </Link>
    </div>
  );
}

export default Landing;
