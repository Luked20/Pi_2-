import OracleDB from "oracledb";
import { Request, Response } from "express";
import dotenv from 'dotenv';

dotenv.config();

// Função para conectar ao banco de dados
async function connectToDatabase() {
    return OracleDB.getConnection({
        user: "sys",
        password: "lucas2006",
        connectString: "localhost:1521/XEPDB1",
        privilege: OracleDB.SYSDBA
    });
}

// Namespace para gerenciar eventos
export namespace EventsHandler {
    // Handler para adicionar um novo evento
    export const addNewEvent = async (req: Request, res: Response): Promise<void> => {
        const { title, description, event_date } = req.body;

        // Validação dos parâmetros
        if (!title || !event_date) {
            res.status(400).send('Requisição inválida - Título e data do evento são obrigatórios.');
            return;
        }

        let connection;

        try {
            connection = await connectToDatabase();

            const result = await connection.execute(
                `INSERT INTO events (title, description, event_date) VALUES (:title, :description, :event_date)`,
                {
                    title,
                    description: description || null, // Permitir que a descrição seja nula
                    event_date: new Date(event_date) // Garantir que a data seja um objeto Date
                },
                { autoCommit: true }
            );

            console.log("Evento adicionado com sucesso!", result.rowsAffected);
            res.status(201).send('Evento adicionado com sucesso!');
        } catch (error) {
            console.error("Erro ao adicionar evento:", error);
            if (error instanceof Error) {
                res.status(500).send(error.message);
            } else {
                res.status(500).send("Erro desconhecido.");
            }
        } finally {
            if (connection) {
                try {
                    await connection.close();
                } catch (err) {
                    console.error("Erro ao fechar a conexão:", err);
                }
            }
        }
    };
}
