import dotenv from "dotenv";
dotenv.config();

class FlightService {
  private baseUrl = "https://test.api.amadeus.com/v1/shopping/flight-destinations";

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

  async searchFlightDestinations(origin: string, maxPrice?: string) {
    try {
      const accessToken = await this.getAccessToken();

      // Validar que el código IATA tiene 3 caracteres
      if (!origin || origin.length !== 3) {
        throw new Error(`Código IATA inválido: ${origin}`);
      }

      // Construir la URL con los parámetros de consulta
      let url = `${this.baseUrl}?origin=${encodeURIComponent(origin)}`;
      if (maxPrice) {
        url += `&maxPrice=${encodeURIComponent(maxPrice)}`;
      }


      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });


      if (!response.ok) {
        const errorText = await response.text();
        console.error("Cuerpo de error:", errorText);
        throw new Error(`Error en la API de vuelos (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error al obtener vuelos:", error);
      return { error: error instanceof Error ? error.message : "Error desconocido." };
    }
  }
}

export const flightService = new FlightService();