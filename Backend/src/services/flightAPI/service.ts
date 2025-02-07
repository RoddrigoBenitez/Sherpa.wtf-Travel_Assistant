import dotenv from "dotenv";
dotenv.config();

class FlightService {
  // Endpoint para consultar ofertas de vuelos (en el entorno de testing)
  private baseUrl = "https://test.api.amadeus.com/v2/shopping/flight-offers";

  // Función para obtener el token de acceso de Amadeus
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

  // Función para buscar ofertas de vuelos
  async searchFlights(
    origin: string,
    destination: string,
    departureDate: string,
    departureTime: string = "10:00:00",
    currency: string = "USD",
    maxFlightOffers: number = 2,
    cabin: string = "ECONOMY"
  ) {
    try {
      const accessToken = await this.getAccessToken();

      // Construimos el cuerpo de la solicitud según la documentación
      const requestBody = {
        currencyCode: currency,
        originDestinations: [
          {
            id: "1",
            originLocationCode: origin,
            destinationLocationCode: destination,
            departureDateTimeRange: {
              date: departureDate,
              time: departureTime,
            },
          },
        ],
        travelers: [
          {
            id: "1",
            travelerType: "ADULT",
          },
        ],
        sources: ["GDS"],
        searchCriteria: {
          maxFlightOffers: maxFlightOffers,
          flightFilters: {
            cabinRestrictions: [
              {
                cabin: cabin,
                coverage: "MOST_SEGMENTS",
                originDestinationIds: ["1"],
              },
            ],
          },
        },
      };

      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`Error en la API de vuelos: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("data flight service:", data);
      return data;
    } catch (error) {
      console.error("Error al obtener vuelos:", error);
      return { error: "No se pudo obtener la información de vuelos." };
    }
  }
}

export const flightService = new FlightService();