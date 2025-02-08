import { Request, Response } from "express";
import askAgent from "../../agents/travelAgent";

class ControllerAgent {
    async askQuestion(req: Request, res: Response) {
        const question = req.body.question as string
        if (!question) {
            return res.status(400).json({ error: "La pregunta es obligatoria" });
        }
        try {
            const response = await askAgent(question);
            res.json({ response });
        } catch (error) {
            console.error("Error en conversación:", error);
            res.status(500).json({ error: "Error al obtener respuesta del agente" });
        }
    }
}

export const controllerAgent = new ControllerAgent()