// ===================================
// CLIMATE 365 WEATHER APP
// ===================================

// HTML ELEMENTS
const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const locationBtn = document.getElementById("locationBtn");

const cityElement = document.getElementById("city");
const temperatureElement = document.getElementById("temperature");
const conditionElement = document.getElementById("condition");
const humidityElement = document.getElementById("humidity");
const windElement = document.getElementById("wind");
const feelsLikeElement = document.getElementById("feelsLike");
const rainElement = document.getElementById("rain");
const forecastContainer = document.getElementById("forecastContainer");
const suggestionElement = document.getElementById("suggestion");

const normalMapBtn = document.getElementById("normalMapBtn");
const satelliteMapBtn = document.getElementById("satelliteMapBtn");
const rainRadarBtn = document.getElementById("rainRadarBtn");
const tempZoneBtn = document.getElementById("tempZoneBtn");

const defaultLat = 17.6868;
const defaultLon = 83.2185;

let locationMarker = null;
let radarLayer = null;
let temperatureCircle = null;
let selectedWeatherMarker = null;


// ===================================
// WEATHER DESCRIPTION
// ===================================

function getWeatherDescription(code) {
    const weatherCodes = {
        0: "☀️ Clear Sky",
        1: "🌤️ Mainly Clear",
        2: "⛅ Partly Cloudy",
        3: "☁️ Overcast",
        45: "🌫️ Fog",
        48: "🌫️ Fog",
        51: "🌦️ Light Drizzle",
        53: "🌦️ Drizzle",
        55: "🌧️ Heavy Drizzle",
        61: "🌧️ Light Rain",
        63: "🌧️ Rain",
        65: "🌧️ Heavy Rain",
        71: "🌨️ Light Snow",
        73: "🌨️ Snow",
        75: "❄️ Heavy Snow",
        80: "🌦️ Rain Showers",
        81: "🌧️ Rain Showers",
        82: "⛈️ Heavy Rain Showers",
        95: "⛈️ Thunderstorm",
        96: "⛈️ Thunderstorm",
        99: "⛈️ Severe Thunderstorm"
    };

    return weatherCodes[code] || "🌤️ Unknown Weather";
}


// ===================================
// MAP SETUP
// ===================================

const map = L.map("weatherMap", {
    center: [defaultLat, defaultLon],
    zoom: 7,
    zoomControl: true
});

const normalLayer = L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
        attribution: "&copy; OpenStreetMap contributors",
        maxZoom: 19
    }
);

const satelliteLayer = L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    {
        attribution: "Tiles &copy; Esri",
        maxZoom: 19
    }
);

normalLayer.addTo(map);


// ===================================
// NORMAL MAP BUTTON
// ===================================

if (normalMapBtn) {
    normalMapBtn.addEventListener("click", function () {
        if (map.hasLayer(satelliteLayer)) {
            map.removeLayer(satelliteLayer);
        }

        if (!map.hasLayer(normalLayer)) {
            normalLayer.addTo(map);
        }
    });
}


// ===================================
// SATELLITE BUTTON
// ===================================

if (satelliteMapBtn) {
    satelliteMapBtn.addEventListener("click", function () {
        if (map.hasLayer(normalLayer)) {
            map.removeLayer(normalLayer);
        }

        if (!map.hasLayer(satelliteLayer)) {
            satelliteLayer.addTo(map);
        }
    });
}


// ===================================
// GET WEATHER FROM BACKEND
// ===================================

async function getWeather(lat, lon, locationName = "Selected Location") {
    try {
        if (cityElement) {
            cityElement.textContent = "Loading location...";
        }

        const response = await fetch(
            `/api/weather?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`
        );

        if (!response.ok) {
            throw new Error("Weather API request failed");
        }

        const data = await response.json();

        if (!data.current || !data.daily) {
            throw new Error("Weather data is incomplete");
        }

        displayWeather(data, locationName);

        return data;

    } catch (error) {
        console.error("Weather error:", error);

        if (cityElement) {
            cityElement.textContent = locationName;
        }

        if (conditionElement) {
            conditionElement.textContent = "Unable to load weather";
        }

        if (suggestionElement) {
            suggestionElement.textContent =
                "Weather data is currently unavailable.";
        }

        return null;
    }
}


// ===================================
// DISPLAY WEATHER
// ===================================

