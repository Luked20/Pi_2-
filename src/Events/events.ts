import OracleDB from "oracledb";
import { Request, Response } from "express";
import dotenv from 'dotenv';
import { stringify } from 'flatted';

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
                `INSERT INTO events (title, description, event_date, status) VALUES (:title, :description, :event_date, 'pending')`,
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

    interface Event {
        id: number;
        status: string;
       
      }

      export const deleteEvent = async (req: Request, res: Response): Promise<void> => {
        const { eventId, id } = req.body; // Mude userId para id
        let connection;
    
        
        if (!eventId || !id) {
            res.status(400).json({ message: 'eventId e id são obrigatórios.' });
            return;
        }
    
        try {
            connection = await connectToDatabase();
            
           
            const eventResult = await connection.execute(
                `SELECT * FROM EVENTS WHERE id = :eventId AND id = :id`,
                [eventId, id]
            );
    
            
            if (!eventResult || !eventResult.rows || eventResult.rows.length === 0) {
                res.status(404).json({ message: 'Evento não encontrado ou você não tem permissão para deletar este evento.' });
                return;
            }
    
        
            await connection.execute(
                `UPDATE EVENTS SET status = 'deleted' WHERE id = :eventId`,
                [eventId]
            );
    
            res.json({ message: 'Evento removido com sucesso.' });
        } catch (error) {
            console.error('Erro ao tentar remover o evento:', error);
            res.status(500).json({ message: 'Erro ao tentar remover o evento.' });
        } finally {
            // Certifique-se de fechar a conexão se ela estiver aberta
            if (connection) {
                try {
                    await connection.close();
                } catch (closeError) {
                    console.error('Erro ao fechar a conexão:', closeError);
                }
            }
        }
    };

    interface Event {
        id: number;
        title: string;
        description: string;
        event_date: Date; // Assuming event_date is a Date object
        status: string;
        created_at: Date; // Assuming created_at is a Date object
        updated_at: Date; // Assuming updated_at is a Date object
    }
    
    export const searchEvents = async (req: Request, res: Response): Promise<void> => {
        const keyword = req.query.keyword as string; // Palavra-chave de busca vinda da URL
        let connection;
    
        try {
            connection = await connectToDatabase();
    
            // Consulta ao banco de dados com LIKE para busca por título ou descrição
            const result = await connection.execute(
                `SELECT id, title, 
                        DBMS_LOB.SUBSTR(description, 4000, 1) AS description, -- Lê até 4000 caracteres do CLOB
                        event_date, status, created_at, updated_at 
                 FROM events 
                 WHERE LOWER(title) LIKE LOWER(:keyword) 
                 OR LOWER(description) LIKE LOWER(:keyword)`,
                { keyword: `%${keyword}%` }, // Adiciona os '%' manualmente para evitar confusão
                { outFormat: OracleDB.OUT_FORMAT_OBJECT } // Formato objeto para evitar circularidade
            );
    
            // Verifica se existem eventos retornados
            if (!result.rows || result.rows.length === 0) {
                res.status(404).json({ message: "Nenhum evento encontrado." });
                return;
            }
    
            // Mapeamento simples dos eventos retornados
            const events = result.rows.map((row: any) => ({
                id: row.ID,
                title: row.TITLE,
                description: row.DESCRIPTION, // Agora é uma string
                event_date: row.EVENT_DATE,
                status: row.STATUS,
                created_at: row.CREATED_AT,
                updated_at: row.UPDATED_AT
            }));
    
            // Retorna os eventos encontrados
            res.status(200).json(events);
        } catch (error) {
            console.error("Erro ao buscar eventos:", error);
            res.status(500).json({ message: "Erro ao buscar eventos." });
        } finally {
            if (connection) {
                try {
                    await connection.close();
                } catch (closeError) {
                    console.error("Erro ao fechar a conexão:", closeError);
                }
            }
        }
    };

    interface User {
        ID: number;
        BALANCE: number;
    }

    export const betOnEvent = async (req: Request, res: Response): Promise<void> => {
        const { email, event_id, amount } = req.body;
    
        // Validação dos parâmetros
        if (!email || !event_id || !amount) {
            res.status(400).json({ message: 'Requisição inválida - email, ID do evento e valor são obrigatórios.' });
            return;
        }
    
        let connection;
    
        try {
            connection = await connectToDatabase();
    
            // Verifica se o usuário existe e obtém o seu ID
            const userResult = await connection.execute(
                `SELECT id FROM accounts WHERE email = :email`,
                { email }
            );

            console.log(userResult);
            
    
            // Verifica se o usuário foi encontrado
            if (!userResult.rows || userResult.rows.length === 0) {
                res.status(404).json({ message: "Usuário não encontrado." });
                return;
            }
    
            const userId = (userResult.rows[0] as { ID: number }).ID;
    
            // Aqui você pode verificar se há saldo suficiente na tabela FUNDS (se estiver implementada)
            const fundsResult = await connection.execute(
                `SELECT SUM(amount) FROM FUNDS WHERE user_id = :user_id`,
                { user_id: userId }
            );
            console.log("User ID:", userId);
            console.log("Aposta:", amount);
            // Verifica se o resultado dos fundos foi encontrado
            const totalAmount = fundsResult.rows && fundsResult.rows.length > 0 ? fundsResult.rows[0] : null;
            const userBalance = totalAmount ? totalAmount : 0;
             console.log("Saldo do usuário:", userBalance);
    
            // Verifica se o saldo é suficiente
            if (amount > userBalance) {
                res.status(400).json({ message: "Saldo insuficiente para realizar a aposta." });
                return;
            }
    
            // Insere a aposta na tabela de apostas (é necessário criar essa tabela)
            const result = await connection.execute(
                `INSERT INTO bets (user_id, event_id, amount) VALUES (:user_id, :event_id, :amount)`,
                { user_id: userId, event_id, amount },
                { autoCommit: true }
            );
    
            // Deduz o valor da aposta do saldo do usuário, se necessário
            await connection.execute(
                `UPDATE FUNDS SET amount = amount - :amount WHERE user_id = :user_id`,
                { amount, user_id: userId },
                { autoCommit: true }
            );
    
            res.status(201).json({ message: 'Aposta realizada com sucesso!' });
        } catch (error) {
            console.error("Erro ao realizar aposta:", error);
            res.status(500).json({ message: "Erro ao realizar aposta." });
        } finally {
            if (connection) {
                try {
                    await connection.close();
                } catch (closeError) {
                    console.error("Erro ao fechar a conexão:", closeError);
                }
            }
        }
    };
    
}
   
    

