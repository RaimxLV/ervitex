## Ervitex B2B E-commerce Catalog — Implementation Plan

### Phase 1: Enable Lovable Cloud & Database Schema
1. **Enable Lovable Cloud** — provisions Supabase backend
2. **Create database tables:**
   - `products` — name (LV/EN), description, long_description, category, material, min_order, new flag, retail_price, wholesale_price, bulk_discount_percent, bulk_min_qty, printing_techs (array)
   - `product_images` — product_id FK, url, sort_order
   - `product_colors` — product_id FK, name, hex_code
   - `product_sizes` — product_id FK, size (S-5XL)
   - `quote_requests` — name, email, phone, company, product_id, message, status, created_at
   - `user_roles` — user_id FK, role enum (admin)
3. **RLS policies** — public read on products/images/colors/sizes, authenticated admin write, quote insert for anon

### Phase 2: Authentication & Admin Dashboard
4. **Auth pages** — Login page for admin (email/password)
5. **Admin layout** — sidebar with Products, Quotes, Settings
6. **Products CRUD** — list, create, edit, delete with image upload, color/size variant management, pricing fields, printing tech tags
7. **Quote management** — view/filter incoming quote requests

### Phase 3: Public Catalog Enhancement
8. **Connect public catalog to DB** — replace static `products.ts` with Supabase queries
9. **Advanced filtering** — by category, color, printing technology
10. **Product detail** — image slider, social sharing buttons
11. **Request Quote form** — saves to `quote_requests` table + sends email notification

### Phase 4: Data Migration & Email
12. **Migrate existing products** from `products.ts` into database
13. **Email setup** — transactional email for quote notifications to birojs@ervitex.lv

### Design: Maintains existing Tech-Industrial theme (Black/Red/Gray, Montserrat/Inter)