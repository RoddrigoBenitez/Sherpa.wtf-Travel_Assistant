import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { hotelLocationService } from "../services/hotelsAPI/serviceHotelCity";

export const hotelsByCityTool = tool(
  async ({ cityCode, radius }: { cityCode: string; radius?: number }) => {
    console.log(`Buscando hoteles en la ciudad ${cityCode} con un radio de ${radius || 1} km...`);
    const hotelData = await hotelLocationService.searchHotelsByCity(cityCode, radius || 1);

    if (hotelData.error) {
      throw new Error(hotelData.error || "No se encontraron hoteles en la ciudad.");
    }

    let result = `Hoteles en la ciudad ${cityCode}:\n`;
    if (hotelData.data && Array.isArray(hotelData.data) && hotelData.data.length > 0) {
      hotelData.data.forEach((hotel: any, index: number) => {
        const hotelName = hotel.name || "Desconocido";
        const hotelId = hotel.hotelId || "N/A";
        const chainCode = hotel.chainCode || "";
        result += `${index + 1}. ${hotelName} (Hotel ID: ${hotelId}, Chain: ${chainCode})\n`;
      });
    } else {
      result += "No se encontraron hoteles.";
    }
    return result;
  },
  {
    name: "search_hotels_by_city",
    description: "Busca hoteles en una ciudad usando el endpoint de Amadeus por ciudad.",
    schema: z.object({
      cityCode: z.string().describe("Código de la ciudad (ej: PAR para París, NYC para Nueva York)"),
      radius: z.number().optional().describe("Radio de búsqueda en kilómetros (opcional, por defecto 1 km)"),
    }),
  }
);