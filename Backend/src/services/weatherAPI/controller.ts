import { Request, Response } from "express";
import { weatherService } from "./service";

const { getWeather } = weatherService

class WeatherController{
    async getWeather(req: Request, res: Response) {
        const city = req.query.city as string;
    
        if (!city) {
            return res.status(400).json({ error: "Debes proporcionar una ciudad válida." });
        }
        console.log("Ciudad recibida:", city);
        try {
            const weatherData = await getWeather(city);
            console.log("Datos obtenidos:", weatherData);
            if (weatherData.error) {
                return res.status(400).json(weatherData);
            }
            
            return res.status(200).json(weatherData);
        } catch (error) {
            console.error("Error en el controlador:", error);
            res.status(500).json({ message: "Error interno del servidor" });
        }
    };
}

export const weatherController = new WeatherController()