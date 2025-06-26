---
# ===== scripts/setup.sh =====
#!/bin/bash

echo "🚀 Setting up Exnaton Energy Data API..."

# Create directories
mkdir -p data tests scripts k8s

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Setup database
echo "🗄️ Setting up database..."
npx prisma generate
npx prisma migrate dev --name init

# Create sample data files (you'll need to place your JSON files here)
echo "📊 Setting up data directory..."
echo "Please place your JSON files in the ./data/ directory:"
echo "  - 95ce3367-cbce-4a4d-bbe3-da082831d7bd.json"
echo "  - 1db7649e-9342-4e04-97c7-f0ebb88ed1f8.json"

# Run tests
echo "🧪 Running tests..."
npm test

echo "✅ Setup complete! Run 'npm run dev' to start the server."

---
