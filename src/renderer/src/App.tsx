import { useState } from 'react'
import axios from 'axios'
import './App.css'
import SearchBar from './components/SearchBar'
import WeatherCard from './components/WeatherCard'

interface WeatherData {
  name: string
  main: {
    temp: number
  }
  weather: {
    description: string
  }[]
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function App() {
  const [weather, setWeather] = useState<WeatherData | null>(null)

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const getWeather = async (city: string) => {
    console.log('City:', city)
    if (!city) return

    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=194c1918ed6e9b604211d203114bc8e8`
      )
      setWeather(response.data)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.log(error.response?.data)
      alert(error.response?.data?.message || 'Error fetching data')
    }
  }

  return (
    <div className="container">
      <h1 className="title">MY Weather</h1>

      {/* 🔍 Search Component */}
      <SearchBar onSearch={getWeather} />

      {/* 🌤 Weather Display Component */}
      {weather && <WeatherCard weather={weather} />}
    </div>
  )
}

export default App