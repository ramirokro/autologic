import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './VehicleSelector.css';

const VehicleSelector = ({ onVehicleSelect, selectedVehicle }) => {
  const [years, setYears] = useState([]);
  const [makes, setMakes] = useState([]);
  const [models, setModels] = useState([]);
  const [engines, setEngines] = useState([]);
  
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedMake, setSelectedMake] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedEngine, setSelectedEngine] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar años al inicio
  useEffect(() => {
    fetchYears();
  }, []);

  // Cargar marcas cuando se selecciona un año
  useEffect(() => {
    if (selectedYear) {
      fetchMakes(selectedYear);
      setSelectedMake('');
      setSelectedModel('');
      setSelectedEngine('');
      setModels([]);
      setEngines([]);
    }
  }, [selectedYear]);

  // Cargar modelos cuando se selecciona una marca
  useEffect(() => {
    if (selectedYear && selectedMake) {
      fetchModels(selectedYear, selectedMake);
      setSelectedModel('');
      setSelectedEngine('');
      setEngines([]);
    }
  }, [selectedYear, selectedMake]);

  // Cargar motores cuando se selecciona un modelo
  useEffect(() => {
    if (selectedYear && selectedMake && selectedModel) {
      fetchEngines(selectedYear, selectedMake, selectedModel);
      setSelectedEngine('');
    }
  }, [selectedYear, selectedMake, selectedModel]);

  // Actualizar vehículo seleccionado cuando se cambian todas las selecciones
  useEffect(() => {
    if (selectedYear && selectedMake && selectedModel) {
      const vehicle = {
        year: parseInt(selectedYear),
        make: selectedMake,
        model: selectedModel,
        engine: selectedEngine || undefined
      };
      onVehicleSelect(vehicle);
    } else {
      onVehicleSelect(null);
    }
  }, [selectedYear, selectedMake, selectedModel, selectedEngine, onVehicleSelect]);

  const fetchYears = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Primero intentamos la API de FastAPI
      let response = await axios.get('/api/vehicles/years');
      let yearsData = response.data;
      
      // Si la respuesta está vacía o hay un error, probamos la API de la aplicación actual
      if (!yearsData || yearsData.length === 0) {
        response = await axios.get('/api/vehicles/year');
        yearsData = response.data;
      }
      
      // Ordenar los años de más reciente a más antiguo
      yearsData.sort((a, b) => b - a);
      setYears(yearsData);
    } catch (err) {
      console.error("Error al cargar años:", err);
      try {
        // Si la primera solicitud falla, intentamos el endpoint de la aplicación existente
        const fallbackResponse = await axios.get('/api/vehicles/year');
        const yearsData = fallbackResponse.data;
        yearsData.sort((a, b) => b - a);
        setYears(yearsData);
      } catch (fallbackErr) {
        setError("No se pudieron cargar los años de vehículos");
        // Si todo falla, usar datos de fallback
        setYears([2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2010, 2005, 2000, 1995, 1990]);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchMakes = async (year) => {
    setLoading(true);
    setError(null);
    
    try {
      // Primero intentamos la API de FastAPI
      let response = await axios.get(`/api/vehicles/makes?year=${year}`);
      let makesData = response.data;
      
      // Si la respuesta está vacía o hay un error, probamos la API de la aplicación actual
      if (!makesData || makesData.length === 0) {
        response = await axios.get(`/api/vehicles/make?year=${year}`);
        makesData = response.data;
      }
      
      // Ordenar alfabéticamente
      makesData.sort();
      setMakes(makesData);
    } catch (err) {
      console.error("Error al cargar marcas:", err);
      try {
        // Si la primera solicitud falla, intentamos el endpoint de la aplicación existente
        const fallbackResponse = await axios.get(`/api/vehicles/make?year=${year}`);
        const makesData = fallbackResponse.data;
        makesData.sort();
        setMakes(makesData);
      } catch (fallbackErr) {
        setError("No se pudieron cargar las marcas de vehículos");
        // Si todo falla, usar datos de fallback para las marcas más comunes
        setMakes(["Audi", "BMW", "Chevrolet", "Dodge", "Ford", "Honda", "Nissan", "Toyota", "Volkswagen"]);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchModels = async (year, make) => {
    setLoading(true);
    setError(null);
    
    try {
      // Primero intentamos la API de FastAPI
      let response = await axios.get(`/api/vehicles/models?year=${year}&make=${make}`);
      let modelsData = response.data;
      
      // Si la respuesta está vacía o hay un error, probamos la API de la aplicación actual
      if (!modelsData || modelsData.length === 0) {
        response = await axios.get(`/api/vehicles/model?year=${year}&make=${make}`);
        modelsData = response.data;
      }
      
      // Ordenar alfabéticamente
      modelsData.sort();
      setModels(modelsData);
    } catch (err) {
      console.error("Error al cargar modelos:", err);
      try {
        // Si la primera solicitud falla, intentamos el endpoint de la aplicación existente
        const fallbackResponse = await axios.get(`/api/vehicles/model?year=${year}&make=${make}`);
        const modelsData = fallbackResponse.data;
        modelsData.sort();
        setModels(modelsData);
      } catch (fallbackErr) {
        setError("No se pudieron cargar los modelos de vehículos");
        // Si todo falla, usar datos de fallback genéricos
        setModels(["Modelo no disponible"]);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchEngines = async (year, make, model) => {
    setLoading(true);
    setError(null);
    
    try {
      // Primero intentamos la API de FastAPI
      let response = await axios.get(`/api/vehicles/engines?year=${year}&make=${make}&model=${model}`);
      let enginesData = response.data;
      
      // Si la respuesta está vacía o hay un error, probamos la API de la aplicación actual
      if (!enginesData || enginesData.length === 0) {
        response = await axios.get(`/api/vehicles/engine?year=${year}&make=${make}&model=${model}`);
        enginesData = response.data;
      }
      
      // Ordenar alfabéticamente
      enginesData.sort();
      setEngines(enginesData);
    } catch (err) {
      console.error("Error al cargar motores:", err);
      try {
        // Si la primera solicitud falla, intentamos el endpoint de la aplicación existente
        const fallbackResponse = await axios.get(`/api/vehicles/engine?year=${year}&make=${make}&model=${model}`);
        const enginesData = fallbackResponse.data;
        enginesData.sort();
        setEngines(enginesData);
      } catch (fallbackErr) {
        // Los motores son opcionales, así que no mostramos error
        setEngines([]);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="vehicle-selector">
      <h2>Selecciona tu vehículo</h2>
      
      {error && <div className="selector-error">{error}</div>}
      
      <div className="selector-group">
        <label htmlFor="year-select">Año</label>
        <select 
          id="year-select"
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          disabled={loading || years.length === 0}
        >
          <option value="">Seleccionar año</option>
          {years.map((year) => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>
      
      <div className="selector-group">
        <label htmlFor="make-select">Marca</label>
        <select 
          id="make-select"
          value={selectedMake}
          onChange={(e) => setSelectedMake(e.target.value)}
          disabled={loading || !selectedYear || makes.length === 0}
        >
          <option value="">Seleccionar marca</option>
          {makes.map((make) => (
            <option key={make} value={make}>{make}</option>
          ))}
        </select>
      </div>
      
      <div className="selector-group">
        <label htmlFor="model-select">Modelo</label>
        <select 
          id="model-select"
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          disabled={loading || !selectedMake || models.length === 0}
        >
          <option value="">Seleccionar modelo</option>
          {models.map((model) => (
            <option key={model} value={model}>{model}</option>
          ))}
        </select>
      </div>
      
      {engines.length > 0 && (
        <div className="selector-group">
          <label htmlFor="engine-select">Motor</label>
          <select 
            id="engine-select"
            value={selectedEngine}
            onChange={(e) => setSelectedEngine(e.target.value)}
            disabled={loading || !selectedModel}
          >
            <option value="">Seleccionar motor</option>
            {engines.map((engine) => (
              <option key={engine} value={engine}>{engine}</option>
            ))}
          </select>
        </div>
      )}
      
      {loading && <div className="selector-loading">Cargando opciones...</div>}
      
      {selectedYear && selectedMake && selectedModel && (
        <div className="selected-vehicle">
          <h3>Vehículo seleccionado:</h3>
          <p>{selectedYear} {selectedMake} {selectedModel} {selectedEngine}</p>
        </div>
      )}
    </div>
  );
};

export default VehicleSelector;