# SkyCast - Modern Weather Dashboard

A beautiful, responsive, and feature-rich weather dashboard built with HTML, CSS, and JavaScript. 
This project was designed to showcase modern UI/UX practices such as glassmorphism, dynamic theme backgrounds, and micro-animations, while functioning as a complete weather application powered by the OpenWeatherMap API.

## Features

- **Real-Time Weather Data**: Get current weather details including temperature, condition, humidity, wind speed, and feels-like temperature.
- **Dynamic Theming**: The background and color palette change automatically based on the current weather condition (e.g., Clear, Rain, Snow, Clouds).
- **Responsive Design**: Fully responsive layout that looks great on mobile, tablet, and desktop devices.
- **Geolocation Support**: Instantly get the weather for your current location using the Geolocation API.
- **5-Day Forecast**: View a streamlined 5-day forecast.
- **Unit Toggle**: Easily switch between Celsius (°C) and Fahrenheit (°F).
- **Local Storage**: Automatically remembers the last city you searched for on your next visit.
- **Error Handling**: Graceful error handling for network issues and invalid city names.

## Screenshots

*(Add screenshots here after deploying)*

## Technologies Used

- **HTML5**: Semantic markup.
- **CSS3**: Custom variables, Flexbox, Grid, Glassmorphism, animations.
- **JavaScript (ES6+)**: Async/Await, Fetch API, DOM Manipulation.
- **Lucide Icons**: Beautiful, open-source icons.
- **OpenWeatherMap API**: Current Weather and 5-Day Forecast APIs.

## API Setup Instructions

To run this project locally, you need an API key from OpenWeatherMap.

1. Go to [OpenWeatherMap](https://openweathermap.org/) and create a free account.
2. Navigate to your account dashboard and generate a new API Key.
3. Open `script.js` in this project's directory.
4. Replace the placeholder on line 4 with your actual API key:
   ```javascript
   const API_KEY = "YOUR_API_KEY"; // Replace "YOUR_API_KEY" with your actual key
   ```

## How to Run Locally

Since this project uses Vanilla HTML/CSS/JS without external build tools or bundlers, it's very simple to run.

1. Clone or download this repository to your local machine.
2. Open the project folder.
3. Use a local development server like the "Live Server" extension in VS Code.
   - Alternatively, you can simply open the `index.html` file in your web browser. However, using a local server is recommended to prevent any potential CORS issues with the API.

## Deployment Steps

This project is completely static, making it extremely easy to host on platforms like GitHub Pages, Netlify, or Vercel.

### Option 1: GitHub Pages
1. Push your code to a new GitHub repository.
2. Go to the repository **Settings**.
3. Scroll down to the **Pages** section.
4. Under "Build and deployment", select the `main` branch and `/root` folder.
5. Click **Save**. Your site will be published at `https://yourusername.github.io/your-repo-name`.

### Option 2: Netlify / Vercel
1. Create a free account on [Netlify](https://www.netlify.com/) or [Vercel](https://vercel.com/).
2. Click "Add New Site" or "New Project".
3. Import your GitHub repository.
4. Leave the build settings blank (no build command or output directory is needed for static HTML).
5. Deploy the site.

## Future Enhancements
- Add more granular weather metrics (UV Index, Air Quality).
- Implement interactive weather maps.
- Implement an autocomplete feature for the city search box.

---

*This project was developed as a student portfolio piece showcasing modern front-end capabilities.*
