import { useEffect, useState } from "react";
import '../assets/styles/App.css';
import logo from '../assets/img/mlh-prep.png';
import ErrorComponent from "./Error";
import ResultsComponent from "./Results";
import SearchComponent from "./Search";
import RequiredItems from "./RequiredItems";
import Map from "./Map";
import About from "./About";
import Footer from "./Footer";
// Imports for changing the browser icon dynamically
import Sunny from '../assets/icons/sun.png'
import Rain from '../assets/icons/rain.png'
import Clouds from '../assets/icons/clouds.png'
import ThunderStorm from '../assets/icons/thunderstorm.png'
import Tornado from '../assets/icons/tornado.png'
import SandStorm from '../assets/icons/sand_storm.png'
import Sand from '../assets/icons/sand.png'
import Mist from '../assets/icons/mist.png'
import Haze from '../assets/icons/haze.png'
import Drizzle from '../assets/icons/drizzle.png'
import Snowy from '../assets/icons/snowy.png'
import Smoke from '../assets/icons/smoke.png'
import Logo from '../assets/icons/logo.png'

export default function App() {
  const [error, setError] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [city, setCity] = useState("New York City")
  const [coords, setCoords] = useState({ lng: -70.9, lat: 42.35, center: false })
  const [results, setResults] = useState(null);
  const [background, setBackground] = useState("")
  const [visible, setVisible] = useState(false);

  function toggleVisibility() {
    setVisible(!visible);
  };

  // Fetch data based on geolocation
  function getUserLocation() {
    setIsLoaded(false);

    // Use Geolocation API to locate user coordinates
    const geolocateUser = new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(function (pos) {
        let lat = pos.coords.latitude
        let lon = pos.coords.longitude
        resolve({ lat, lon });
      }, error)
    })

    // Use coordinates to fetch weather
    geolocateUser.then(res => {
      fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${res.lat}&lon=${res.lon}&units=metric&appid=${process.env.REACT_APP_APIKEY}`)
        .then(res => res.json())
        .then((result) => {
          setCoords({ lat: result.coord.lat, lng: result.coord.lon, center: true })
          setIsLoaded(true)
          setCity(result.name)
          setResults(result)
        },
          (error) => {
            setIsLoaded(true)
            setError(error)
          })
    })
  }

  // Fetch data based on user input
  useEffect(() => { // weather
    const fetchData = setTimeout(() => { // fetch data after user stops typing 
      console.log("fetch")
      fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${process.env.REACT_APP_APIKEY}`)
        .then(res => res.json())
        .then(
          (result) => {
            if (result['cod'] !== 200) {
              setIsLoaded(false)
            } else {
              setCoords({ lat: result.coord.lat, lng: result.coord.lon, center: true })
              setIsLoaded(true);
              setResults(result);
              setBackground(result.weather[0].main)
            }
          },
          (error) => {
            setIsLoaded(true);
            setError(error);
          }
        )
    }, 1000) // 1 second therhold 

    return () => clearTimeout(fetchData)
  }, [city])


  // Change browser icon drnamically
  useEffect(() => {  
    const faviconUpdate = async () => {
      const favicon = document.getElementById("favicon");
      if (results) {
        switch(results.weather[0].main) {
          case 'Rain':
            favicon.href = Rain;
            break;
          case 'Snow': 
            favicon.href = Snowy;
            break;
          case 'Clear':
            favicon.href = Sunny;
            break;
          case 'Clouds':
            favicon.href = Clouds;
            break;
          case 'Tornado':
            favicon.href = Tornado;
            break;
          case 'Drizzle':
            favicon.href = Drizzle;
            break;
          case 'Thunderstorm':
            favicon.href = ThunderStorm;
            break;
          case 'Squall':
          case 'Ash':
          case 'Dust':
            favicon.href = SandStorm;
            break;
          case 'Sand':
            favicon.href = Sand;
            break;
          case 'Haze':
            favicon.href = Haze;
            break;
          case 'Smoke':
            favicon.href = Smoke;
            break;
          case 'Mist':
          case 'Fog':
            favicon.href = Mist;
            break;
          default:
            favicon.href = Logo;
            break;
        }
      } 
    };

    faviconUpdate();  
  }, [results]);

  if (error) {
    return <ErrorComponent error={error} />;
  } else {
    return (
      <>
        <div className="page-container">
          <div className={(isLoaded && results) ? background : undefined}>
            <img className="logo" src={logo} alt="MLH Prep Logo"></img>
            <h2 className="app-header">Enter a city below 👇</h2>
            <SearchComponent city={city} changeCity={setCity} getUserLocation={getUserLocation} />
            <div className="card-container">
              <ResultsComponent isLoaded={isLoaded} results={results} />
              {isLoaded && results && <RequiredItems weatherKind={results.weather[0].main} />}
            </div>
            <Map setIsLoaded={setIsLoaded} setResults={setResults} setError={setError} coords={coords} setCoords={setCoords} setBackground={setBackground} />
            <button id="btn-about" onClick={toggleVisibility}>About this project</button>
            <About
              visible={visible}
              toggleVisibility={toggleVisibility}
            />
            <Footer />
          </div>
        </div>
      </>
    )
  }
}