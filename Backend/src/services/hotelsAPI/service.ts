import dotenv from "dotenv";

dotenv.config();

class HotelService {
  // endpoint base para buscar ofertas de hoteles en Amadeus
  private baseUrl = "https://test.api.amadeus.com/v3/shopping/hotel-offers";

  // obtener el token de acceso
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
    return data.access_token;
  }

  async searchHotels(city: string, checkin: string, checkout: string) {
    try {
      const accessToken = await this.getAccessToken();
      // Usamos "cityCode" como parámetro; en un caso real puede que necesites convertir el nombre de la ciudad a código.
      const url = `${this.baseUrl}?cityCode=${encodeURIComponent(city)}&checkInDate=${checkin}&checkOutDate=${checkout}&adults=1`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Error en la API de hoteles: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("data hotels service:", data);
      return data;
    } catch (error) {
      console.error("Error al obtener hoteles:", error);
      return { error: "No se pudo obtener la información de hoteles." };
    }
  }
}

export const hotelService = new HotelService();