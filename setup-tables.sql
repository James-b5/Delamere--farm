-- Create User table
CREATE TABLE "User" (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE NOT NULL,
  "emailVerified" BOOLEAN DEFAULT false,
  image VARCHAR(255),
  "passwordHash" VARCHAR(255) NOT NULL,
  role VARCHAR(255) DEFAULT 'USER',
  "isActive" BOOLEAN DEFAULT true,
  phone VARCHAR(255),
  address VARCHAR(255),
  "verificationToken" VARCHAR(255),
  "passwordResetToken" VARCHAR(255),
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Create Product table
CREATE TABLE "Product" (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  price FLOAT NOT NULL,
  stock INT DEFAULT 0,
  deleted BOOLEAN DEFAULT false,
  images TEXT DEFAULT '[]',
  videos TEXT DEFAULT '[]',
  specs TEXT DEFAULT '{}',
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Create Order table
CREATE TABLE "Order" (
  id VARCHAR(255) PRIMARY KEY,
  "userId" VARCHAR(255),
  "totalAmount" FLOAT NOT NULL,
  status VARCHAR(255) DEFAULT 'PENDING',
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY ("userId") REFERENCES "User"(id)
);

-- Create OrderItem table
CREATE TABLE "OrderItem" (
  id VARCHAR(255) PRIMARY KEY,
  "orderId" VARCHAR(255) NOT NULL,
  "productId" VARCHAR(255) NOT NULL,
  quantity INT DEFAULT 1,
  price FLOAT NOT NULL,
  FOREIGN KEY ("orderId") REFERENCES "Order"(id),
  FOREIGN KEY ("productId") REFERENCES "Product"(id)
);

-- Create Review table
CREATE TABLE "Review" (
  id VARCHAR(255) PRIMARY KEY,
  "productId" VARCHAR(255) NOT NULL,
  "userId" VARCHAR(255) NOT NULL,
  rating INT DEFAULT 5,
  comment TEXT,
  "isApproved" BOOLEAN DEFAULT false,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY ("productId") REFERENCES "Product"(id),
  FOREIGN KEY ("userId") REFERENCES "User"(id)
);

-- Create CartItem table
CREATE TABLE "CartItem" (
  id VARCHAR(255) PRIMARY KEY,
  "userId" VARCHAR(255) NOT NULL,
  "productId" VARCHAR(255) NOT NULL,
  quantity INT DEFAULT 1,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY ("userId") REFERENCES "User"(id),
  FOREIGN KEY ("productId") REFERENCES "Product"(id)
);

-- Create WeatherCache table
CREATE TABLE "WeatherCache" (
  id VARCHAR(255) PRIMARY KEY,
  location VARCHAR(255) NOT NULL,
  data TEXT NOT NULL,
  "fetchedAt" TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX "User_email_idx" ON "User"(email);
CREATE INDEX "Order_userId_idx" ON "Order"("userId");
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");
CREATE INDEX "OrderItem_productId_idx" ON "OrderItem"("productId");
CREATE INDEX "Review_productId_idx" ON "Review"("productId");
CREATE INDEX "Review_userId_idx" ON "Review"("userId");
CREATE INDEX "CartItem_userId_idx" ON "CartItem"("userId");
CREATE INDEX "CartItem_productId_idx" ON "CartItem"("productId");
CREATE INDEX "WeatherCache_location_idx" ON "WeatherCache"(location);
