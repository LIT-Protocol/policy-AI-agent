// @ts-nocheck

const _litActionCodeTx = async () => {
  console.log("Starting Lit Action with params:", {
    publicKey,
    chain,
    unsignedTransaction
  });

  const signature = await Lit.Actions.signAndCombineEcdsa({
    toSign,
    publicKey,
    sigName,
  });

  console.log("Got signature from Lit");

  const jsonSignature = JSON.parse(signature);
  jsonSignature.r = "0x" + jsonSignature.r.substring(2);
  jsonSignature.s = "0x" + jsonSignature.s;
  const hexSignature = ethers.utils.joinSignature(jsonSignature);

  const signedTx = ethers.utils.serializeTransaction(
    unsignedTransaction,
    hexSignature
  );

  const recoveredAddress = ethers.utils.recoverAddress(toSign, hexSignature);
  console.log("Recovered Address:", recoveredAddress);
  console.log("Expected Address:", ethers.utils.computeAddress(`0x${publicKey}`));

  const response = await Lit.Actions.runOnce(
    { waitForResponse: true, name: "txnSender" },
    async () => {
      try {
        const rpcUrl = await Lit.Actions.getRpcUrl({ chain });
        console.log("Broadcasting to:", rpcUrl);
        
        const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
        const transaction = await provider.sendTransaction(signedTx);
        console.log("Transaction sent:", transaction.hash);

        // Wait for transaction confirmation
        console.log("Waiting for transaction confirmation...");
        const confirmations = 1; // Adjust this number based on your security requirements
        const receipt = await transaction.wait(confirmations);
        console.log("Transaction confirmed in block:", receipt.blockNumber);

        // Return both transaction hash and receipt for verification
        return {
          hash: transaction.hash,
          blockNumber: receipt.blockNumber,
          confirmations: receipt.confirmations,
          status: receipt.status // 1 for success, 0 for failure
        };
      } catch (error) {
        console.error("Transaction failed:", error);
        throw new Error(`Failed to send transaction: ${error.message}`);
      }
    }
  );

  console.log("Response:", response);
  Lit.Actions.setResponse({ response: "true" });
};

export const litActionCodeTx = `(${_litActionCodeTx.toString()})();`;