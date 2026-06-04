// ==========================================
// Constants and State
// ==========================================
const API_KEY = "YOUR_API_KEY"; // Replace with your OpenWeatherMap API Key
const BASE_URL = "https://api.openweathermap.org/data/2.5";

let currentUnit = "metric"; // 'metric' for Celsius, 'imperial' for Fahrenheit
let currentCity = "";

// ==========================================
// DOM Elements
// ==========================================
const searchInput = document.getElementById("city-input");
const searchBtn = document.getElementById("search-btn");
const geoBtn = document.getElementById("geo-btn");
const errorMessage = document.getElementById("error-message");
const loadingIndicator = document.getElementById("loading");
const weatherDashboard = document.getElementById("weather-dashboard");

// Unit Toggle Elements
const celsiusRadio = document.getElementById("celsius");
const fahrenheitRadio = document.getElementById("fahrenheit");

// Current Weather Elements
const cityNameEl = document.getElementById("city-name");
const currentDateEl = document.getElementById("current-date");
const weatherIconEl = document.getElementById("weather-icon");
const currentTempEl = document.getElementById("current-temp");
const weatherConditionEl = document.getElementById("weather-condition");
const feelsLikeEl = document.getElementById("feels-like");

// Weather Detail Elements
const humidityEl = document.getElementById("humidity");
const windSpeedEl = document.getElementById("wind-speed");
const minMaxTempEl = document.getElementById("min-max-temp");
const sunriseTimeEl = document.getElementById("sunrise-time");
const sunsetTimeEl = document.getElementById("sunset-time");

// Forecast Elements
const forecastContainer = document.getElementById("forecast-container");

// ==========================================
// Initialization
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    // Initialize Lucide icons
    lucide.createIcons();

    // Load last searched city from localStorage
    const savedCity = localStorage.getItem("lastCity");
    if (savedCity) {
        getWeatherData(savedCity);
    }
});

// ==========================================
// Event Listeners
// ==========================================
searchBtn.addEventListener("click", () => {
    const city = searchInput.value.trim();
    if (city) getWeatherData(city);
});

searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        const city = searchInput.value.trim();
        if (city) getWeatherData(city);
    }
});

geoBtn.addEventListener("click", () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                getWeatherDataByCoords(latitude, longitude);
            },
            (error) => {
                showError("Unable to retrieve your location.");
            }
        );
    } else {
        showError("Geolocation is not supported by your browser.");
    }
});

// Unit Toggle Listeners
celsiusRadio.addEventListener("change", () => {
    if (currentUnit !== "metric") {
        currentUnit = "metric";
        if (currentCity) getWeatherData(currentCity);
    }
});

fahrenheitRadio.addEventListener("change", () => {
    if (currentUnit !== "imperial") {
        currentUnit = "imperial";
        if (currentCity) getWeatherData(currentCity);
    }
});

// ==========================================
// API Calls
// ==========================================
async function getWeatherData(city) {
    if (API_KEY === "YOUR_API_KEY") {
        return useMockData(city);
    }

    showLoading();
    hideError();
    weatherDashboard.classList.add("hidden");

    try {
        // Fetch Current Weather
        const weatherRes = await fetch(`${BASE_URL}/weather?q=${city}&units=${currentUnit}&appid=${API_KEY}`);
        if (!weatherRes.ok) throw new Error("City not found");
        const weatherData = await weatherRes.json();

        // Fetch Forecast
        const forecastRes = await fetch(`${BASE_URL}/forecast?q=${city}&units=${currentUnit}&appid=${API_KEY}`);
        const forecastData = await forecastRes.json();

        // Update State & UI
        currentCity = weatherData.name;
        localStorage.setItem("lastCity", currentCity);
        
        updateCurrentWeatherUI(weatherData);
        updateForecastUI(forecastData);
        updateBackgroundTheme(weatherData.weather[0].main);

        hideLoading();
        weatherDashboard.classList.remove("hidden");

    } catch (error) {
        hideLoading();
        showError(error.message === "City not found" ? "City not found. Please try again." : "Network error. Please try again.");
    }
}

async function getWeatherDataByCoords(lat, lon) {
    if (API_KEY === "YOUR_API_KEY") {
        return useMockData("Local Area");
    }

    showLoading();
    hideError();
    weatherDashboard.classList.add("hidden");

    try {
        const weatherRes = await fetch(`${BASE_URL}/weather?lat=${lat}&lon=${lon}&units=${currentUnit}&appid=${API_KEY}`);
        if (!weatherRes.ok) throw new Error("Location not found");
        const weatherData = await weatherRes.json();

        const forecastRes = await fetch(`${BASE_URL}/forecast?lat=${lat}&lon=${lon}&units=${currentUnit}&appid=${API_KEY}`);
        const forecastData = await forecastRes.json();

        currentCity = weatherData.name;
        localStorage.setItem("lastCity", currentCity);
        
        updateCurrentWeatherUI(weatherData);
        updateForecastUI(forecastData);
        updateBackgroundTheme(weatherData.weather[0].main);

        hideLoading();
        weatherDashboard.classList.remove("hidden");
    } catch (error) {
        hideLoading();
        showError("Failed to fetch weather for your location.");
    }
}

