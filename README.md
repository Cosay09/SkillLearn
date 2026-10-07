# Terminal 1
cd server
npm run dev

# Terminal 2
cd client
npm run dev

git add .
git commit -m "chore: set up client and server skeleton"
git push -u origin develop

Teammates then run git clone, npm install inside both client and server, copy .env.example to .env and fill it in, and they are ready.