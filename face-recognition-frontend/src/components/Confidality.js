import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../style/Confidality.css'
function Confidality() {
  const [country, setCountry] = useState('Autres pays');

  return (
    <div className="confidality-container">
      <h2>Nous vous demandons également d'accepter notre traitement de vos données personnelles :</h2>
      <form>
        <div>
          <p>Je suis résident ou j'habite dans le pays :</p>
          <div className="radio-group">
            <label>
              <input
                type="radio"
                value="États-unis d'Amérique"
                checked={country === "États-unis d'Amérique"}
                onChange={() => setCountry("États-unis d'Amérique")}
              />
              États-unis d'Amérique
            </label>
            <label>
              <input
                type="radio"
                value="Autres pays"
                checked={country === 'Autres pays'}
                onChange={() => setCountry('Autres pays')}
              />
              Autres pays
            </label>
          </div>
        </div>
        <p>Pour poursuivre le processus d’identification, vous devez accepter nos conditions en cochant les deux cases ci-dessous :</p>
        <label className="checkbox-container">
          <input type="checkbox" required />
          En cliquant sur le bouton « Continuer », je confirme avoir lu l'Avis de confidentialité et donne mon consentement au traitement de mes données personnelles, y compris biométriques, tel que décrit le présent Notification de traitement des données personnelles.
        </label>
        <Link to="/LiveDetection">
          <button className="accept-button">
            ACCEPTER ET CONTINUER
          </button>
        </Link>
      </form>
    </div>
  );
}

export default Confidality;
