# Mintlify search powered by Trieve

## Setup

### Install Packages 

`npm install` 

### Environment Variables

**Make sure you use the same 

```
cp .env .env.dist
```

Then, you have two options to get environment variables for Trieve:

#### Use dashboard.trieve.ai

1. Go to [https://dashboard.trieve.ai] and register or sign in
2. Press "create dataset" from the page for your automatically created organization
3. Copy the `DATASET_ID` value to your `.env` as the value for `VITE_TRIEVE_DATASET_ID` 
4. Create a new `read only level` `API_KEY` and copy its value for `VITE_TRIEVE_API_KEY`

#### Use the CLI

Warning! You must have `cargo` and some build tools installed to use the CLI. 

```
cargo install trieve 
trieve login
trieve api-key generate
trieve dataset create
```

Then copy your `API_KEY` value to the `.env` file for `VITE_TRIEVE_API_KEY` and the `DATASET_ID` for `VITE_TRIEVE_DATASET_ID`

## Deploying

### Build

`npm run build`

### Deploy

Simply point your reverse proxy (nginx, caddy, etc.) at the dist folder where the build is stored. 
