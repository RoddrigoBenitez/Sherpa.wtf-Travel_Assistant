class WeatherService {
    async getWeather(city: string) {
        const apiUrl = process.env.OPENWEATHER_API_URL;
        const apiKey = process.env.API_KEY;

        if (!apiUrl || !apiKey) {
            console.error("Faltan las variables de entorno OPENWEATHER_API_URL o API_KEY");
            return { error: "Error en la configuración del servidor." };
        }

        try {
            // obtain city coordinates
            const url = `${apiUrl}?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric&lang=es`;
            const response = await fetch(url);
            if (!response.ok) {
                return { error: `Error al obtener el clima: ${response.statusText}` };
            }

            const data = await response.json();

            // extracts coordinates
            const { coord, name } = data;
            if (!coord || !coord.lat || !coord.lon) {
                return { error: "No se encontraron coordenadas para la ciudad." };
            }

            // get the 5-day forecast
            const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${coord.lat}&lon=${coord.lon}&appid=${apiKey}&units=metric&lang=es`;
            const forecastResponse = await fetch(forecastUrl);
            if (!forecastResponse.ok) {
                return { error: `Error al obtener el pronóstico: ${forecastResponse.statusText}` };
            }

            const forecastData = await forecastResponse.json();

            // Process information (Group by day)
            const forecastByDay: Record<string, any> = {};
            forecastData.list.forEach((item: any) => {
                const date = item.dt_txt.split(" ")[0]; // tomar solo la fecha (YYYY-MM-DD)
                if (!forecastByDay[date]) {
                    forecastByDay[date] = {
                        temperatura: item.main.temp,
                        descripcion: item.weather[0].description,
                        humedad: item.main.humidity,
                        viento: item.wind.speed
                    };
                }
            });

            return {
                ciudad: name,
                temperatura: data.main.temp,
                descripcion: data.weather[0].description,
                humedad: data.main.humidity,
                viento: data.wind.speed,
                pronostico: forecastByDay
            };
        } catch (error) {
            console.error("Error al obtener el clima:", error);
            return { error: "No se pudo obtener el clima, verifica la ciudad." };
        }
    }
}

export const weatherService = new WeatherService();