import { useState } from 'react'

interface Props {
    onSearch: (city: string) => void
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function SearchBar({ onSearch }: Props) {
    const [city, setCity] = useState('')

    return (
        <div>
            <input
                className="input"
                type="text"
                placeholder="Enter city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
            />

            <button className="button" onClick={() => onSearch(city)}>
                Search
            </button>
        </div>
    )
}

export default SearchBar