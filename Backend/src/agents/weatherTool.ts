import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { weatherService } from "../services/weatherAPI/service";

export const weatherTool = tool(
  async ({ city }: { city: string }) => {
    const weatherData = await weatherService.getWeather(city);
    if (weatherData.error) {
      throw new Error(weatherData.error);
    }
    return `Ciudad: ${weatherData.ciudad}
     Temperatura: ${weatherData.temperatura}°C
     Clima: ${weatherData.descripcion}
     Humedad: ${weatherData.humedad}%
     Viento: ${weatherData.viento} km/h`;
  },
  {
    name: "get_weather",
    description: "Consulta el clima de una ciudad específica.",
    schema: z.object({
      city: z.string().describe("Nombre de la ciudad para consultar el clima"),
    }),
  }
)