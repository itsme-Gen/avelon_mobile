# Avelon Mobile

## Environment Setup

1. Copy the environment template:
   ```bash
   cp .env.example .env
   ```

2. Update `.env` with your configuration:
   - `EXPO_PUBLIC_API_URL`: Your backend API URL (default: `http://localhost:3001/api/v1`)
   - Firebase credentials (for push notifications)
   - WalletConnect Project ID

3. **For physical device testing**: Update `EXPO_PUBLIC_API_URL` to use your machine's local IP:
   ```bash
   # Find your IP
   ipconfig      # Windows
   ifconfig      # Mac/Linux
   
   # Update .env
   EXPO_PUBLIC_API_URL=http://YOUR_LOCAL_IP:3001/api/v1
   ```

## Get started

1. Install dependencies

  --yarn install
   

2. Go to Playstore or App Store and download "Expo Go"

3. Start the app

   --yarn start
   --Then scan the QR code using expo go
   --Make sure the phone and pc/laptop are connected to the same connetion
