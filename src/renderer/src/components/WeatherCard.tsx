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
function WeatherCard({ weather }: { weather: WeatherData }) {
    return (
        <div className="weather-box">
            <h2 className="city">{weather.name}</h2>
            <h3 className="temp">{weather.main.temp}°C</h3>
            <p className="description">{weather.weather[0].description}</p>
        </div>
    )
}

export default WeatherCard