function displayWeather(data, locationName) {
    const current = data.current;

    if (cityElement) {
        cityElement.textContent = locationName;
    }

    if (temperatureElement) {
        temperatureElement.textContent =
            Math.round(current.temperature_2m);
    }

    if (conditionElement) {
        conditionElement.textContent =
            getWeatherDescription(current.weather_code);
    }

    if (humidityElement) {
        humidityElement.textContent =
            `${current.relative_humidity_2m}%`;
    }

    if (windElement) {
        windElement.textContent =
            `${current.wind_speed_10m} km/h`;
    }

    if (feelsLikeElement) {
        feelsLikeElement.textContent =
            `${Math.round(current.apparent_temperature)}°C`;
    }

    if (rainElement) {
        rainElement.textContent =
            `${current.precipitation} mm`;
    }

    displayForecast(data.daily);
    createSuggestion(current);
}


// ===================================
// 7 DAY FORECAST
// ===================================

function displayForecast(daily) {
    if (!forecastContainer || !daily || !daily.time) {
        return;
    }

    forecastContainer.innerHTML = "";

    daily.time.forEach((dateText, i) => {
        const card = document.createElement("div");

        card.className = "forecast-card";

        const date = new Date(`${dateText}T12:00:00`);

        const day = date.toLocaleDateString("en-US", {
            weekday: "short"
        });

        card.innerHTML = `
            <div class="date">${day}</div>

            <div>
                ${getWeatherDescription(daily.weather_code[i])}
            </div>

            <div class="temp">
                ${Math.round(daily.temperature_2m_max[i])}° /
                ${Math.round(daily.temperature_2m_min[i])}°
            </div>
        `;

        forecastContainer.appendChild(card);
    });
}


// ===================================
// WEATHER SUGGESTION
// ===================================

function createSuggestion(current) {
    if (!suggestionElement) {
        return;
    }

    const code = current.weather_code;
    const rain = current.precipitation;
    const temp = current.temperature_2m;

    let message;

    if (code >= 95) {
        message =
            "⛈️ Thunderstorm conditions are reported. Check local alerts and avoid exposed outdoor areas.";

    } else if (rain > 0 || (code >= 51 && code <= 82)) {
        message =
            "🌧️ Rain or showers are reported. Carry an umbrella if going outside.";

    } else if (temp >= 35) {
        message =
            "🌡️ It is hot. Drink water regularly and limit prolonged exposure to the sun.";

    } else if (code === 0 || code === 1) {
        message =
            "☀️ Clear or mostly clear conditions. Check the forecast before outdoor activities.";

    } else {
        message =
            "🌤️ Check the current conditions and forecast before planning outdoor activities.";
    }

    suggestionElement.textContent = message;
}


// ===================================
// SHOW LOCATION ON MAP
// ===================================

function showMapLocation(lat, lon, name = "Selected Location") {
    map.setView([lat, lon], 8);

    if (locationMarker) {
        map.removeLayer(locationMarker);
    }

    locationMarker = L.marker([lat, lon])
        .addTo(map)
        .bindPopup(`📍 ${name}`)
        .openPopup();
}


// ===================================
// MY LOCATION BUTTON
// ===================================

if (locationBtn) {
    locationBtn.addEventListener("click", function () {

        if (!navigator.geolocation) {
            alert("Your browser does not support location.");
            return;
        }

        locationBtn.disabled = true;
        locationBtn.textContent = "📍 Locating...";

        navigator.geolocation.getCurrentPosition(

            async function (position) {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;

                showMapLocation(latitude, longitude, "My Location");

                await getWeather(
                    latitude,
                    longitude,
                    "My Location"
                );

                locationBtn.disabled = false;
                locationBtn.textContent = "📍 My Location";
            },

            function (error) {
                console.error("Location error:", error);

                if (error.code === 1) {
                    alert("Location permission denied. Allow location access in your browser.");
                } else if (error.code === 2) {
                    alert("Location unavailable. Check your device location settings.");
                } else if (error.code === 3) {
                    alert("Location request timed out. Please try again.");
                } else {
                    alert("Unable to find your location.");
                }

                locationBtn.disabled = false;
                locationBtn.textContent = "📍 My Location";
            },

            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 0
            }
        );
    });
}


// ===================================
// CITY SEARCH
// ===================================

async function searchCity(city) {
    if (!city) {
        alert("Please enter a city name.");
        return;
    }

    try {
        if (searchBtn) {
            searchBtn.disabled = true;
            searchBtn.textContent = "Searching...";
        }

        const response = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
        );

        if (!response.ok) {
            throw new Error("City search request failed");
        }

        const data = await response.json();

        if (!data.results || data.results.length === 0) {
            alert("City not found.");
            return;
        }

        const place = data.results[0];

        const name = `${place.name}, ${place.country}`;

        showMapLocation(
            place.latitude,
            place.longitude,
            name
        );

        await getWeather(
            place.latitude,
            place.longitude,
            name
        );

    } catch (error) {
        console.error("City search error:", error);
        alert("Unable to search city. Please try again.");

    } finally {
        if (searchBtn) {
            searchBtn.disabled = false;
            searchBtn.textContent = "Search";
        }
    }
}

