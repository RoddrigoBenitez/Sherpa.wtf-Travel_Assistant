import dotenv from "dotenv";
dotenv.config();

class HotelLocationService {
  // endpoint to search for hotels by city
  private baseUrl = "http://test.api.amadeus.com/reference-data/locations/hotels/by-city";

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

  // search for hotels by city (using cityCode and a search radius)
  async searchHotelsByCity(cityCode: string, radius: number = 12) {
    try {
      const accessToken = await this.getAccessToken();
      const url = `${this.baseUrl}?cityCode=${encodeURIComponent(cityCode)}&radius=${radius}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error en la API de hoteles por ciudad: ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error al buscar hoteles por ciudad:", error);
      return { error: error instanceof Error ? error.message : "Error desconocido." };
    }
  }
}

export const hotelLocationService = new HotelLocationService();