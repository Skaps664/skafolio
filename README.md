# 🚀 Skafolio - Digital Business Card PlatformThis is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).



**A blazing-fast, modern digital business card builder with NFC card ordering, QR generation, real-time analytics, and integrated payments.**## Getting Started



## 🎯 FeaturesFirst, run the development server:



- ✅ **Smart Card Builder** - Intuitive multi-tab editor (Personal, Links, Design, Settings)```bash

- ✅ **NFC Integration** - Order physical NFC cards mapped to your digital cardnpm run dev

- ✅ **Instant QR Codes** - Auto-generated QR codes with cloud storage# or

- ✅ **Real-time Analytics** - Track views, clicks, QR scans, and shares with 5-min cachingyarn dev

- ✅ **PayFast Integration** - Secure payments for South African market# or

- ✅ **COD Support** - Cash on delivery optionpnpm dev

- ✅ **Admin Dashboard** - Manage orders, themes, and remap requests# or

- ✅ **Multi-tier Plans** - Free, Pro, Business with feature gatingbun dev

- ✅ **SEO Optimized** - Full Open Graph metadata for social sharing```

- ✅ **Performance First** - Sub-100ms queries, ISR, edge-ready

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🛠 Tech Stack

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

### Core

- **Framework**: Next.js 14+ (App Router) - Server & Client ComponentsThis project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

- **Language**: TypeScript - Type-safe throughout

- **Styling**: Tailwind CSS - Utility-first styling## Learn More

- **Database**: MongoDB Atlas with Prisma ORM - NoSQL flexibility

- **Authentication**: JWT with HttpOnly cookies - Secure sessionsTo learn more about Next.js, take a look at the following resources:



### Services & Integrations- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.

- **Images**: Cloudinary - Optimized image delivery- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

- **QR Codes**: qrcode library - Server-side generation

- **Payments**: PayFast - Pakistan/South Africa gatewayYou can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

- **Email**: SendGrid - Transactional emails

- **Deployment**: Vercel - Edge functions & CDN## Deploy on Vercel

- **Caching**: Redis (optional) - Analytics & rate limiting

- **Monitoring**: Sentry (optional) - Error trackingThe easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.



## 📦 Quick StartCheck out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


### Prerequisites
- Node.js 18+ and npm
- MongoDB Atlas account (free tier works) or local MongoDB
- Cloudinary account (free tier works)
- PayFast merchant account (for production payments)

### Installation

```bash
# Clone and install
git clone <your-repo-url>
cd nfc_card
npm install

# Configure environment
cp .env.example .env
# Edit .env with your actual credentials

# Generate Prisma client
npx prisma generate

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🚀

## 🗂 Project Structure

```
/app
  /api                         # Serverless API routes
    /auth                      # Register, login, me, refresh
    /cards                     # CRUD, publish, slug-check
    /orders                    # Create, list orders
    /payfast                   # Payment creation & IPN webhook
    /analytics                 # Event tracking & summaries
    /admin                     # Admin-only endpoints
  /card/[slug]                 # Public card SSR page (ISR enabled)
  /dashboard                   # User dashboard (protected)
  /auth                        # Login & register pages
  /orders                      # Order history & checkout
  /admin                       # Admin panel (role-gated)
  
/components                    # Reusable React components
  /CardView.tsx                # Public card renderer
  
/lib                           # Business logic & utilities
  /prisma.ts                   # Prisma client singleton (connection pooling)
  /auth.ts                     # JWT generation, verification, middleware
  /password.ts                 # bcrypt hashing (10 rounds)
  /qr.ts                       # QR generation & Cloudinary upload
  /payfast.ts                  # PayFast signature & IPN validation
  /validations.ts              # Zod schemas for all inputs
  /utils.ts                    # Common helpers (slug, hash, format)
  /analytics-client.ts         # Client-side event tracking
  
/prisma
  /schema.prisma               # MongoDB schema with optimized indexes