if (searchBtn) {
    searchBtn.addEventListener("click", function () {
        searchCity(cityInput?.value.trim());
    });
}

if (cityInput) {
    cityInput.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            searchCity(cityInput.value.trim());
        }
    });
}


// ===================================
// CLICK MAP TO GET WEATHER
// ===================================

map.on("click", async function (event) {
    const lat = event.latlng.lat;
    const lon = event.latlng.lng;

    const data = await getWeather(
        lat,
        lon,
        "Selected Location"
    );

    if (!data) {
        return;
    }

    const current = data.current;

    if (selectedWeatherMarker) {
        map.removeLayer(selectedWeatherMarker);
    }

    selectedWeatherMarker = L.marker([lat, lon])
        .addTo(map);

    selectedWeatherMarker.bindPopup(`
        <div style="min-width:180px">
            <h3>🌦️ Weather Details</h3>

            <p><b>🌡️ Temperature:</b> ${current.temperature_2m}°C</p>

            <p><b>🌧️ Rain:</b> ${current.precipitation} mm</p>

            <p><b>💧 Humidity:</b> ${current.relative_humidity_2m}%</p>

            <p><b>🌬️ Wind:</b> ${current.wind_speed_10m} km/h</p>

            <p><b>Condition:</b> ${getWeatherDescription(current.weather_code)}</p>

            <p><b>Latitude:</b> ${lat.toFixed(3)}</p>

            <p><b>Longitude:</b> ${lon.toFixed(3)}</p>
        </div>
    `).openPopup();
});


// ===================================
// RAIN RADAR BUTTON
// ===================================

async function toggleRadar() {

    if (radarLayer && map.hasLayer(radarLayer)) {
        map.removeLayer(radarLayer);
        radarLayer = null;

        if (rainRadarBtn) {
            rainRadarBtn.textContent = "🌧️ Rain Radar";
        }

        return;
    }

    try {
        if (rainRadarBtn) {
            rainRadarBtn.textContent = "Loading Radar...";
        }

        const response = await fetch(
            "https://api.rainviewer.com/public/weather-maps.json"
        );

        if (!response.ok) {
            throw new Error("Radar service unavailable");
        }

        const data = await response.json();

        const frames = data.radar?.past;

        if (!frames || frames.length === 0) {
            throw new Error("No radar frames available");
        }

        const frame = frames[frames.length - 1];

        const tileUrl =
            `https://tilecache.rainviewer.com${frame.path}/256/{z}/{x}/{y}/2/1_1.png`;

        radarLayer = L.tileLayer(tileUrl, {
            opacity: 0.65,
            maxZoom: 12,
            attribution: "Radar imagery: RainViewer"
        }).addTo(map);

        if (rainRadarBtn) {
            rainRadarBtn.textContent = "❌ Hide Radar";
        }

    } catch (error) {
        console.error("Radar error:", error);

        alert("Radar data could not be loaded. Please try again later.");

        if (rainRadarBtn) {
            rainRadarBtn.textContent = "🌧️ Rain Radar";
        }
    }
}

if (rainRadarBtn) {
    rainRadarBtn.addEventListener("click", toggleRadar);
}


// ===================================
// TEMPERATURE ZONES
// ===================================

function getTemperatureColor(temp) {
    if (temp >= 38) return "#dc2626";
    if (temp >= 30) return "#f97316";
    return "#22c55e";
}

async function showTemperatureZone(lat, lon) {

    const data = await getWeather(
        lat,
        lon,
        "Selected Location"
    );

    if (!data) {
        return;
    }

    const temp = data.current.temperature_2m;
    const color = getTemperatureColor(temp);

    if (temperatureCircle) {
        map.removeLayer(temperatureCircle);
    }

    temperatureCircle = L.circle([lat, lon], {
        radius: 15000,
        color: color,
        fillColor: color,
        fillOpacity: 0.35,
        weight: 2
    }).addTo(map);

    temperatureCircle.bindPopup(`
        <h3>🌡️ Temperature Zone</h3>
        <p>Temperature: ${temp}°C</p>
        <p>Condition: ${getWeatherDescription(data.current.weather_code)}</p>
    `).openPopup();
}

if (tempZoneBtn) {
    tempZoneBtn.addEventListener("click", function () {
        const center = map.getCenter();

        showTemperatureZone(
            center.lat,
            center.lng
        );
    });
}


// ===================================
// START WEBSITE
// ===================================

showMapLocation(
    defaultLat,
    defaultLon,
    "Visakhapatnam"
);

getWeather(
    defaultLat,
    defaultLon,
    "Visakhapatnam, India"
);