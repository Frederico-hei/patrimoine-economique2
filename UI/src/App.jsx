
import React, { useState } from "react";
import data from "../../data/data.json";
import "bootstrap/dist/css/bootstrap.min.css";
import "./custom.css";
import Possession from "../../models/possessions/Possession.js";
import Patrimoine from "../../models/Patrimoine.js";


const App = () => {
  const personnes = data
    .filter((item) => item.model === "Personne")
    .map((item) => item.data);
  const possessionsData = data.filter((item) => item.model === "Patrimoine")[0].data
    .possessions;
  const [selectedPersonne, setSelectedPersonne] = useState("");
  const [dateOuverture, setDateOuverture] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [patrimoineValeur, setPatrimoineValeur] = useState(null);

  const handlePersonneChange = (e) => setSelectedPersonne(e.target.value);
  const handleDateChange = (e) => setDateOuverture(e.target.value);

  const afficherValeurPatrimoine = () => {
    const possessionsPersonne = possessionsData.filter(
      (possession) => possession.possesseur.nom === selectedPersonne
    );
    const patrimoine = new Patrimoine(selectedPersonne, possessionsPersonne);
    const valeurPatrimoine = patrimoine.getValeur(dateOuverture);
    setPatrimoineValeur(valeurPatrimoine);
  };

  return (
    <div className="container mt-4 custom-container">
      <h1 className="custom-title">Tableau des Possessions</h1>
      <div className="form-group custom-form-group">
        <label className="custom-label">Sélectionner une personne:</label>
        <select
          className="form-control custom-select"
          value={selectedPersonne}
          onChange={handlePersonneChange}
        >
          <option value="">--Sélectionner--</option>
          {personnes.map((personne, index) => (
            <option key={index} value={personne.nom}>
              {personne.nom}
            </option>
          ))}
        </select>
      </div>

      {selectedPersonne && (
        <div>
          <h2 className="custom-subtitle">Possessions de {selectedPersonne}</h2>
          <table className="table table-striped custom-table">
            <thead>
              <tr>
                <th>Libelle</th>
                <th>Valeur Initiale</th>
                <th>Date Début</th>
                <th>Date Fin</th>
                <th>Taux Amortissement</th>
                <th>Valeur Actuelle</th>
              </tr>
            </thead>
            <tbody>
              {possessionsData
                .filter(
                  (possession) => possession.possesseur.nom === selectedPersonne
                )
                .map((possession, index) => (
                  <tr key={index}>
                    <td>{possession.libelle}</td>
                    <td>
                      {possession.valeurConstante
                        ? possession.valeurConstante + " €"
                        : possession.valeur + " €"}
                    </td>
                    <td>
                      {new Date(possession.dateDebut).toLocaleDateString()}
                    </td>
                    <td>
                      {possession.dateFin
                        ? new Date(possession.dateFin).toLocaleDateString()
                        : "En cours"}
                    </td>
                    <td>
                      {possession.tauxAmortissement !== null
                        ? possession.tauxAmortissement + "%"
                        : "N/A"}
                    </td>
                    <td>
                      {new Patrimoine(
                        selectedPersonne,
                        [possession]
                      ).getValeur(dateOuverture).toFixed(2)} €
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>

          <div className="form-group custom-form-group">
            <label className="custom-label">Saisir une date:</label>
            <input
              type="date"
              className="form-control custom-input"
              value={dateOuverture}
              onChange={handleDateChange}
            />
          </div>
          <button
            className="btn btn-primary custom-button"
            onClick={afficherValeurPatrimoine}
          >
            Valider
          </button>

          {patrimoineValeur !== null && (
            <div className="mt-3 custom-result">
              <h3>Valeur du Patrimoine de {selectedPersonne}</h3>
              <p>{patrimoineValeur.toFixed(2)} €</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default App;
