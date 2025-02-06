import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { hotelService } from "../services/hotelsAPI/service";

export const hotelTool = tool(
  async ({ city, checkin, checkout }: { city: string; checkin: string; checkout: string }) => {
    const hotelData = await hotelService.searchHotels(city, checkin, checkout);
    
    if (typeof hotelData !== "string" && hotelData.error) {
      throw new Error(hotelData.error || "No se encontraron hoteles disponibles.");
    }

    return `Hoteles disponibles en ${city}:
     Check-in: ${checkin}
     Check-out: ${checkout}
     Información: ${hotelData}`;
  },
  {
    name: "search_hotels",
    description: "Busca hoteles disponibles en una ciudad según las fechas ingresadas.",
    schema: z.object({
      city: z.string().describe("Ciudad donde se busca alojamiento"),
      checkin: z.string().describe("Fecha de check-in en formato YYYY-MM-DD"),
      checkout: z.string().describe("Fecha de check-out en formato YYYY-MM-DD"),
    }),
  }
);