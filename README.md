# Lit AI Agent

This repository contains a Next.js application showing the potential of Lit Protocol as an atonomous policy tool for AI agents.

## Overview

The code starts by querying the Chronicle Yellowstone blockchain for metrics such as the gas price and network count. We then use our AI agent to decide the specific transaction amount to send depending on the metrics. If the amount exceeds a certain threshold, the AI agent will request human verification. The human verification will store the transaction in our local database and mark the status as `PENDING`, and a OTP (one-time password) will be sent to the email address of the AI agent's owner.

Once the OTP has been clicked, the Agent owner will be redirected to the application, where the transaction information will be displayed with a button to approve the transaction. Approval allows the Agent's PKP to sign and broadcast the transaction to the blockchain. The transaction will then be marked as `APPROVED` in the database.

### Prerequisites

Before we get started, you'll need to have the following:

- A Lit Protocol PKP minted to an Ethereum wallet
- A Stytch project
- An OpenAI API key

More details on how to set these up can be found below.

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

### Step 2: Mint a PKP

Mint a PKP to an Ethereum wallet and add it to the `.env` file.

You can mint a PKP by going to [Lit Explorer](https://explorer.litprotocol.com/) and signing in with your Ethereum wallet. After signing in, click on the `Mint a new PKP` button. The webpage will prompt your wallet to pay for the mint fee using Lit's `tstLPX` tokens, which can be acquired at the [Lit Faucet](https://chronicle-yellowstone-faucet.getlit.dev/). After minting, you can go to the [Profile](https://explorer.litprotocol.com/profile) page to view your PKP. For the PKP which you will be using, please fund its wallet with `tstLPX` tokens at the faucet as well. This is because this example agent will perfrom transactions of sending tstLPX tokens on Lit's `Chronicle Yellowstone` blockchain.

You will then copy the PKP's public key and add it to the `.env` file, and the private key of your Ethereum wallet and add it to the `PRIVATE_KEY` field in the `.env` file. Please make sure the private key of the wallet which you provide is the owner of the PKP. 

**Note:** Please do not include the `0x` prefix when adding your PKP public key to the `.env` file.

### Step 3: Setup Ngrok

Our Lit Action for human verification requires an http endpoint. We can use Ngrok to create one.

Download Ngrok from https://ngrok.com/download

In a new terminal, run `ngrok http 3000`. This will create an http endpoint for our application. Copy this URL and add it to the `NEXT_PUBLIC_BASE_URL` field in the `.env` file.

### Step 4: Setup Stytch
Create a Stytch account and project on the [Stytch Dashboard](https://stytch.com/dashboard).

On the dashboard, copy the `public token`, `secret key`, and `project ID` to the `.env` file. You will also need to add the base URL of your application to the `NEXT_PUBLIC_BASE_URL` field in the `.env` file. 

We then need to go to `https://stytch.com/dashboard/redirect-urls` on the Stytch dashboard and add our OTP redirect URLs. For this project, add:

- http://[Your Ngrok URL]/pages/authenticate

- http://[Your Ngrok URL]/pages/authenticate?txHash={}

With login, signup, and invite permissions enabled.

### Step 5: OpenAI API Key

Add your OpenAI API key to the `.env` file. Please make sure that you've enabled the `gpt-4o-mini` model on your API key's project. You can enable this by going to your [project settings](https://platform.openai.com/settings/organization/general), and under the `Project` tab of the sidebar, go to the `Limits` page. From there, you can enable `gpt-4o-mini` by checking it in the `Model usage` section. Alternatively, you can change the model used in this project by editing the [AI Decision](./src/app/api/ai-decision/route.ts) file.

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
