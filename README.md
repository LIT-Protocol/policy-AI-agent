# Lit Policy AI Agent

This repository contains a Next.js application showing the potential of Lit Protocol as an atonomous policy tool for AI agents.

## Overview

1. Blockchain Metrics Retrieval: The application initiates by querying the Chronicle Yellowstone blockchain to obtain metrics such as gas prices and network count.

2. AI-Based Transaction Decision: An AI agent analyzes these metrics to determine the specific transaction amount to send based on current network conditions.

3. Threshold Evaluation: If the calculated transaction amount exceeds a predefined threshold, the AI agent triggers a human verification process to ensure security and compliance.

4. Initiating Human Verification:

- The transaction details are stored in a local database with a status of PENDING.
- An OTP (One-Time Password) is sent to the email address of the AI agent's owner.

5. User Authentication and Approval:

- Upon clicking the OTP link, the agent owner is redirected back to the application.
- The transaction information is displayed, along with an option to approve the transaction.
- Approval updates the transaction status to COMPLETED in the database.

6. Transaction Signing and Broadcasting:

- The Agent's PKP (Programmable Key Pair) signs the transaction.
- The signed transaction is broadcasted to the blockchain network.

### Human Verification


https://github.com/user-attachments/assets/8001c87a-bc37-4fbd-9edc-285d8b078e08

### Atonomous Transactions

