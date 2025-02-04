class WeatherService{
    async getWeather(city: string) {
        const apiUrl = process.env.OPENWEATHER_API_URL;
        const apiKey = process.env.API_KEY;
    
        if (!apiUrl || !apiKey) {
            console.error("Faltan las variables de entorno OPENWEATHER_API_URL o API_KEY");
            return { error: "Error en la configuración del servidor." };
        }
    
        const url = `${apiUrl}?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric&lang=es`;
    
        try {
            const response = await fetch(url);
            if (!response.ok) {
                return { error: `Error al obtener el clima: ${response.statusText}` };
            }
    
            const data = await response.json();
            console.log("data service:", data)
            return {
                ciudad: data.name,
                temperatura: data.main.temp,
                descripcion: data.weather[0].description,
                humedad: data.main.humidity,
                viento: data.wind.speed
            };
        } catch (error) {
            console.error("Error al obtener el clima:", error);
            return { error: "No se pudo obtener el clima, verifica la ciudad." };
        }
    };
}

export const weatherService = new WeatherService()