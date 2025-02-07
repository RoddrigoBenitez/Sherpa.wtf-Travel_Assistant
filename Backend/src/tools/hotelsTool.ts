import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { hotelService } from "../services/hotelsAPI/serviceHotel";

export const hotelTool = tool(
  async ({ hotelId, checkin, checkout }: { hotelId: string; checkin: string; checkout: string }) => {
    console.log(`Consultando ofertas para el hotel ${hotelId} desde ${checkin} hasta ${checkout}...`);
    const hotelData = await hotelService.searchHotels(hotelId, checkin, checkout);

    if (hotelData.error) {
      console.error("Error en hotelTool:", hotelData.error);
      throw new Error(hotelData.error || "No se encontraron ofertas de hoteles.");
    }

    let result = `Ofertas para el hotel con ID ${hotelId}:\nCheck-in: ${checkin}\nCheck-out: ${checkout}\n\n`;

    if (hotelData.data && Array.isArray(hotelData.data) && hotelData.data.length > 0) {
      hotelData.data.forEach((offer: any, index: number) => {
        const hotelName = offer.hotel?.name || "Desconocido";
        const offerId = offer.offers && offer.offers[0] ? offer.offers[0].id : "N/A";
        const checkInDate = offer.offers && offer.offers[0] ? offer.offers[0].checkInDate : "N/A";
        const checkOutDate = offer.offers && offer.offers[0] ? offer.offers[0].checkOutDate : "N/A";
        const totalPrice = offer.offers && offer.offers[0] ? offer.offers[0].price?.total : "N/A";
        const currency = offer.offers && offer.offers[0] ? offer.offers[0].price?.currency : "";

        result += `${index + 1}. ${hotelName} (Offer ID: ${offerId})\n   Fechas: ${checkInDate} - ${checkOutDate}\n   Precio total: ${totalPrice} ${currency}\n\n`;
      });
    } else {
      result += "No se encontraron ofertas.";
    }

    console.log("Resultado formateado:", result);
    return result;
  },
  {
    name: "search_hotels",
    description: "Busca ofertas de hoteles usando la API de Amadeus (v3).",
    schema: z.object({
      hotelId: z.string().describe("ID del hotel, por ejemplo 'MCLONGHM'"),
      checkin: z.string().describe("Fecha de check-in en formato YYYY-MM-DD"),
      checkout: z.string().describe("Fecha de check-out en formato YYYY-MM-DD"),
    }),
  }
);