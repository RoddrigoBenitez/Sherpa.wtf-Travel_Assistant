import dotenv from "dotenv";

dotenv.config();

class HotelService {
  private baseUrl = "https://secure-supply-xml.booking.com/hotels/xml/reservationssummary";

  async searchHotels(city: string, checkin: string, checkout: string) {
    const apiKey = process.env.BOOKING_API_KEY;
    
    if (!apiKey) {
      throw new Error("Falta la clave API de Booking.com en el archivo .env");
    }

    const url = `${this.baseUrl}/hotels/xml/reservationssummary`;

    const requestBody = `<request>
      <city>${city}</city>
      <checkin>${checkin}</checkin>
      <checkout>${checkout}</checkout>
    </request>`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/xml",
          "Authorization": `Bearer ${apiKey}`
        },
        body: requestBody,
      });

      if (!response.ok) {
        throw new Error(`Error en la API de hoteles: ${response.statusText}`);
      }

      const data = await response.text(); // Booking devuelve XML, podemos parsearlo si es necesario
      return data;
    } catch (error) {
      console.error("Error al obtener hoteles:", error);
      return { error: "No se pudo obtener la información de hoteles." };
    }
  }
}

export const hotelService = new HotelService();