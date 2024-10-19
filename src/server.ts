import express from "express";
import { Request, Response, Router } from "express";
import { AccountsHandler } from "./accounts/accounts";
import { FinancialManager } from "./Financial/financial";
import { EventsHandler } from "./Events/events"; // Importar o EventsHandler


const port = 3000;
const app = express();
const routes = Router();

// Middleware para habilitar o parsing de JSON
app.use(express.json());

// Definir as rotas
routes.get('/', (req: Request, res: Response) => {
    res.statusCode = 403;
    res.send('Acesso não permitido. Rota default não disponível.');
});

// Rotas para gerenciar a conta
app.post('/register', AccountsHandler.registerHandler);
app.post('/login', AccountsHandler.loginHandler);
app.post('/getWalletBalance', FinancialManager.getWalletBalanceHandler);

// Rota para adicionar um novo evento (usuários comuns)
app.post("/addNewEvent", EventsHandler.addNewEvent);

// Rota para moderar um evento (admin)
app.post("/moderateEvent", EventsHandler.moderateEvent);

// Rota de teste
app.post("/test", (req, res) => {
    console.log(req.body); // Verifique se o corpo está chegando
    res.send("Recebido!");
});

// Usar as rotas definidas
app.use(routes);

// Iniciar o servidor
app.listen(port, () => {
    console.log(`Server is running on: http://localhost:${port}`);
});