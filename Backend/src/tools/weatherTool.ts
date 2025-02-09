import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { weatherService } from "../services/weatherAPI/service";

export const weatherTool = tool(
  async ({ city }: { city: string }) => {
    const weatherData = await weatherService.getWeather(city);
    if (weatherData.error) {
      throw new Error(weatherData.error);
    }

    // formatting the forecast for the next few days
    let forecastString = "\nPronóstico extendido:\n";
    for (const [date, info] of Object.entries(weatherData.pronostico!)) {
      forecastString += `- ${date}: ${info.temperatura}°C, ${info.descripcion}, Humedad: ${info.humedad}%, Viento: ${info.viento} km/h\n`;
    }

    return `Ciudad: ${weatherData.ciudad}
     Temperatura: ${weatherData.temperatura}°C
     Clima: ${weatherData.descripcion}
     Humedad: ${weatherData.humedad}%
     Viento: ${weatherData.viento} km/h
     ${forecastString}`;
  },
  {
    name: "get_weather",
    description: "Consulta el clima actual y el pronóstico extendido de una ciudad.",
    schema: z.object({
      city: z.string().describe("Nombre de la ciudad para consultar el clima"),
    }),
  }
);