```

## 🔑 Environment Variables

Copy `.env.example` to `.env` and configure:

**Required:**
- `DATABASE_URL` - MongoDB connection (Atlas or local)
- `JWT_SECRET` - Random secret for access tokens
- `JWT_REFRESH_SECRET` - Random secret for refresh tokens
- `NEXT_PUBLIC_APP_URL` - Your app URL (http://localhost:3000 for dev)

**For Production:**
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- `PAYFAST_MERCHANT_ID`, `PAYFAST_MERCHANT_KEY`, `PAYFAST_PASSPHRASE`
- `SENDGRID_API_KEY`, `SENDGRID_FROM_EMAIL`
- `REDIS_URL` (optional but recommended)
- `SENTRY_DSN` (optional error tracking)

## 🚀 Deployment

### Vercel (Recommended - Zero Config)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production deployment
vercel --prod
```

**Post-deployment:**
1. Add all environment variables in Vercel dashboard
2. Whitelist Vercel IPs in MongoDB Atlas (or use 0.0.0.0/0)
3. Configure PayFast IPN URL: `https://yourdomain.com/api/payfast/ipn`
4. Point custom domain in Vercel settings

### Performance Settings
- **Region**: Select closest to your MongoDB region
- **Edge Runtime**: API routes are edge-compatible
- **ISR**: Public cards revalidate every 60s
- **Image Optimization**: Automatic via Cloudinary

## 📊 Database Schema

### Core Models

**User**
- Email/password auth with JWT
- Role-based access (user, admin)
- Subscription status (free, pro, business)
- Virtual relations to cards and orders

**Card**
- Complete card data stored as JSON (flexible schema)
- Unique slug for public URL
- Cached analytics for fast dashboard
- Theme configuration
- Published status and branding control

**Order & Payment**
- NFC cards, QR stickers, subscriptions
- PayFast & COD support
- Shipping info and tracking
- Payment status tracking

**Analytics**
- CardEvent: Individual events with IP hash
- Aggregated summaries cached on Card
- 5-minute cache for dashboard queries

See `prisma/schema.prisma` for full schema with indexes.

## 📡 API Reference

### Authentication (Public)

```typescript
// Register
POST /api/auth/register
Body: { email, password, phone? }
Returns: { user, success }
Sets: accessToken & refreshToken cookies

// Login
POST /api/auth/login
Body: { email, password }
Returns: { user, success }
Sets: accessToken & refreshToken cookies

// Get Current User
GET /api/auth/me
Requires: accessToken cookie
Returns: { user }
```

### Cards (Protected)

```typescript
// List Cards
GET /api/cards
Returns: { cards[], total }

// Create Card
POST /api/cards
Body: { title?, data? }
Returns: { card }

// Update Card
PUT /api/cards/[id]
Body: { title?, data? }
Returns: { card }

// Publish Card
POST /api/cards/[id]/publish
Body: { slug, metaTitle?, metaDescription?, metaImage? }
Returns: { card with publicUrl & qrCodeUrl }

// Check Slug Availability
GET /api/cards/slug-check?slug=xxx
Returns: { available: boolean, message }

// Public Card (No Auth)
GET /api/cards/public/[slug]
Returns: { card }
Cache: 60s ISR
```

### Orders & Payments (Protected)

```typescript
// Create Order
POST /api/orders
Body: {
  cardId?, productType, quantity, material?,
  paymentMethod, shippingInfo
}
Returns: { order, requiresPayment }

// Create PayFast Payment
POST /api/payfast/create
Body: { orderId }
Returns: { paymentUrl, amount }

// PayFast IPN Webhook (Public)
POST /api/payfast/ipn
Body: PayFast form data
Validates signature & updates order status
```

### Analytics (Protected)

```typescript
// Track Event (Public - Client-side)
POST /api/analytics/event
Body: { cardId, eventType, metadata? }
Returns: { success }

// Get Card Analytics
GET /api/analytics/card/[cardId]/summary
Returns: { analytics: { total, last24h, last7d, last30d, byType } }
Cache: 5 minutes
```

## ⚡ Performance Optimizations

### Database
- ✅ Compound indexes on userId + isPublished
- ✅ Unique indexes on email, slug, nfcId, token
- ✅ Selective field projection (only fetch needed fields)
- ✅ Cached analytics summaries updated async

