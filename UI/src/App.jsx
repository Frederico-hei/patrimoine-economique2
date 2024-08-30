// src/App.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PatrimoineChart from './PatrimoineChart';
import data from '../../data/data.json';
import Personne from '../../models/Personne';
import Patrimoine from '../../models/Patrimoine';
import BienMateriel from '../../models/possessions/BienMateriel';
import Flux from '../../models/possessions/Flux';

export default function App() {
    const [personnes, setPersonnes] = useState([]);
    const [patrimoines, setPatrimoines] = useState([]);
    const [selectedPersonne, setSelectedPersonne] = useState('');
    const [date, setDate] = useState(new Date());
    const [valeurPatrimoine, setValeurPatrimoine] = useState(0);
    const [editingLibelle, setEditingLibelle] = useState(null);
    const [newDateFin, setNewDateFin] = useState('');

    // Charger les données initiales
    useEffect(() => {
        const loadedPersonnes = data
            .filter(item => item.model === 'Personne')
            .map(item => new Personne(item.data.nom));

        const loadedPatrimoines = data
            .filter(item => item.model === 'Patrimoine')
            .map(item => {
                const possessions = item.data.possessions.map(pos => {
                    if (pos.valeurConstante !== undefined) {
                        return new Flux(
                            pos.possesseur.nom,
                            pos.libelle,
                            pos.valeurConstante,
                            new Date(pos.dateDebut),
                            pos.dateFin ? new Date(pos.dateFin) : null,
                            pos.tauxAmortissement,
                            pos.jour
                        );
                    } else {
                        return new BienMateriel(
                            pos.possesseur.nom,
                            pos.libelle,
                            pos.valeur,
                            new Date(pos.dateDebut),
                            pos.dateFin ? new Date(pos.dateFin) : null,
                            pos.tauxAmortissement
                        );
                    }
                });
                return new Patrimoine(item.data.possesseur.nom, possessions);
            });

        setPersonnes(loadedPersonnes);
        setPatrimoines(loadedPatrimoines);
    }, []);

    // Gérer le changement de personne sélectionnée
    const handlePersonneChange = (e) => {
        setSelectedPersonne(e.target.value);
        setValeurPatrimoine(0); // Réinitialiser la valeur du patrimoine affichée
    };

    // Gérer le changement de date
    const handleDateChange = (e) => {
        setDate(new Date(e.target.value));
    };

    // Calculer la valeur du patrimoine à la date sélectionnée
    const handleApplyClick = () => {
        if (selectedPersonne) {
            const patrimoine = patrimoines.find(p => p.possesseur === selectedPersonne);
            if (patrimoine) {
                const totalValue = patrimoine.getValeur(date);
                setValeurPatrimoine(totalValue.toFixed(2));
            } else {
                setValeurPatrimoine(0);
            }
        }
    };

    // Gérer la suppression d'une possession
    const handleDelete = (libelle) => {
        setPatrimoines(prevPatrimoines =>
            prevPatrimoines.map(patrimoine => {
                if (patrimoine.possesseur === selectedPersonne) {
                    return new Patrimoine(
                        patrimoine.possesseur,
                        patrimoine.possessions.filter(pos => pos.libelle !== libelle)
                    );
                }
                return patrimoine;
            })
        );
    };

    // Gérer le clic sur le bouton "Modifier"
    const handleEditClick = (libelle, currentDateFin) => {
        setEditingLibelle(libelle);
        setNewDateFin(currentDateFin ? currentDateFin.toISOString().slice(0, 10) : '');
    };

    // Mettre à jour la date de fin d'une possession
    const handleUpdateDateFin = () => {
        setPatrimoines(prevPatrimoines =>
            prevPatrimoines.map(patrimoine => {
                if (patrimoine.possesseur === selectedPersonne) {
                    const updatedPossessions = patrimoine.possessions.map(possession => {
                        if (possession.libelle === editingLibelle) {
                            possession.dateFin = newDateFin ? new Date(newDateFin) : null;
                        }
                        return possession;
                    });
                    return new Patrimoine(patrimoine.possesseur, updatedPossessions);
                }
                return patrimoine;
            })
        );
        // Réinitialiser les états d'édition
        setEditingLibelle(null);
        setNewDateFin('');
    };

    // Obtenir le patrimoine de la personne sélectionnée
    const patrimoine = patrimoines.find(p => p.possesseur === selectedPersonne);

    // Obtenir les dates et valeurs pour le graphique
    const getDates = () => {
        if (!patrimoine) return [];
        return patrimoine.possessions.map(pos => pos.dateDebut.toLocaleDateString());
    };

    const getValeurs = () => {
        if (!patrimoine) return [];
        return patrimoine.possessions.map(pos => pos.getValeur(date).toFixed(2));
    };

    return (
        <div className="container mt-3">
            <div className="title text-center">
                <h1 className='text-primary'>Vérifier la valeur du Patrimoine</h1>
            </div>

            {/* Sélection de la personne */}
            <div className='mb-3'>
                <select className='form-control' value={selectedPersonne} onChange={handlePersonneChange}>
                    <option value="">Sélectionner une personne</option>
                    {personnes.map((personne, index) => (
                        <option key={index} value={personne.nom}>{personne.nom}</option>
                    ))}
                </select>
            </div>

            {/* Sélection de la date */}
            <div className='mb-3'>
                <input
                    type="date"
                    className='form-control'
                    value={date.toISOString().slice(0, 10)}
                    onChange={handleDateChange}
                />
            </div>

            {/* Bouton appliquer */}
            <div className='text-center mb-4'>
                <button className='btn btn-success' onClick={handleApplyClick}>Appliquer</button>
            </div>

            {/* Affichage de la valeur du patrimoine */}
            {valeurPatrimoine !== 0 && (
                <div className='text-center mb-4'>
                    <h4>Valeur du patrimoine le {date.toLocaleDateString()} : {valeurPatrimoine} Ar</h4>
                </div>
            )}

            {/* Tableau des possessions */}
            {patrimoine && (
                <div className='mb-5'>
                    <table className='table table-bordered'>
                        <thead>
                            <tr className='bg-light'>
                                <th>Libellé</th>
                                <th>Valeur Initiale</th>
                                <th>Date Début</th>
                                <th>Date Fin</th>
                                <th>Taux d'Amortissement (%)</th>
                                <th>Valeur Actuelle</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {patrimoine.possessions.map((possession, index) => (
                                <tr key={index}>
                                    <td>{possession.libelle}</td>
                                    <td>{possession.valeurConstante ? `${possession.valeurConstante} Ar` : `${possession.valeur} Ar`}</td>
                                    <td>{possession.dateDebut.toLocaleDateString()}</td>
                                    <td>{possession.dateFin ? possession.dateFin.toLocaleDateString() : "Non définie"}</td>
                                    <td>{possession.tauxAmortissement !== null ? possession.tauxAmortissement : 0}</td>
                                    <td>{possession.getValeur(date).toFixed(2)} Ar</td>
                                    <td>
                                        <button
                                            className='btn btn-warning mr-2'
                                            onClick={() => handleEditClick(possession.libelle, possession.dateFin)}
                                        >
                                            Modifier
                                        </button>
                                        <button
                                            className='btn btn-danger'
                                            onClick={() => handleDelete(possession.libelle)}
                                        >
                                            Supprimer
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Formulaire de modification de la date de fin */}
            {editingLibelle && (
                <div className='card mb-5'>
                    <div className='card-body'>
                        <h5 className='card-title'>Modifier la Date de Fin pour "{editingLibelle}"</h5>
                        <div className='form-group'>
                            <label>Nouvelle Date de Fin :</label>
                            <input
                                type="date"
                                className='form-control'
                                value={newDateFin}
                                onChange={(e) => setNewDateFin(e.target.value)}
                            />
                        </div>
                        <button className='btn btn-success mr-2' onClick={handleUpdateDateFin}>Enregistrer</button>
                        <button className='btn btn-secondary' onClick={() => setEditingLibelle(null)}>Annuler</button>
                    </div>
                </div>
            )}

            {/* Graphique de l'évolution du patrimoine */}
            {patrimoine && (
                <div className='mb-5'>
                    <h4 className='text-center mb-4'>Évolution de la Valeur du Patrimoine</h4>
                    <PatrimoineChart dates={getDates()} valeurs={getValeurs()} />
                </div>
            )}
        </div>
    );
}
