// @ts-nocheck

const _litActionCode = async () => {
    try {
      const result = await Lit.Actions.runOnce({waitForResponse: true}, async () => {
        try {
          console.log("🔒 Storing transaction for verification...");
          
          const storeResponse = await fetch(`${baseUrl}/api/database/create-transaction`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              amount: parseFloat(amount),
              status: 'PENDING',
              pkpAddress: ethers.utils.computeAddress(`0x${publicKey}`)
            })
          });
          
          if (!storeResponse.ok) {
            const errorText = await storeResponse.text();
            console.error("Store transaction response:", errorText);
            throw new Error(`HTTP error! status: ${storeResponse.status}`);
          }

          const storeResult = await storeResponse.json();
          console.log("Store transaction response:", storeResult);

          if (!storeResult.success) {
            throw new Error(storeResult.error || 'Failed to store transaction');
          }

          console.log("✅ Transaction stored:", storeResult.transaction);

          console.log("📧 Sending verification email...");
          const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              email: "andrew@litprotocol.com",
              txHash: storeResult.transaction.txHash
            })
          });
          
          if (!loginResponse.ok) {
            const errorText = await loginResponse.text();
            console.error("Login response:", errorText);
            throw new Error(`HTTP error! status: ${loginResponse.status}`);
          }
          
          const loginResult = await loginResponse.json();
          console.log("Login response:", loginResult);

          if (!loginResult.success) {
            throw new Error(loginResult.error || 'Failed to send verification email');
          }
          
          console.log("📧 Verification email sent successfully");
          return "true";

        } catch (error) {
          console.error("Error in runOnce:", error);
          return `Error: ${error.message}`;
        }
      });

      console.log("Final result:", result);
      Lit.Actions.setResponse({ response: result });

    } catch (error) {
      console.error("❌ Error in Lit Action:", error);
      Lit.Actions.setResponse({ 
        response: `Error: ${error.message}`
      });
    }
};
  
export const litActionCode = `(${_litActionCode.toString()})();`;