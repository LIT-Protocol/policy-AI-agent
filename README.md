# Lit AI Agent

This repository contains a Next.js application showing the potential of Lit Protocol as an atonomous policy tool for AI agents.

## Overview



### Prerequisites

Before we get started, you'll need to have the following:

- A Stytch project
- A Lit Protocol PKP minted to an Ethereum wallet
- An OpenAI API key

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
Create a Stytch account and project https://stytch.com/dashboard?env=test

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
