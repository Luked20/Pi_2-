document.getElementById('registerForm').addEventListener('submit', async function(event) {
    event.preventDefault(); // Impede o envio padrão do formulário

    const completeName = document.getElementById('completeName').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    // Verifique se as senhas coincidem
    if (password !== confirmPassword) {
        document.getElementById('message').textContent = "As senhas não coincidem.";
        console.error("Senhas não coincidem.");
        return;
    }

    // Enviar dados para a API
    try {
        console.log("Enviando dados para a API..."); // Log antes de fazer a requisição
        const response = await fetch('http://localhost:3000/register', { // Verifique a porta
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                completeName: completeName,
                email: email,
                password: password
            })
        });

        // Log da resposta
        console.log("Resposta recebida da API:", response);

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Erro na resposta da API:", errorText); // Log do erro da resposta
            throw new Error(errorText);
        }

        const data = await response.text();
        document.getElementById('message').textContent = data; // Mensagem de sucesso
        console.log("Registro bem-sucedido:", data);
        window.location.href = 'http://127.0.0.2:5500/src/views/login.html' // Log de sucesso
    } catch (error) {
        console.error("Erro ao registrar:", error); // Log do erro
        document.getElementById('message').textContent = error.message; // Mensagem de erro
    }
});
