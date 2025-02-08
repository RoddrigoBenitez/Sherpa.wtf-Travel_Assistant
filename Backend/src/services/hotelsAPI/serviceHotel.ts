import dotenv from "dotenv";
dotenv.config();

class HotelService {
  // endpoint para ofertas de hoteles (v3) que requiere hotelIds(access limit por amadeus)
  private baseUrl = "https://test.api.amadeus.com/v3/shopping/hotel-offers";

  async getAccessToken(): Promise<string> {
    const tokenUrl = "https://test.api.amadeus.com/v1/security/oauth2/token";
    const apiKey = process.env.AMADEUS_API_KEY;
    const apiSecret = process.env.AMADEUS_API_SECRET;

    if (!apiKey || !apiSecret) {
      throw new Error("Falta la clave API o el secreto de Amadeus en el archivo .env");
    }

    const body = new URLSearchParams();
    body.append("grant_type", "client_credentials");
    body.append("client_id", apiKey);
    body.append("client_secret", apiSecret);

    console.log("Obteniendo token de acceso...");
    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    });

    if (!response.ok) {
      throw new Error(`Error al obtener token: ${response.statusText}`);
    }
    const data = await response.json();
    console.log("Token obtenido:", data.access_token);
    return data.access_token;
  }

  async searchHotels(
    hotelIds: string,
    checkin: string,
    checkout: string,
    adults: number = 1,
    paymentPolicy: string = "NONE",
    roomQuantity: number = 1
  ) {
    try {
      // valida la fecha de check-in q no esté en el pasado
      const now = new Date();
      const checkinDate = new Date(checkin);
      if (checkinDate < now) {
        throw new Error("Fecha de check-in inválida: la fecha no puede estar en el pasado");
      }

      const accessToken = await this.getAccessToken();
      const url = `${this.baseUrl}?hotelIds=${encodeURIComponent(hotelIds)}&adults=${adults}&checkInDate=${checkin}&checkOutDate=${checkout}&paymentPolicy=${encodeURIComponent(paymentPolicy)}&roomQuantity=${roomQuantity}`;
      
      console.log("URL de búsqueda de hoteles:", url);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error en la API de hoteles: ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log("data hotels service:", data);
      return data;
    } catch (error) {
      console.error("Error al obtener hoteles:", error);
      return { error: error instanceof Error ? error.message : "No se pudo obtener la información de hoteles." };
    }
  }
}

export const hotelService = new HotelService();