// ==========================================
// Mock Data Fallback
// ==========================================
function useMockData(cityName) {
    showLoading();
    hideError();
    weatherDashboard.classList.add("hidden");

    setTimeout(() => {
        const tempMultiplier = currentUnit === "imperial" ? 1.8 : 1;
        const tempOffset = currentUnit === "imperial" ? 32 : 0;
        const convertTemp = (temp) => (temp * tempMultiplier) + tempOffset;

        const mockWeatherData = {
            name: cityName,
            sys: { country: "Demo", sunrise: Date.now()/1000 - 3600*4, sunset: Date.now()/1000 + 3600*6 },
            weather: [{ main: "Clear", description: "clear sky", icon: "01d" }],
            main: { 
                temp: convertTemp(22), 
                feels_like: convertTemp(24), 
                humidity: 45, 
                temp_min: convertTemp(18), 
                temp_max: convertTemp(25) 
            },
            wind: { speed: currentUnit === "imperial" ? 10 : 4.5 },
            timezone: 0
        };

        const mockForecastData = { list: [] };
        const now = new Date();
        
        for(let i=1; i<=5; i++) {
            const forecastDate = new Date(now);
            forecastDate.setDate(forecastDate.getDate() + i);
            mockForecastData.list.push({
                dt: forecastDate.getTime() / 1000,
                dt_txt: forecastDate.toISOString().split('T')[0] + " 12:00:00",
                main: { temp: convertTemp(20 + i) },
                weather: [{ 
                    main: i % 2 === 0 ? "Clouds" : "Clear", 
                    icon: i % 2 === 0 ? "03d" : "01d" 
                }]
            });
        }

        currentCity = cityName;
        localStorage.setItem("lastCity", currentCity);
        
        updateCurrentWeatherUI(mockWeatherData);
        updateForecastUI(mockForecastData);
        updateBackgroundTheme(mockWeatherData.weather[0].main);

        hideLoading();
        weatherDashboard.classList.remove("hidden");
    }, 600); // Simulate network delay
}

// ==========================================
// UI Updaters
// ==========================================
function updateCurrentWeatherUI(data) {
    const tempSymbol = currentUnit === "metric" ? "°C" : "°F";
    const speedSymbol = currentUnit === "metric" ? "m/s" : "mph";

    cityNameEl.textContent = `${data.name}, ${data.sys.country}`;
    currentDateEl.textContent = formatDateTime(new Date());
    
    // Weather Icon
    const iconCode = data.weather[0].icon;
    weatherIconEl.src = `https://openweathermap.org/img/wn/${iconCode}@4x.png`;
    weatherIconEl.classList.remove("hidden");

    // Temperatures and Condition
    currentTempEl.textContent = `${Math.round(data.main.temp)}${tempSymbol}`;
    weatherConditionEl.textContent = data.weather[0].description;
    feelsLikeEl.textContent = `${Math.round(data.main.feels_like)}${tempSymbol}`;

    // Details
    humidityEl.textContent = `${data.main.humidity}%`;
    windSpeedEl.textContent = `${data.wind.speed} ${speedSymbol}`;
    minMaxTempEl.textContent = `${Math.round(data.main.temp_min)}${tempSymbol} / ${Math.round(data.main.temp_max)}${tempSymbol}`;
    
    sunriseTimeEl.textContent = formatTime(data.sys.sunrise, data.timezone);
    sunsetTimeEl.textContent = formatTime(data.sys.sunset, data.timezone);
}

function updateForecastUI(data) {
    forecastContainer.innerHTML = "";
    
    // Filter forecast data for 1 reading per day (e.g., at 12:00:00)
    const dailyData = data.list.filter(item => item.dt_txt.includes("12:00:00"));
    
    // If not enough 12:00:00 data (e.g. today is late), take the first 5 unique days
    let daysAdded = 0;
    const addedDates = new Set();
    const finalForecast = [];

    for (let item of data.list) {
        const date = new Date(item.dt * 1000).toDateString();
        if (!addedDates.has(date) && daysAdded < 5) {
            finalForecast.push(item);
            addedDates.add(date);
            daysAdded++;
        }
    }

    // Use filtered data to build HTML
    finalForecast.forEach(item => {
        const dateObj = new Date(item.dt * 1000);
        const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
        const tempSymbol = currentUnit === "metric" ? "°" : "°";
        const iconCode = item.weather[0].icon;

        const forecastItemHTML = `
            <div class="forecast-item">
                <span class="forecast-date">${dayName}</span>
                <img class="forecast-icon" src="https://openweathermap.org/img/wn/${iconCode}@2x.png" alt="icon">
                <span class="forecast-temp">${Math.round(item.main.temp)}${tempSymbol}</span>
                <span class="forecast-desc">${item.weather[0].main}</span>
            </div>
        `;
        forecastContainer.innerHTML += forecastItemHTML;
    });
}

// ==========================================
// Helpers
// ==========================================
function updateBackgroundTheme(condition) {
    const body = document.body;
    body.className = ''; // reset classes

    const lowerCondition = condition.toLowerCase();

    if (lowerCondition.includes("clear")) {
        body.classList.add("theme-clear");
    } else if (lowerCondition.includes("cloud")) {
        body.classList.add("theme-clouds");
    } else if (lowerCondition.includes("rain") || lowerCondition.includes("drizzle") || lowerCondition.includes("thunderstorm")) {
        body.classList.add("theme-rain");
    } else if (lowerCondition.includes("snow")) {
        body.classList.add("theme-snow");
    } else {
        body.classList.add("theme-default");
    }
}

function showLoading() {
    loadingIndicator.classList.remove("hidden");
}

function hideLoading() {
    loadingIndicator.classList.add("hidden");
}

function showError(msg) {
    document.getElementById("error-text").textContent = msg;
    errorMessage.classList.remove("hidden");
}

function hideError() {
    errorMessage.classList.add("hidden");
}

function formatDateTime(date) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return date.toLocaleDateString('en-US', options);
}

function formatTime(unixTimestamp, timezoneOffset) {
    // Calculate local time for the specific city using its timezone offset
    // The offset provided by API is in seconds
    const date = new Date((unixTimestamp + timezoneOffset) * 1000);
    // Use UTC methods to extract time because the timezone adjustment is already applied
    const hours = date.getUTCHours().toString().padStart(2, '0');
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}
