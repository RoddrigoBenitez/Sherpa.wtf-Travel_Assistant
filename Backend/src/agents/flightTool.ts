import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { flightService } from "../services/flightAPI/service";

export const flightTool = tool(
  async ({ origin, destination, departureDate, departureTime, currency, cabin, maxFlightOffers }: {
    origin: string;
    destination: string;
    departureDate: string;
    departureTime?: string;
    currency?: string;
    cabin?: string;
    maxFlightOffers?: number;
  }) => {
    // Asignar valores por defecto si no se proporcionan
    const dt = departureTime || "10:00:00";
    const curr = currency || "USD";
    const cab = cabin || "ECONOMY";
    const maxOffers = maxFlightOffers || 2;

    const flightData = await flightService.searchFlights(origin, destination, departureDate, dt, curr, maxOffers, cab);

    if (flightData.error) {
      throw new Error(flightData.error || "No se encontraron ofertas de vuelos.");
    }

    let result = `Ofertas de vuelos desde ${origin} hasta ${destination} en ${departureDate}:\n`;

    // Se asume que flightData.data es un arreglo de ofertas
    if (flightData.data && Array.isArray(flightData.data)) {
      flightData.data.forEach((offer: any, index: number) => {
        const totalPrice = offer.price?.total || "N/A";
        const currencySymbol = offer.price?.currency || "";
        result += `${index + 1}. Precio total: ${totalPrice} ${currencySymbol}\n`;
        if (offer.itineraries && Array.isArray(offer.itineraries)) {
          offer.itineraries.forEach((itinerary: any, i: number) => {
            result += `   Itinerario ${i + 1}: Duración: ${itinerary.duration}\n`;
            if (itinerary.segments && Array.isArray(itinerary.segments)) {
              itinerary.segments.forEach((segment: any, j: number) => {
                result += `     Segmento ${j + 1}: Salida ${segment.departure.iataCode} a las ${segment.departure.at}, llegada ${segment.arrival.iataCode} a las ${segment.arrival.at}\n`;
              });
            }
          });
        }
      });
    } else {
      result += "No se encontraron ofertas.";
    }

    return result;
  },
  {
    name: "search_flights",
    description: "Busca ofertas de vuelos entre dos ciudades en una fecha determinada usando la API de Amadeus.",
    schema: z.object({
      origin: z.string().describe("Código IATA de la ciudad de origen (por ejemplo, NYC)"),
      destination: z.string().describe("Código IATA de la ciudad de destino (por ejemplo, MAD)"),
      departureDate: z.string().describe("Fecha de salida en formato YYYY-MM-DD"),
      departureTime: z.string().optional().describe("Hora de salida en formato HH:MM:SS (opcional)"),
      currency: z.string().optional().describe("Código de moneda (por ejemplo, USD)"),
      cabin: z.string().optional().describe("Tipo de cabina (por ejemplo, ECONOMY, BUSINESS)"),
      maxFlightOffers: z.number().optional().describe("Número máximo de ofertas de vuelo a retornar"),
    }),
  }
);