const { Connection, PublicKey } = require('@solana/web3.js');
const axios = require('axios');

async function fetchTransactionDetails() {
    try {

        let data = JSON.stringify({
            "jsonrpc": "2.0",
            "id": 1,
            "method": "getTransaction",
            "params": [
                "4ohQ1T7aVY8eCxfjuVR8bJRKfcfDxVZqX7gf4qdy7SGiRrkWTGrFgqHF1fseQvt2xyjHLR5rqXancR4x7srYvesk",
                "json"
            ]
        });

        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://api.mainnet-beta.solana.com',
            headers: {
                'Content-Type': 'application/json'
            },
            data: data
        };

        const response = await axios.request(config);
        const transactionInfo = response.data;
        if (transactionInfo) {
            // Check if the transaction was successful
            const isSuccess = transactionInfo.result.meta.status.Ok === null;
            console.log('Transaction Success:', isSuccess);

            // Identify the token and amount transferred
            const postTokenBalances = transactionInfo.result.meta.postTokenBalances;
            const preTokenBalances = transactionInfo.result.meta.preTokenBalances;

            postTokenBalances.forEach((postBalance, index) => {
                const preBalance = preTokenBalances.find(
                    (b) => b.accountIndex === postBalance.accountIndex
                );

                if (preBalance) {
                    const amountTransferred =
                        BigInt(preBalance.uiTokenAmount.amount) - BigInt(postBalance.uiTokenAmount.amount);
                    console.log(
                        `Token: ${postBalance.mint}, Amount Transferred: ${amountTransferred.toString()}`
                    );
                }
            });
        } else {
            console.log('Transaction not found.');
        }
    } catch (error) {
        console.error('Error fetching transaction:', error);
    }
}

fetchTransactionDetails();