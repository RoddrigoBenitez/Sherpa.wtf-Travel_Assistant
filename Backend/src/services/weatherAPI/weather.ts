import express from "express";
import { weatherController } from "./controller";

const routerWeather = express.Router();

routerWeather.get("/", (req, res) => { weatherController.getWeather(req, res) });

export default routerWeather;