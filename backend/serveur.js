const express = require('express');
const fs = require('fs');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;
const dataFilePath = '../data/data.json';
const Possession = require('../models/possessions/Possession');
const Patrimoine = require('../models/Patrimoine')

app.use(cors());
app.use(bodyParser.json());

const loadData = () => {
    try {
      console.log(`Chargement des données depuis ${dataFilePath}`);
      const data = fs.readFileSync(dataFilePath, 'utf8');
      console.log('Données chargées:', data);
      return JSON.parse(data);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error.message);
      return [];
    }
  };
  
  // Fonction pour sauvegarder les données
  const saveData = (data) => {
    try {
      fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des données:', error.message);
    }
  };

app.get('/api/possessions', (req, res) => {
    const data = loadData();
    const possessions = data
        .filter(d => d.model === 'Patrimoine')
        .flatMap(d => d.data.possessions);
    res.json(possessions);
});

app.post('/api/possessions', (req, res) => {
    const { nom, libelle, valeur, dateDebut, dateFin, taux, valeurConstante, jour } = req.body;
    
    try {
        if (!nom || !libelle || !valeur || !dateDebut || !taux) {
            return res.status(400).json({ error: 'Tous les champs requis doivent être remplis' });
        }
  
        const dateDebutObj = new Date(dateDebut);
        const dateFinObj = dateFin ? new Date(dateFin) : null;
  
        const newPossession = new Possession(
            nom,
            libelle,
            parseFloat(valeur),
            dateDebutObj,
            dateFinObj,
            parseFloat(taux)
        );
  
        if (valeurConstante !== undefined) {
            newPossession.valeurConstante = parseFloat(valeurConstante);
        }
        if (jour !== undefined) {
            newPossession.jour = parseInt(jour, 10);
        }
  
        if (!Patrimoine[nom]) {
            Patrimoine[nom] = new Patrimoine(nom, []);
        }
  
        Patrimoine[nom].addPossession(newPossession);
  
        const updatedData = [];
        for (const [key, patrimoine] of Object.entries(patrimoine)) {
            updatedData.push({
                model: 'Patrimoine',
                data: {
                    possesseur: { nom: key },
                    possessions: patrimoine.possessions.map(p => ({
                        possesseur: { nom: p.possesseur },
                        libelle: p.libelle,
                        valeur: p.valeur,
                        dateDebut: p.dateDebut instanceof Date && !isNaN(p.dateDebut.getTime()) ? p.dateDebut.toISOString() : null,
                        dateFin: p.dateFin && p.dateFin instanceof Date && !isNaN(p.dateFin.getTime()) ? p.dateFin.toISOString() : null,
                        tauxAmortissement: p.tauxAmortissement,
                        valeurConstante: p.valeurConstante,
                        jour: p.jour
                    }))
                }
            });
        }
  
        const existingPersons = loadData().filter(d => d.model === 'Personne').map(d => d.data.nom);
        if (!existingPersons.includes(nom)) {
            updatedData.push({
                model: 'Personne',
                data: { nom: nom }
            });
        }
  
        saveData(updatedData);
  
        res.status(201).json(newPossession);
    } catch (error) {
        console.error('Erreur lors de l\'ajout de la possession:', error.message);
        res.status(500).json({ error: 'Erreur lors de l\'ajout de la possession' });
    }
});

app.delete('/api/possessions/:libelle', (req, res) => {
    const { libelle } = req.params;
    let possessionFound = false;

    const data = loadData();
    const patrimoines = data.filter(d => d.model === 'Patrimoine').reduce((acc, item) => {
        acc[item.data.possesseur.nom] = item.data;
        return acc;
    }, {});

    for (const [key, patrimoine] of Object.entries(patrimoines)) {
        const possessionIndex = patrimoine.possessions.findIndex(p => p.libelle === libelle);
        if (possessionIndex !== -1) {
            patrimoine.possessions.splice(possessionIndex, 1);
            possessionFound = true;

            const updatedData = [];
            for (const [key, patrimoine] of Object.entries(patrimoines)) {
                updatedData.push({
                    model: 'Patrimoine',
                    data: {
                        possesseur: { nom: key },
                        possessions: patrimoine.possessions.map(p => ({
                            possesseur: { nom: p.possesseur },
                            libelle: p.libelle,
                            valeur: p.valeur,
                            dateDebut: p.dateDebut instanceof Date && !isNaN(p.dateDebut.getTime()) ? p.dateDebut.toISOString() : null,
                            dateFin: p.dateFin && p.dateFin instanceof Date && !isNaN(p.dateFin.getTime()) ? p.dateFin.toISOString() : null,
                            tauxAmortissement: p.tauxAmortissement,
                            valeurConstante: p.valeurConstante,
                            jour: p.jour
                        }))
                    }
                });
            }

            const existingPersons = data.filter(d => d.model === 'Personne').map(d => d.data.nom);
            if (!existingPersons.includes(key)) {
                updatedData.push({
                    model: 'Personne',
                    data: { nom: key }
                });
            }

            saveData(updatedData);
            break;
        }
    }

    if (possessionFound) {
        res.status(200).send('Possession supprimée avec succès');
    } else {
        res.status(404).send('Possession non trouvée');
    }
});


app.put('/api/possessions/:libelle', (req, res) => {
    const { libelle } = req.params;
    const { dateFin } = req.body;

    let possessionFound = false;

    const data = loadData();
    const patrimoines = data.filter(d => d.model === 'Patrimoine').reduce((acc, item) => {
        acc[item.data.possesseur.nom] = item.data;
        return acc;
    }, {});

    for (const [key, patrimoine] of Object.entries(patrimoines)) {
        const possession = patrimoine.possessions.find(p => p.libelle === libelle);
        if (possession) {
            possession.dateFin = new Date(dateFin);
            possessionFound = true;

            const updatedData = [];
            for (const [key, patrimoine] of Object.entries(patrimoines)) {
                updatedData.push({
                    model: 'Patrimoine',
                    data: {
                        possesseur: { nom: key },
                        possessions: patrimoine.possessions.map(p => ({
                            possesseur: { nom: p.possesseur },
                            libelle: p.libelle,
                            valeur: p.valeur,
                            dateDebut: p.dateDebut instanceof Date && !isNaN(p.dateDebut.getTime()) ? p.dateDebut.toISOString() : null,
                            dateFin: p.dateFin && p.dateFin instanceof Date && !isNaN(p.dateFin.getTime()) ? p.dateFin.toISOString() : null,
                            tauxAmortissement: p.tauxAmortissement,
                            valeurConstante: p.valeurConstante,
                            jour: p.jour
                        }))
                    }
                });
            }

            const existingPersons = data.filter(d => d.model === 'Personne').map(d => d.data.nom);
            if (!existingPersons.includes(key)) {
                updatedData.push({
                    model: 'Personne',
                    data: { nom: key }
                });
            }

            saveData(updatedData);
            break;
        }
    }

    if (possessionFound) {
        res.status(200).send('Possession mise à jour avec succès');
    } else {
        res.status(404).send('Possession non trouvée');
    }
});


app.listen(port, () => {
    console.log(`Serveur démarré sur http://localhost:${port}`);
});
