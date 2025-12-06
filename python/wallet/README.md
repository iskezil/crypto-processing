# Crypto Bot WebApp + Passkey (Demo)

- Python/Flask server with Telegram bot button to open WebApp
- WebApp does **non-custodial** key generation (EVM + TRON + TON) on device
- Passkey/WebAuthn demo: stores only ciphertext + "wrappedDEK" (demo) on server
- EVM ERC-20 transfer signing in browser via ethers v6

## Run
```bash
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt

export TELEGRAM_BOT_TOKEN="123456:ABC"
export WEBAPP_URL="https://your-public-url"  # e.g., ngrok https url
export BOT_USERNAME="your_bot_username"

python app.py
```

Open Telegram, `/start` your bot, press **Open WebApp** button.

> This is a **demo**. For production: real WebAuthn attestation/assertion verification, proper Passkey-based key wrapping, DB, auth, CSRF, rate limits, error handling.
