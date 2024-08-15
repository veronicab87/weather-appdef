import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaAppStore, FaShareAlt, FaCog, FaInfoCircle, FaSearch, FaCloudSun, FaThermometerHalf, FaSatelliteDish } from 'react-icons/fa';
import ReactTooltip from 'react-tooltip';
import { Container, TextField, Button, Typography, Card, CardContent, Alert, CircularProgress, AppBar, Toolbar, IconButton } from '@mui/material';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './App.css';

const App = () => {
  const [city, setCity] = useState('Bogota');
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [forecast, setForecast] = useState(null);

  useEffect(() => {
    fetchWeather();
  }, []);

  const fetchWeather = async () => {
    if (city.trim() === '') {
      setError('Por favor, ingrese una ciudad válida.');
      return;
    }
    setLoading(true);
    try {
      const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=ff8498e051ef7fc5ef6172bb08af8941&units=metric`);
      setWeather(response.data);
      setError('');
    } catch (error) {
      setWeather(null);
      setError('No se pudo encontrar la ciudad o hubo un problema con la solicitud.');
    }
    setLoading(false);
  };

  const fetchForecast = async (type) => {
    if (city.trim() === '') {
      setError('Por favor, ingrese una ciudad válida.');
      return;
    }
    setLoading(true);
    try {
      const response = await axios.get(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=ff8498e051ef7fc5ef6172bb08af8941&units=metric`);
      const data = response.data.list.filter(item => {
        const date = new Date(item.dt * 1000);
        if (type === 'day') {
          return date.getHours() === 12; // Forecast for midday
        } else if (type === 'week') {
          return date.getHours() === 12 && date.getDay() === 0; // Forecast for midday on Sundays
        } else {
          return true; // All data for the month
        }
      });
      setForecast(data);
      setError('');
    } catch (error) {
      setForecast(null);
      setError('No se pudo encontrar la ciudad o hubo un problema con la solicitud.');
    }
    setLoading(false);
  };

  const getBackgroundColor = (temp) => {
    if (temp < 10) return '#a0c4ff';
    if (temp < 20) return '#bdb2ff';
    if (temp < 30) return '#ffc6ff';
    return '#ffadad';
  };

  return (
    <div className="app-background" style={{ backgroundImage: `url('https://radiofelicidad.mx/wp-content/uploads/2018/12/AdobeStock_84598705-1920x1280.jpeg')` }}>
      <Container className="app-container">
        <AppBar position="static" className="app-bar">
          <Toolbar>
            <Typography variant="h6" className="title">
              <marquee><FaCloudSun size={32} /> App de Clima Veronica</marquee>
            </Typography>
            <Button color="inherit" onClick={() => fetchForecast('month')}>Mes</Button>
            <Button color="inherit" onClick={() => fetchForecast('day')}>Día</Button>
            <Button color="inherit" onClick={() => fetchForecast('week')}>Semana</Button>
            <IconButton color="inherit" href="https://www.apple.com/app-store/"><FaAppStore /></IconButton>
            <IconButton color="inherit" href="https://www.sharethis.com/"><FaShareAlt /></IconButton>
            <IconButton color="inherit" href="https://www.google.com/search?q=settings"><FaCog /></IconButton>
            <IconButton color="inherit" href="https://www.google.com/search?q=info"><FaInfoCircle /></IconButton>
            <IconButton color="inherit" href="https://www.google.com/search?q=thermometer"><FaThermometerHalf /></IconButton>
            <IconButton color="inherit" href="https://www.google.com/search?q=satellite"><FaSatelliteDish /></IconButton>
          </Toolbar>
        </AppBar>
        <div className="search-container">
          <TextField
            label="Ciudad"
            variant="outlined"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="input"
            InputProps={{
              endAdornment: (
                <IconButton onClick={fetchWeather}>
                  <FaSearch />
                </IconButton>
              ),
            }}
          />
        </div>
        {loading && <CircularProgress className="spinner" style={{ color: '#d4a5ff' }} />}
        {error && <Alert severity="error" className="alert">{error}</Alert>}
        {weather && (
          <Card className="weather-card" style={{ backgroundColor: getBackgroundColor(weather.main.temp) }}>
            <CardContent>
              <Typography variant="h5" className="city-name">
                <FaCloudSun className="weather-icon" /> {weather.name}
              </Typography>
              <Typography variant="body1" className="weather-info">Temperatura: {weather.main.temp}°C</Typography>
              <Typography variant="body1" className="weather-info">Descripción: {weather.weather[0].description}</Typography>
              <Typography variant="body1" className="weather-info">Humedad: {weather.main.humidity}%</Typography>
              <Typography variant="body1" className="weather-info">Velocidad del Viento: {weather.wind.speed} m/s</Typography>
              <MapContainer center={[weather.coord.lat, weather.coord.lon]} zoom={13} style={{ height: "400px", width: "100%" }} className="map">
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <Marker position={[weather.coord.lat, weather.coord.lon]}>
                  <Popup>
                    {weather.name}: {weather.weather[0].description}, {weather.main.temp}°C
                  </Popup>
                </Marker>
              </MapContainer>
            </CardContent>
          </Card>
        )}
        {forecast && (
          <div className="forecast-container">
            {forecast.map((item, index) => (
              <Card key={index} className="forecast-card" style={{ backgroundColor: getBackgroundColor(item.main.temp) }}>
                <CardContent>
                  <Typography variant="body1" className="forecast-info">Fecha: {new Date(item.dt * 1000).toLocaleDateString()}</Typography>
                  <Typography variant="body1" className="forecast-info">Temperatura: {item.main.temp}°C</Typography>
                  <Typography variant="body1" className="forecast-info">Descripción: {item.weather[0].description}</Typography>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        <div className="world-map">
          <MapContainer center={[0, 0]} zoom={2} style={{ height: "400px", width: "100%", filter: 'brightness(1.2) saturate(1.5)' }} className="map">
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {/* Aquí puedes agregar marcadores para diferentes ciudades con su sensación térmica */}
          </MapContainer>
        </div>
        <div className="image-box">
          <a href="https://www.eltiempo.es/noticias" target="_blank" rel="noopener noreferrer">
            <img src="https://tvpacifico.mx/admin/images/noticias/226734-120607.png" alt="Nature" className="box-image" />
            <Typography variant="h4" className="news-title" style={{ textShadow: '2px 2px 4px #000000' }}>NOTICIAS</Typography>
          </a>
        </div>
      </Container>
    </div>
  );
};

export default App;

