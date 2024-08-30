import React, { useState } from 'react';
import { Form, Button, Container, Row, Col, Alert } from 'react-bootstrap';

const AddPossessionForm = () => {
  const [formData, setFormData] = useState({
    nom: '',
    libelle: '',
    valeur: '',
    dateDebut: '',
    dateFin: '',
    taux: '',
    valeurConstante: '',
    jour: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validateForm = () => {
    const { nom, libelle, valeur, dateDebut, taux } = formData;
    if (!nom || !libelle || !valeur || !dateDebut || !taux) {
      return 'Tous les champs marqués comme requis doivent être remplis.';
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
  
    try {
      const response = await axios.post('http://localhost:3000/api/possessions', {
        nom: formData.nom,
        libelle: formData.libelle,
        valeur: parseFloat(formData.valeur),
        dateDebut: formData.dateDebut,
        dateFin: formData.dateFin,
        taux: parseFloat(formData.taux),
        valeurConstante: formData.valeurConstante ? parseFloat(formData.valeurConstante) : undefined,
        jour: formData.jour ? parseInt(formData.jour, 10) : undefined
      });
  
      if (response.status === 201) {
        setSuccess('Possession ajoutée avec succès');
        setError('');
        setFormData({
          nom: '',
          libelle: '',
          valeur: '',
          dateDebut: '',
          dateFin: '',
          taux: '',
          valeurConstante: '',
          jour: '',
        });
      }
    } catch (error) {
      if (error.response) {
        setError(`Erreur lors de l'ajout de la possession: ${error.response.data.error || 'Erreur inconnue'}`);
      } else if (error.request) {
        setError('Erreur lors de l\'ajout de la possession : Pas de réponse du serveur');
      } else {
        setError('Erreur lors de l\'ajout de la possession');
      }
      setSuccess('');
    }
  };
  
  
  

  return (
    <Container className="my-4">
      <h2 className="mb-4">Créer une Possession</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group controlId="formNom">
              <Form.Label>Nom du Possesseur</Form.Label>
              <Form.Control
                type="text"
                placeholder="Entrez le nom du possesseur"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="formLibelle">
              <Form.Label>Libellé</Form.Label>
              <Form.Control
                type="text"
                placeholder="Entrez le libellé de la possession"
                name="libelle"
                value={formData.libelle}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>
        </Row>
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group controlId="formValeur">
              <Form.Label>Valeur</Form.Label>
              <Form.Control
                type="number"
                placeholder="Entrez la valeur de la possession"
                name="valeur"
                value={formData.valeur}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="formDateDebut">
              <Form.Label>Date Début</Form.Label>
              <Form.Control
                type="date"
                name="dateDebut"
                value={formData.dateDebut}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>
        </Row>
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group controlId="formDateFin">
              <Form.Label>Date Fin</Form.Label>
              <Form.Control
                type="date"
                name="dateFin"
                value={formData.dateFin}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="formTaux">
              <Form.Label>Taux d'Amortissement</Form.Label>
              <Form.Control
                type="number"
                placeholder="Entrez le taux d'amortissement"
                name="taux"
                value={formData.taux}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>
        </Row>
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group controlId="formJour">
              <Form.Label>Jour</Form.Label>
              <Form.Control
                type="number"
                placeholder="Entrez le jour (optionnel)"
                name="jour"
                value={formData.jour}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="formValeurConstante">
              <Form.Label>Valeur Constante</Form.Label>
              <Form.Control
                type="number"
                placeholder="Entrez la valeur constante (optionnel)"
                name="valeurConstante"
                value={formData.valeurConstante}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
        </Row>
        <Button variant="primary" type="submit">Ajouter la Possession</Button>
      </Form>
    </Container>
  );
};

export default AddPossessionForm;