![auto_tx](https://github.com/user-attachments/assets/8734c87f-481a-4be3-9b31-e1a5a4350f52)

### Step 1: Clone the Repository

Clone the repository by running:

```bash
git clone https://github.com/LIT-Protocol/policy-AI-agent.git
```

Install dependencies with `yarn`:

```bash
yarn install
```

Load our Prisma database schema:

```bash
npx prisma generate
```

Create our database:

```bash
npx prisma db push
```

We should now have a database at `./prisma/dev.db`.

### Prerequisites

Before we get started, you'll need to have the following:

- A Lit Protocol PKP minted to an Ethereum wallet
- A Stytch project
- An OpenAI API key

#### Environment Variables

Make a copy of the provided .env.example file and name it .env:

```bash
cp .env.example .env
```

Within the .env there are the ENVs:

- NEXT_PUBLIC_ETHEREUM_PRIVATE_KEY
  - The Ethereum private key for our wallet with ownership of the PKP.
  - **Note:** Using a private key as a public environment variable is not safe, but is done for simplicity in this example.
- NEXT_PUBLIC_LIT_PKP_PUBLIC_KEY
  - Public key of the PKP. This will be the Agent wallet.
  - **Note:** Please do not include the prefix `0x`.


- NEXT_PUBLIC_BASE_URL
  - Base ngrok URL that will redirect web traffic to our localhost:3000.

 
The following Stytch information can be found on the [project dashboard](https://stytch.com/dashboard).
- NEXT_PUBLIC_STYTCH_PUBLIC_TOKEN
  - Public token of the Stytch project.
- NEXT_PUBLIC_STYTCH_PROJECT_ID
  - Project ID of the Stytch project.
- NEXT_PUBLIC_STYTCH_EMAIL
  - Email of the Stytch project owner.
- STYTCH_SECRET_KEY
  - Secret ket of the Stytch project.


- OPENAI_API_KEY
  - An OpenAI API key, this will be our Agent.

- AMOUNT_THRESHOLD
  - Threshold of gwei that will require human verification. A suitable value is 20-30 for this example, but this can be changed by also changing the prompt in [this](./src/app/api/ai-decision/route.ts) file. 

More details on how to set these up can be found below.

### Step 2: Mint a PKP

Mint a PKP to an Ethereum wallet and add it to the `.env` file.

You can mint a PKP by going to [Lit Explorer](https://explorer.litprotocol.com/) and signing in with your Ethereum wallet. After signing in, click on the `Mint a new PKP` button. The webpage will prompt your wallet to pay for the mint fee using Lit's `tstLPX` tokens, which can be acquired at the [Lit Faucet](https://chronicle-yellowstone-faucet.getlit.dev/). After minting, you can go to the [Profile](https://explorer.litprotocol.com/profile) page to view your PKP. For the PKP which you will be using, please fund its wallet with `tstLPX` tokens at the faucet as well. This is because this example agent will perfrom transactions of sending tstLPX tokens on Lit's `Chronicle Yellowstone` blockchain.

![image](https://github.com/user-attachments/assets/a9a151e9-e08f-4029-b21b-e1266c6de514)

You will then copy the PKP's public key and add it to the `.env` file, and the private key of your Ethereum wallet and add it to the `PRIVATE_KEY` field in the `.env` file. Please make sure the private key of the wallet which you provide is the owner of the PKP. 

**Note:** Please do not include the `0x` prefix when adding your PKP public key to the `.env` file.

### Step 3: Setup Ngrok

Our Lit Action for human verification requires an http endpoint. We can use Ngrok to create one.

Download Ngrok from their [website](https://ngrok.com/download).

In a new terminal, run `ngrok http 3000`. This will create an http endpoint for our application. Copy this URL and add it to the `NEXT_PUBLIC_BASE_URL` field in the `.env` file.

### Step 4: Setup Stytch
Create a Stytch account and project on the [Stytch Dashboard](https://stytch.com/dashboard).

On the dashboard, copy the `public token`, `secret key`, and `project ID` to the `.env` file. You will also need to add the base URL of your application to the `NEXT_PUBLIC_BASE_URL` field in the `.env` file. 

We then need to go to `https://stytch.com/dashboard/redirect-urls` on the Stytch dashboard and add our OTP redirect URLs. For this project, add:

- [Your Ngrok URL]

- [Your Ngrok URL]/pages/authenticate

- [Your Ngrok URL]/pages/authenticate?txHash={}

With login, signup, and invite permissions enabled.

![image](https://github.com/user-attachments/assets/1e8646e8-1a30-48bd-be37-dd28e6f0abe5)


### Step 5: OpenAI API Key

Add your OpenAI API key to the `.env` file. Please make sure that you've enabled the `gpt-4o-mini` model on your API key's project. You can enable this by going to your [project settings](https://platform.openai.com/settings/organization/general), and go to the `Limits` tab of the sidebar (it should be the last item). From there, you can enable `gpt-4o-mini` by checking it in the `Model usage` section. Alternatively, you can change the model used in this project by editing the [AI Decision](./src/app/api/ai-decision/route.ts) file.

![image](https://github.com/user-attachments/assets/73c41b70-7021-440a-acaa-deb34bf5ae4e)


### Step 6: Run the Application

Run the application with `yarn dev`.

In a new terminal, run `ngrok http 3000`. This will create an http endpoint for our application. Copy this URL and add it to the `NEXT_PUBLIC_BASE_URL` field in the `.env` file. Please note that the URL must be the same as the one you added to the Stytch redirect URLs, if it is not, you will need to change it in the Stytch dashboard.


## Specific Files to Reference

- [./src/app/atonomous-agent.ts](./src/app/atonomous-agent.ts): Contains the core logic for the AI agent, making API calls to the server-side to make decisions, and determining whether to request human verification to send a transaction.

- [./src/app/agent-helpers.ts](./src/app/agent-helpers.ts): Contains helper functions for the AI agent, such as human verification and signing and broadcasting transactions.

- [./src/app/LitActions/humanVerificationAction.ts](./src/app/LitActions/humanVerificationAction.ts): Contains the Lit Action for human verification. This will create a transaction in our local database through the ngrok endpoint, which routes traffic to our application. After successfully storing the transaction, an email will be sent to the Agent owner with a link to click to approve the transaction. This email authentication also contains the transaction hash, which is used to fetch the transaction from our database.

- [./src/app/LitActions/litActionTx.ts](./src/app/LitActions/litActionTx.ts): Contains the Lit Action for signing and broadcasting a transaction. This will take the signed transaction and send it to the blockchain.

- [./src/app/utils.ts](./src/app/utils.ts): Contains helper functions for the application. These include: fetching blockchain metrics, blockchain metadata, authenticating a Stytch OTP token, and generating PKP Session Signatures.

- [./src/app/pages](./src/app/pages/): Contains the frontend pages for the application.

- [./src/app/api](./src/app/api/): Contains the server-side API endpoints for the application.
