
async function testMercadoPago() {
    try {
        const response = await fetch("http://localhost:3000/api/checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id: "volta-as-aulas",
                emailCliente: "teste@exemplo.com"
            }),
        });

        const data = await response.json();
        console.log("Status:", response.status);
        console.log("Data:", data);

        if (data.url) {
            console.log("✅ Sucesso! URL do Mercado Pago gerada.");
        } else {
            console.log("❌ Erro:", data.error || "Nenhuma URL retornada.");
        }
    } catch (error) {
        console.error("❌ Falha na conexão:", error.message);
    }
}

testMercadoPago();
