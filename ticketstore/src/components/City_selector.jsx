import { useState } from "react";

export default function CitySelector({ city, setCity, onSelect }) {
    const [allCities, setAllCities] = useState([]);
    const [isOpen, setOpen] = useState(false);

    const citiesP = async () => {
        if (!city.trim()) return;

        try {
            const res = await fetch("http://localhost:5000/city", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ city })
            });

            if (!res.ok) throw new Error("Помилка завантаження");

            const data = await res.json();
            setAllCities(data);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="prof">
            Місто
            <input
                value={city}
                onChange={e => setCity(e.target.value)}
                onFocus={() => {
                    citiesP();
                    setOpen(true);
                }}
                onBlur={() => setOpen(false)}
            />

            {isOpen && allCities.length > 0 && (
                <div className="dropdown-item">
                    {allCities.map(option => (
                        <div
                            key={option.Ref}
                            onMouseDown={() => {
                                onSelect(option);
                                setOpen(false);
                            }}
                        >
                            {option.Description}, {option.AreaDescription} область
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
