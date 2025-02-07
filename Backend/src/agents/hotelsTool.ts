import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { hotelService } from "../services/hotelsAPI/service";

export const hotelTool = tool(
  async ({ city, checkin, checkout }: { city: string; checkin: string; checkout: string }) => {
    const hotelData = await hotelService.searchHotels(city, checkin, checkout);

    if (hotelData.error) {
      throw new Error(hotelData.error || "No se encontraron hoteles disponibles.");
    }

    let result = `Hoteles disponibles en ${city}:\nCheck-in: ${checkin}\nCheck-out: ${checkout}\n`;

    // se asume que la respuesta tiene una data que es un array de ofertas
    if (hotelData.data && Array.isArray(hotelData.data)) {
      hotelData.data.forEach((offer: any, index: number) => {
        // extrae información basica: nombre del hotel, id de la oferta, fechas y precio total.
        const hotelName = offer.hotel?.name || "Desconocido";
        const offerId = offer.offers && offer.offers[0] ? offer.offers[0].id : "N/A";
        const checkInDate = offer.offers && offer.offers[0] ? offer.offers[0].checkInDate : "";
        const checkOutDate = offer.offers && offer.offers[0] ? offer.offers[0].checkOutDate : "";
        const totalPrice = offer.offers && offer.offers[0] ? offer.offers[0].price?.total : "N/A";

        result += `${index + 1}. ${hotelName} (Offer ID: ${offerId})\n   Check-in: ${checkInDate}, Check-out: ${checkOutDate}\n   Precio total: ${totalPrice}\n`;
      });
    } else {
      result += "No se encontraron ofertas.";
    }

    return result;
  },
  {
    name: "search_hotels",
    description: "Busca hoteles disponibles en una ciudad según las fechas ingresadas usando la API de Amadeus.",
    schema: z.object({
      city: z.string().describe("Ciudad (o código de ciudad suelen ser tres letras en mayusculas) donde se busca alojamiento"),
      checkin: z.string().describe("Fecha de check-in en formato YYYY-MM-DD"),
      checkout: z.string().describe("Fecha de check-out en formato YYYY-MM-DD"),
    }),
  }
);