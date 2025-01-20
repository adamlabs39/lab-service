import express from "express";
import routes from "./routes/routes.js";
import errorMiddleware from "./middlewares/error-middleware.js";
import cors from "cors";
import authorizationSdk from "@adameds/authorization-sdk";

const APPLICATION_PORT = process.env.APPLICATION_PORT || 8080;
const APPLICATION_HOST = process.env.APPLICATION_HOST || 'localhost';

const app = express();
app.use(cors({
    origin: '*',
    allowedHeaders: ['Origin', 'Content-Type', 'Accept', 'User-Agent', 'Content-Length', 'Authorization'],
    methods: ['GET', 'POST', 'HEAD', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(authorizationSdk([]))
app.use(routes);
app.use(errorMiddleware);
app.listen(APPLICATION_PORT, APPLICATION_HOST, async () => {
    // await UserModel.sync({ alter: false, force: true})
    console.log(`Server running on http://localhost:${APPLICATION_PORT}`);
});