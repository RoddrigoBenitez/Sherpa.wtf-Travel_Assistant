import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { flightService } from "../services/flightAPI/service";

export const flightTool = tool(
  async ({ origin, maxPrice }: { origin: string; maxPrice?: string }) => {
    const flightData = await flightService.searchFlightDestinations(origin, maxPrice);

    if (flightData.error) {
      console.error("Error en flightTool:", flightData.error);
      throw new Error(flightData.error || "No se encontraron ofertas de vuelos.");
    }


    let result = `Ofertas de vuelos desde ${origin}:\n`;

    if (flightData.data && Array.isArray(flightData.data)) {
      flightData.data.forEach((destination: any, index: number) => {
        const dest = destination.destination || "N/A";
        const departureDate = destination.departureDate || "N/A";
        const returnDate = destination.returnDate || "N/A";
        const priceTotal = destination.price?.total || "N/A";
        result += `${index + 1}. 📍 Destino: ${dest}\n   🗓️ Fechas: ${departureDate} - ${returnDate}\n   💰 Precio: ${priceTotal} \n`;
      });
    } else {
      result += "❌ No se encontraron destinos.";
    }

    return result;
  },
  {
    name: "search_flights",
    description: "Busca destinos de vuelos desde un origen con un precio máximo usando la API de Amadeus.",
    schema: z.object({
      origin: z.string().describe("Código IATA de la ciudad de origen (por ejemplo, PAR)"),
      maxPrice: z.string().optional().describe("Precio máximo en dólares (opcional)"),
    }),
  }
);