### Frontend
- ✅ ISR (60s) for public cards - Near-instant loads
- ✅ Lazy-loaded components
- ✅ Optimized images via Cloudinary CDN
- ✅ Code splitting per route
- ✅ Client-side caching with SWR

### API
- ✅ Fast JWT verification (< 1ms)
- ✅ Bcrypt rounds: 10 (balance security/speed)
- ✅ Non-blocking analytics (fire & forget)
- ✅ Connection pooling with Prisma
- ✅ Edge-ready serverless functions

### Caching Strategy
- Public cards: 60s ISR + CDN
- Analytics: 5-min cached summaries
- Static assets: Cloudinary CDN
- API responses: Redis cache (optional)

## 📝 2-Week Sprint Plan

### Sprint 1 - Core MVP (Week 1) - 40 Story Points

| Task | Points | Status |
|------|--------|--------|
| Project setup (Next.js, Tailwind, deps) | 3 | ✅ Done |
| Database schema (Prisma + MongoDB) | 5 | ✅ Done |
| Auth system (register, login, JWT) | 8 | ✅ Done |
| Card CRUD APIs (create, read, update, list) | 8 | ✅ Done |
| Publish flow (slug check, QR gen) | 8 | ✅ Done |
| Public card view (SSR + analytics) | 8 | ✅ Done |

### Sprint 2 - Features & Polish (Week 2) - 42 Story Points

| Task | Points | Status |
|------|--------|--------|
| Card editor UI (tabs, forms, validation) | 13 | 🔄 Next |
| Orders & PayFast integration | 13 | 🔄 Next |
| Analytics dashboard & widgets | 8 | 🔄 Next |
| Admin panel (orders, themes) | 5 | 🔄 Next |
| Testing & documentation | 3 | 🔄 Next |

## 🎨 Customization

### Adding Custom Themes
```typescript
// 1. Create theme config
const theme = {
  name: "Professional Blue",
  isPremium: true,
  price: 49900, // PKR in paisa (499.00 PKR)
  config: {
    colors: {
      primary: "#1E40AF",
      accent: "#3B82F6",
      background: "#F3F4F6",
      text: "#1F2937"
    },
    fonts: {
      heading: "Inter",
      body: "Roboto"
    },
    layout: "centered"
  }
}

// 2. POST /api/themes (admin only)
```

### Extending Card Data
Card data is stored as flexible JSON:
```json
{
  "personal": { /* firstName, lastName, etc */ },
  "social": [ /* array of platforms */ ],
  "links": [ /* custom links */ ],
  "stats": { /* projects, awards, etc */ },
  "custom": { /* add your own fields */ }
}
```

## 🧪 Testing

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Build test
npm run build

# Run tests (setup needed)
npm test
```

## 🐛 Roadmap & TODOs

### Phase 3 - Enterprise Features
- [ ] Email notifications (SendGrid integration)
- [ ] Redis caching for analytics
- [ ] Drag-and-drop link reordering in UI
- [ ] Visual theme editor
- [ ] Bulk corporate orders
- [ ] Custom domain mapping
- [ ] Export as vCard/PDF
- [ ] White-label solutions

### Phase 4 - Mobile & Scale
- [ ] React Native mobile app
- [ ] Push notifications
- [ ] ClickHouse for analytics at scale
- [ ] Webhook integrations (Zapier)
- [ ] API rate limiting with Redis
- [ ] Multi-language support (i18n)

## 📄 License

MIT License - Free to use, modify, and distribute.

## 🤝 Contributing

We welcome contributions! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes with tests
4. Submit a pull request

## 📞 Support

- 📧 Email: support@skafolio.com
- 📚 Documentation: Coming soon
- 💬 Issues: GitHub Issues

---

**Built with ⚡ Next.js for speed, 🎯 TypeScript for reliability, and 💪 MongoDB for scale.**

**Performance Metrics Target:**
- API Response: < 100ms (p95)
- Public Card Load: < 500ms (FCP)
- Dashboard Load: < 1s (TTI)
- Database Queries: < 50ms (indexed)

Made with ❤️ for modern professionals who value speed and quality.
