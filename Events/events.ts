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

        if (!title || !event_date) {
            res.status(400).send('Requisição inválida - Título e data do evento são obrigatórios.');
            return;
        }

        let connection;

        try {
            connection = await connectToDatabase();

            const result = await connection.execute(
                `INSERT INTO events (title, description, event_date, status) VALUES (:title, :description, :event_date, 'pending')`,
                {
                    title,
                    description: description || null,
                    event_date: new Date(event_date)
                },
                { autoCommit: true }
            );

            console.log("Evento adicionado com sucesso!", result.rowsAffected);
            res.status(201).send('Evento adicionado com sucesso!');
        } catch (error) {
            console.error("Erro ao adicionar evento:", error);
            res.status(500).send(error instanceof Error ? error.message : "Erro desconhecido.");
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

    // Handler para moderar um evento (admin)
    export const moderateEvent = async (req: Request, res: Response): Promise<void> => {
        const { eventId, action, reason } = req.body;

        if (!eventId || !action) {
            res.status(400).send('Requisição inválida - Parâmetros faltando.');
            return;
        }

        let connection;

        try {
            connection = await connectToDatabase();

            const result = await connection.execute(
                `UPDATE events SET status = :status, updated_at = CURRENT_TIMESTAMP WHERE id = :eventId`,
                {
                    status: action === 'aprovar' ? 'approved' : 'rejected',
                    eventId,
                },
                { autoCommit: true }
            );

            if (action === 'reprovar' && reason) {
                await connection.execute(
                    `UPDATE events SET description = :reason WHERE id = :eventId`,
                    {
                        reason,
                        eventId,
                    },
                    { autoCommit: true }
                );
            }

            if (result.rowsAffected && result.rowsAffected > 0) {
                res.status(200).send('Evento moderado com sucesso!');
            } else {
                res.status(404).send('Evento não encontrado.');
            }
        } catch (error) {
            console.error("Erro ao moderar evento:", error);
            res.status(500).send(error instanceof Error ? error.message : "Erro desconhecido.");
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

    // Handler para buscar eventos de acordo com critérios de entrada
    export const getEvents = async (req: Request, res: Response): Promise<void> => {
        const { status, type } = req.query; // status: 'pending', 'approved', 'rejected', type: 'past', 'future'

        let query = `SELECT * FROM events WHERE 1=1`; // Consulta base

        if (status) {
            query += ` AND status = '${status}'`; // Filtra por status (aguardando aprovação, aprovado, rejeitado)
        }

        if (type === 'past') {
            query += ` AND event_date < CURRENT_DATE`; // Filtra eventos passados
        } else if (type === 'future') {
            query += ` AND event_date > CURRENT_DATE`; // Filtra eventos futuros
        }

        let connection;

        try {
            connection = await connectToDatabase();

            const result = await connection.execute(query);

            if (result.rows && result.rows.length > 0) {
                res.status(200).json(result.rows); // Retorna os eventos encontrados
            } else {
                res.status(404).send('Nenhum evento encontrado.');
            }
        } catch (error) {
            console.error("Erro ao buscar eventos:", error);
            res.status(500).send(error instanceof Error ? error.message : "Erro desconhecido.");
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
