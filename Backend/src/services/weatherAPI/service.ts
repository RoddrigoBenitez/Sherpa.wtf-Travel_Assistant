class WeatherService {
    async getWeather(city: string) {
        const apiUrl = process.env.OPENWEATHER_API_URL;
        const apiKey = process.env.API_KEY;

        if (!apiUrl || !apiKey) {
            console.error("Faltan las variables de entorno OPENWEATHER_API_URL o API_KEY");
            return { error: "Error en la configuración del servidor." };
        }

        try {
            // obtener coordenadas de la ciudad
            const url = `${apiUrl}?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric&lang=es`;
            const response = await fetch(url);
            if (!response.ok) {
                return { error: `Error al obtener el clima: ${response.statusText}` };
            }

            const data = await response.json();
            console.log("data service:", data);

            // extrae coordenadas
            const { coord, name } = data;
            if (!coord || !coord.lat || !coord.lon) {
                return { error: "No se encontraron coordenadas para la ciudad." };
            }

            // obtiene el pronóstico de 5 días
            const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${coord.lat}&lon=${coord.lon}&appid=${apiKey}&units=metric&lang=es`;
            const forecastResponse = await fetch(forecastUrl);
            if (!forecastResponse.ok) {
                return { error: `Error al obtener el pronóstico: ${forecastResponse.statusText}` };
            }

            const forecastData = await forecastResponse.json();

            // Procesar la información (Agrupar por día)
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