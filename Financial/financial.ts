import { Request, Response } from "express";
import OracleDB from "oracledb"; // Certifique-se de que você tem o módulo oracledb instalado

async function connectToDatabase() {
    return OracleDB.getConnection({
        user: "sys",
        password: "lucas2006",
        connectString: "localhost:1521/XEPDB1",
        privilege: OracleDB.SYSDBA
    });
}

export namespace FinancialManager {
    export const addFunds = async (req: Request, res: Response): Promise<void> => {
        const { userId, amount } = req.body;

        // Validação dos parâmetros
        if (!userId || !amount) {
            res.status(400).json({ message: 'userId e amount são obrigatórios.' });
            return;
        }

        let connection;

        try {
            connection = await connectToDatabase();

            // Insere os fundos na tabela FUNDS
            const result = await connection.execute(
                `INSERT INTO FUNDS (user_id, amount) VALUES (:userId, :amount)`,
                { userId, amount },
                { autoCommit: true }
            );

            console.log("Fundos adicionados com sucesso!", result.rowsAffected);
            res.status(201).json({ message: 'Fundos adicionados com sucesso!' });
        } catch (error) {
            console.error("Erro ao adicionar fundos:", error);
            res.status(500).json({ message: 'Erro ao adicionar fundos.' });
        } finally {
            // Certifique-se de fechar a conexão se estiver aberta
            if (connection) {
                try {
                    await connection.close();
                } catch (closeError) {
                    console.error('Erro ao fechar a conexão:', closeError);
                }
            }
        }
    };

    interface FundsResult {
        TOTALFUNDS: number | null; // O valor pode ser nulo se não houver fundos
    }

    
    export const withdrawFunds = async (req: Request, res: Response): Promise<void> => {
        const { user_id, amount } = req.body;
    
        if (!user_id || !amount || amount <= 0) {
            res.status(400).json({ message: 'userId e amount são obrigatórios e amount deve ser maior que 0.' });
            return;
        }
    
        let connection;
    
        try {
            connection = await connectToDatabase();
    
            // Adicione o console.log para depuração
            console.log(`Tentando retirar fundos. user_id: ${user_id}, amount: ${amount}`);
    
            // Verificar o saldo total do usuário
            const fundsResult = await connection.execute<FundsResult>(
                `SELECT SUM(amount) AS TOTALFUNDS FROM FUNDS WHERE user_id = :user_id`,
                [user_id]
            );
    
            // Verifique se fundsResult e rows estão definidos
            if (!fundsResult || !fundsResult.rows || fundsResult.rows.length === 0) {
                res.status(404).json({ message: 'Usuário não encontrado ou sem fundos.' });
                return;
            }
    
            // Obtenha o saldo total do usuário
            const totalFunds = fundsResult.rows[0].TOTALFUNDS || 0;
    
            // Adicione um console.log para verificar o saldo total encontrado
            console.log(`Saldo total encontrado: ${totalFunds}`);
    
            // Verifique se o saldo é suficiente
            if (totalFunds < amount) {
                res.status(400).json({ message: 'Saldo insuficiente para a retirada.' });
                return;
            }
    
            // Realizar a retirada
            await connection.execute(
                `INSERT INTO FUNDS (user_id, amount) VALUES (:user_id, :amount)`,
                {
                    user_id,
                    amount: -amount // Inserir um valor negativo para indicar que o valor está sendo sacado
                },
                { autoCommit: true }
            );
    
            res.json({ message: 'Retirada realizada com sucesso!' });
        } catch (error) {
            console.error('Erro ao tentar sacar fundos:', error);
            res.status(500).json({ message: 'Erro ao sacar fundos.' });
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
    
}