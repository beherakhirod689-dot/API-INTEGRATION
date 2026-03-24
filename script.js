// NOTE: Replace 'YOUR_API_KEY' below with your actual OpenWeatherMap API key (string, in quotes)
const apiKey = 'b0dab9c5880820a689e15a487d6001e5';

/**
 * Fetches weather data for the specified city from OpenWeatherMap API.
 * @param {string} city - City name (you can add ',country_code' for accuracy).
 * @returns {Promise<object>} - Parsed weather data or error object.
 */
async function fetchWeather(city) {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'API Error');
    return data;
  } catch (error) {
    throw error;
  }
}

/**
 * Updates the dashboard UI with weather info or error.
 * Also changes background according to the main weather type.
 * @param {object|null} data - Weather data from the API.
 * @param {string|null} error - Error message to display (if any).
 */
function updateUI(data, error = null) {
  const resultDiv = document.getElementById('weatherResult');
  const errorDiv = document.getElementById('errorMsg');
  const statusDiv = document.getElementById('statusMsg');

  statusDiv.classList.add('hidden');
  statusDiv.textContent = '';

  if (error) {
    resultDiv.innerHTML = '';
    errorDiv.textContent = error;
    setDynamicBackground('Default');
    return;
  }
  errorDiv.textContent = '';
  if (!data) {
    resultDiv.innerHTML = '';
    setDynamicBackground('Default');
    return;
  }
  const { name, sys, weather, main, wind } = data;
  const mainWeather = weather[0].main;
  const iconCode = weather[0].icon;
  const localTime = new Date((data.dt + data.timezone) * 1000).toUTCString().slice(17, 22);

  resultDiv.innerHTML = `
    <div class="rounded-xl border border-slate-200 bg-white/70 p-5 shadow-sm">
      <div class="flex items-center justify-between gap-3 mb-4">
        <div class="text-left">
          <div class="text-xl font-semibold text-slate-900">${name}, ${sys.country}</div>
          <div class="text-xs text-slate-500">Local time: ${localTime}</div>
        </div>
        <img
          src="https://openweathermap.org/img/wn/${iconCode}@2x.png"
          alt="${weather[0].description}"
          class="w-16 h-16"
        />
      </div>
      <div class="text-5xl font-bold text-slate-900 mb-2">${Math.round(main.temp)}°C</div>
      <div class="capitalize text-slate-600 mb-4">${weather[0].description}</div>
      <div class="grid grid-cols-2 gap-3 text-sm">
        <div class="rounded-lg bg-blue-50 border border-blue-100 p-3 text-left">
          <div class="text-slate-500">Feels Like</div>
          <div class="font-semibold text-slate-800">${Math.round(main.feels_like)}°C</div>
        </div>
        <div class="rounded-lg bg-blue-50 border border-blue-100 p-3 text-left">
          <div class="text-slate-500">Humidity</div>
          <div class="font-semibold text-slate-800">${main.humidity}%</div>
        </div>
        <div class="rounded-lg bg-blue-50 border border-blue-100 p-3 text-left">
          <div class="text-slate-500">Wind</div>
          <div class="font-semibold text-slate-800">${wind.speed} m/s</div>
        </div>
        <div class="rounded-lg bg-blue-50 border border-blue-100 p-3 text-left">
          <div class="text-slate-500">Pressure</div>
          <div class="font-semibold text-slate-800">${main.pressure} hPa</div>
        </div>
      </div>
    </div>
  `;
  setDynamicBackground(mainWeather);
}

/**
 * Changes the background based on weather type.
 * @param {string} weatherType
 */
function setDynamicBackground(weatherType) {
  const body = document.getElementById('mainBg');
  switch (weatherType) {
    case 'Rain':
      body.className = 'min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-400 via-blue-400 to-blue-900 transition-all duration-500';
      break;
    case 'Clear':
      body.className = 'min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-300 via-blue-200 to-blue-500 transition-all duration-500';
      break;
    case 'Clouds':
      body.className = 'min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-200 via-gray-400 to-gray-600 transition-all duration-500';
      break;
    case 'Snow':
      body.className = 'min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-blue-300 transition-all duration-500';
      break;
    case 'Mist':
    case 'Fog':
      body.className = 'min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-300 via-gray-200 to-gray-500 transition-all duration-500';
      break;
    case 'Thunderstorm':
      body.className = 'min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-gray-700 to-yellow-100 transition-all duration-500';
      break;
    default:
      body.className = 'min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-blue-300 transition-all duration-500';
  }
}

// MAIN LOGIC - handle form submit, modularity and error handling
// --------------------------------------------------------------

document.getElementById('weatherForm').addEventListener('submit', async function (e) {
  e.preventDefault();
  const city = document.getElementById('cityInput').value.trim();
  const statusDiv = document.getElementById('statusMsg');

  if (!city) return updateUI(null, 'Please enter a city name.');
  updateUI(null); // Clear previous data
  statusDiv.textContent = 'Fetching latest weather...';
  statusDiv.classList.remove('hidden');

  try {
    const data = await fetchWeather(city);
    updateUI(data, null);
  } catch (err) {
    updateUI(null, err.message || 'An error occurred while fetching weather.');
  } finally {
    statusDiv.classList.add('hidden');
  }
});
