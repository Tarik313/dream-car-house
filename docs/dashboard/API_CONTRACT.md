# Dashboard API contract

## Implemented management authentication endpoints

Base: `/api/v1/dashboard/` on the existing Django origin. Uses SessionAuthentication with CSRF enforcement on state-changing methods, JSONRenderer (never public DefaultRenderer), and emits strict privacy and indexing headers:

```http
Cache-Control: private, no-store, must-revalidate
X-Robots-Tag: noindex, nofollow, noarchive
```

### 1. `POST /api/v1/dashboard/auth/login/`
Authenticates credentials against Django's active staff user accounts. Enforces in-memory rate limiting / IP throttling. Returns generic "Invalid credentials." errors to prevent user enumeration.

- **Request Body:**
  ```json
  {
    "username": "staff_member",
    "password": "secret_password"
  }
  ```
- **Success Response (200 OK):**
  - Sets HttpOnly, Secure (in production), SameSite=Lax `sessionid` and `csrftoken` cookies.
  - Body:
    ```json
    {
      "success": true,
      "data": {
        "user": {
          "id": 1,
          "username": "staff_member",
          "email": "staff@begautos.com",
          "is_staff": true,
          "is_superuser": false,
          "permissions": ["inventory.view_inventory"]
        },
        "csrf_token": "..."
      }
    }
    ```
- **Error Responses (403 Forbidden / 429 Too Many Requests):**
  ```json
  {"success": false, "error": {"code": "INVALID_CREDENTIALS", "message": "Invalid credentials."}}
  ```
  ```json
  {"success": false, "error": {"code": "THROTTLED", "message": "Too many login attempts. Please try again later."}}
  ```

### 2. `POST /api/v1/dashboard/auth/logout/`
Flushes the active Django session and clears session cookies.
- **Request Headers:**
  - `Cookie: sessionid=...`
  - `X-CSRFToken: ...`
- **Response (200 OK):**
  ```json
  {"success": true, "data": {"message": "Logged out successfully."}}
  ```

### 3. `GET /api/v1/dashboard/auth/me/`
Returns current authenticated active staff user details, superuser flag, and complete model permissions (`app_label.action_model`).
- **Request Headers:**
  - `Cookie: sessionid=...`
- **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": 1,
        "username": "staff_member",
        "email": "staff@begautos.com",
        "is_staff": true,
        "is_superuser": false,
        "permissions": ["inventory.view_inventory"]
      }
    }
  }
  ```
- **Unauthenticated Response (401 Unauthorized / 403 Forbidden):**
  ```json
  {"success": false, "error": {"code": "UNAUTHENTICATED", "message": "Authentication required."}}
  ```

### 4. `GET /api/v1/dashboard/access/`
Active staff probe endpoint. Verifies valid session and active staff status.
- **Response (200 OK):**
  ```json
  {"success": true, "data": {"authenticated": true, "user_id": 1, "username": "staff_member"}}
  ```
- **Anonymous Response (403 Forbidden):**
  ```json
  {"success": false, "error": {"code": "FORBIDDEN", "message": "You do not have permission to perform this action."}}
  ```

---

## Implemented Brands & Model Generations management endpoints

Strictly requires active staff + explicit Django model permissions (`app_label.view_<model>`, `add_<model>`, `change_<model>`, `delete_<model>`).

### 1. Brands Management (`/api/v1/dashboard/brands/`)
- `GET /api/v1/dashboard/brands/?q=&status=&segment=&ordering=&page=&page_size=`: Paginated brand catalog query. Requires `inventory.view_brand`.
- `POST /api/v1/dashboard/brands/`: Creates brand (multipart or JSON). Enforces unique brand name and validates JSON-LD schema. Requires `inventory.add_brand`.
- `GET /api/v1/dashboard/brands/<id>/`: Fetches brand detail. Requires `inventory.view_brand`.
- `PATCH /api/v1/dashboard/brands/<id>/`: Partial update with validation. Requires `inventory.change_brand`.
- `GET /api/v1/dashboard/brands/<id>/impact/`: Returns cascade impact before deletion (`inventory_count`, `model_generation_count`, `has_cascades`, `blocked`, `block_reason`).
- `DELETE /api/v1/dashboard/brands/<id>/`:
  - If `inventory_count > 0`: Returns `409 Conflict` (`PROTECTED_CASCADE`), strictly blocking deletion in this phase to prevent vehicle data loss.
  - If `inventory_count == 0` and `model_count > 0`: Requires `confirm=true` (or returns `409 Conflict` `CASCADE_IMPACT`).
  - If clean: Deletes brand record. Requires `inventory.delete_brand`.

### 2. Model Generations Management (`/api/v1/dashboard/model-generations/`)
- `GET /api/v1/dashboard/model-generations/?brand=&q=&status=&ordering=&page=&page_size=`: Paginated model generations list filtered by parent brand. Requires `inventory.view_modelgeneration`.
- `POST /api/v1/dashboard/model-generations/`: Creates model generation. Enforces valid parent `brand` FK and server-side duplicate check `(brand, model)`. Requires `inventory.add_modelgeneration`.
- `GET /api/v1/dashboard/model-generations/<id>/`: Detail view with parent brand name. Requires `inventory.view_modelgeneration`.
- `PATCH /api/v1/dashboard/model-generations/<id>/`: Partial update. Re-validates `(brand, model)` uniqueness and parent relationship. Requires `inventory.change_modelgeneration`.
- `DELETE /api/v1/dashboard/model-generations/<id>/`: Deletes model generation (sets FK to null on dependent inventory vehicles). Requires `inventory.delete_modelgeneration`.

### 3. Stock Management (`/api/v1/dashboard/stocks/`)
- `GET /api/v1/dashboard/stocks/?q=&status=&ordering=&page=&page_size=`: Paginated showroom stock arrivals and media banners catalog query. Requires `inventory.view_stock`.
- `POST /api/v1/dashboard/stocks/`: Creates stock banner (multipart or JSON). Requires `inventory.add_stock`.
- `GET /api/v1/dashboard/stocks/<id>/`: Fetches stock banner detail. Requires `inventory.view_stock`.
- `PATCH /api/v1/dashboard/stocks/<id>/`: Partial update for stock title, image, or status. Requires `inventory.change_stock`.
- `DELETE /api/v1/dashboard/stocks/<id>/`: Deletes stock banner item (independent media banner, vehicle records unaffected). Requires `inventory.delete_stock`.

### 4. Customer Quotes (`/api/v1/dashboard/quotes/`)
- `GET /api/v1/dashboard/quotes/?q=&car=&ordering=&page=&page_size=`: Paginated customer price enquiries and vehicle quote requests with `select_related('car')`. Requires `inventory.view_inventoryquote`.
- `GET /api/v1/dashboard/quotes/<id>/`: Fetches customer enquiry detail including requested vehicle and customer contact details. Requires `inventory.view_inventoryquote`.
- `PATCH /api/v1/dashboard/quotes/<id>/`: Updates customer contact fields (`name`, `email`, `phone`). Requires `inventory.change_inventoryquote`.
- `DELETE /api/v1/dashboard/quotes/<id>/`: Deletes customer quote enquiry (dependent vehicle records unaffected). Requires `inventory.delete_inventoryquote`.

### 5. Sell Car Submissions (`/api/v1/dashboard/sell-cars/`)
- `GET /api/v1/dashboard/sell-cars/?q=&car_year=&ordering=&page=&page_size=`: Paginated customer car-sale submissions with `prefetch_related('inventory_images')`. Requires `home.view_sellcar`.
- `GET /api/v1/dashboard/sell-cars/<id>/`: Fetches sell car submission detail including customer info, vehicle specs, and submitted photos (`inventory_images`). Requires `home.view_sellcar`.
- `PATCH /api/v1/dashboard/sell-cars/<id>/`: Updates submitted lead contact or vehicle details (`name`, `phone`, `car_name`, `car_model`, `car_year`, `mileage`, `offered_price`). Requires `home.change_sellcar`.
- `DELETE /api/v1/dashboard/sell-cars/<id>/`: Cascading deletion of submission and associated photo records. Requires `home.delete_sellcar`.
- `DELETE /api/v1/dashboard/sell-cars/<sellcar_id>/images/<image_id>/`: Deletes an individual submitted car image with strict ownership boundary enforcement (verifies image belongs to `sellcar_id`). Requires `home.delete_sellyourcarimages`.

### 6. Customer Inbox: Contact Messages (`/api/v1/dashboard/contact-messages/`)
- `GET /api/v1/dashboard/contact-messages/?q=&topic=&preferred_contact=&ordering=&page=&page_size=`: Paginated customer contact enquiries with multi-field search and filters. Requires `home.view_contactmessage`.
- `GET /api/v1/dashboard/contact-messages/<id>/`: Fetches contact message detail including customer name, phone, email, vehicle of interest, preferred channel, and complete submitted message text. Requires `home.view_contactmessage`.
- `PATCH /api/v1/dashboard/contact-messages/<id>/`: Updates customer contact fields or message content. Requires `home.change_contactmessage`.
- `DELETE /api/v1/dashboard/contact-messages/<id>/`: Permanently deletes message from `tbl_contact_messages`. Requires `home.delete_contactmessage`.

### 7. Customer Inbox: Subscribers (`/api/v1/dashboard/subscribers/`)
- `GET /api/v1/dashboard/subscribers/?q=&ordering=&page=&page_size=`: Paginated newsletter subscriber email registry with search and sorting. Requires `home.view_subscriber`.
- `GET /api/v1/dashboard/subscribers/<id>/`: Fetches subscriber detail (`id`, `email`). Requires `home.view_subscriber`.
- `PATCH /api/v1/dashboard/subscribers/<id>/`: Updates subscriber email address. Requires `home.change_subscriber`.
- `DELETE /api/v1/dashboard/subscribers/<id>/`: Deletes subscriber entry from `tbl_subscribers`. Requires `home.delete_subscriber`.

### 8. Website Content: Slider Videos (`/api/v1/dashboard/sliders/`)
- `GET /api/v1/dashboard/sliders/?q=&page=&page_size=`: Paginated hero video/banner configurations with search and computed `is_public_active` indicator. Requires `home.view_slider`.
- `POST /api/v1/dashboard/sliders/`: Creates a new slider with required `heading` and media file (`image`). Validates allowed video/image extensions (`.mp4, .webm, .jpg, .jpeg, .png, .webp`). Creation automatically designates the record as the active live selection per `Slider.objects.last()`. Requires `home.add_slider`.
- `GET /api/v1/dashboard/sliders/<id>/`: Fetches slider item detail with `is_public_active`. Requires `home.view_slider`.
- `PATCH /api/v1/dashboard/sliders/<id>/`: Updates slider heading and/or replaces the video file. Requires `home.change_slider`.
- `DELETE /api/v1/dashboard/sliders/<id>/`: Deletes slider record. Deletion of the active record causes fallback to preceding record on the public website API (`GET /api/v1/home/slider/`). Requires `home.delete_slider`.

### 9. Website Content: Social Media Links (`/api/v1/dashboard/social-media/`)
- `GET /api/v1/dashboard/social-media/?q=&page=&page_size=`: Paginated social media links configurations with search and computed `is_public_active` indicator. Requires `home.view_socialmedia`.
- `POST /api/v1/dashboard/social-media/`: Creates a new social media configuration (`facebook` required; `instagram`, `twitter`, `youtube` optional). Validates `http://` or `https://` protocols server-side. Creation designates the record as the active live selection per `SocialMedia.objects.last()`. Requires `home.add_socialmedia`.
- `GET /api/v1/dashboard/social-media/<id>/`: Fetches social media configuration detail with `is_public_active`. Requires `home.view_socialmedia`.
- `PATCH /api/v1/dashboard/social-media/<id>/`: Partial updates to URLs with protocol validation. Requires `home.change_socialmedia`.
- `DELETE /api/v1/dashboard/social-media/<id>/`: Deletes social media configuration. Deletion of the active record causes fallback to preceding record on public website API (`GET /api/v1/home/sm/`). Requires `home.delete_socialmedia`.

### 10. Website Content: Social Features / People Talk About Us (`/api/v1/dashboard/social-features/`)
- `GET /api/v1/dashboard/social-features/?q=&status=&is_featured=&page=&page_size=`: Paginated social features/reviews with title/URL search and status/featured filters. Requires `home.view_peopletalkaboutus`.
- `POST /api/v1/dashboard/social-features/`: Creates a new social feature record (`title` and `image` required; `url`, `status`, `is_featured` optional). Enforces image extension validation (`.jpg, .jpeg, .png, .webp`) and protocol checks (`http://` or `https://`). Requires `home.add_peopletalkaboutus`.
- `GET /api/v1/dashboard/social-features/<id>/`: Fetches social feature detail. Requires `home.view_peopletalkaboutus`.
- `PATCH /api/v1/dashboard/social-features/<id>/`: Updates social feature attributes. Image replacement is optional and retains the existing image if omitted. Requires `home.change_peopletalkaboutus`.
- `DELETE /api/v1/dashboard/social-features/<id>/`: Permanently deletes social feature record. Requires `home.delete_peopletalkaboutus`.
- *Public Contract Note*: The public endpoint `GET /api/v1/home/people-talk/` strictly queries `status=PUBLISHED` ordered by `-updated_at`. Unofficial draft cards remain invisible to public visitors.

### 11. Website Content: Sales Representatives (`/api/v1/dashboard/sales-representatives/`)
- `GET /api/v1/dashboard/sales-representatives/?q=&status=&page=&page_size=`: Paginated sales representative directory with name/phone search and status filter. Requires `home.view_salesrepresentative`.
- `POST /api/v1/dashboard/sales-representatives/`: Creates a new sales representative (`name` and `phone_number` required; `status` defaults to `PUBLISHED`). Requires `home.add_salesrepresentative`.
- `GET /api/v1/dashboard/sales-representatives/<id>/`: Fetches representative detail. Requires `home.view_salesrepresentative`.
- `PATCH /api/v1/dashboard/sales-representatives/<id>/`: Updates representative attributes. Requires `home.change_salesrepresentative`.
- `DELETE /api/v1/dashboard/sales-representatives/<id>/`: Deletes sales representative record. Requires `home.delete_salesrepresentative`.
- *Public Contract Note*: The public endpoint `GET /api/v1/home/sales-representative/` strictly returns representatives with `status=PUBLISHED`.

### 12. SEO Configuration: General Pages (`/api/v1/dashboard/page-seo/`)
- `GET /api/v1/dashboard/page-seo/?q=&visibility=&robots=&page=&page_size=`: Paginated general static page SEO configurations with search across page, title, or keyword, and visibility/robots filters. Requires `seo_config.view_seoconfig`.
- `POST /api/v1/dashboard/page-seo/`: Creates SEO config for a unique page (`page` choices: `home`, `gallery`, `about`, `sell`, `byd-cars`, `contact`). Rejects duplicate page entries. Enforces server-side JSON-LD validation, URL protocol checks, and allowed image extensions (`.jpg, .jpeg, .png, .webp`). Requires `seo_config.add_seoconfig`.
- `GET /api/v1/dashboard/page-seo/<id>/`: Fetches complete SEO metadata including Open Graph and Twitter overrides. Requires `seo_config.view_seoconfig`.
- `PATCH /api/v1/dashboard/page-seo/<id>/`: Updates metadata with support for image replacement and partial preservation. Requires `seo_config.change_seoconfig`.
- `DELETE /api/v1/dashboard/page-seo/<id>/`: Deletes SEO config record. Requires `seo_config.delete_seoconfig`.
- *Public Contract Note*: Public endpoint `GET /api/v1/site-config/seo/<page>/` returns 404 when unconfigured, allowing frontend pages to fall back to hardcoded defaults.

### 13. SEO Configuration: Category & Listing Pages (`/api/v1/dashboard/category-seo/`)
- `GET /api/v1/dashboard/category-seo/?q=&visibility=&robots=&page=&page_size=`: Paginated listing page SEO configurations (`cars`, `brand-new`, `pre-owned`, `brand`) with editorial copy (`h1_title`, `short_description`, `long_description`). Requires `seo_config.view_categorypageseo`.
- `POST /api/v1/dashboard/category-seo/`: Creates category SEO config. Rejects duplicate page selections. Enforces valid JSON-LD and URL format. Requires `seo_config.add_categorypageseo`.
- `GET /api/v1/dashboard/category-seo/<id>/`: Fetches category SEO detail and editorial HTML copy. Requires `seo_config.view_categorypageseo`.
- `PATCH /api/v1/dashboard/category-seo/<id>/`: Updates editorial copy, robots directive, and meta tags. Requires `seo_config.change_categorypageseo`.
- `DELETE /api/v1/dashboard/category-seo/<id>/`: Deletes category SEO record. Requires `seo_config.delete_categorypageseo`.
- *Public Contract Note*: Public endpoint `GET /api/v1/site-config/category-seo/<page>/` returns 404 when unconfigured, falling back safely to hardcoded listing defaults.

### 14. User Accounts Management (`/api/v1/dashboard/users/`)
- `GET /api/v1/dashboard/users/?q=&is_staff=&is_active=&group=&page=&page_size=`: Server-paginated listing of user accounts. Supports case-insensitive query searching across username, first_name, last_name, and email, with filters for staff status, active state, and assigned group. Requires `auth.view_user`.
- `POST /api/v1/dashboard/users/`: Creates a user account with optional group and permission assignments. Enforces password validation via Django's password validation APIs. Excludes password and password hashes from all serialization responses. Prevents non-superusers from setting `is_superuser=True`. Requires `auth.add_user`.
- `GET /api/v1/dashboard/users/<id>/`: Fetches complete account detail including group assignments and direct permissions. Never reveals passwords or hashes. Requires `auth.view_user`.
- `PATCH /api/v1/dashboard/users/<id>/`: Updates account details. Rejects privilege escalation attempts from non-superusers (cannot elevate oneself or others to `is_superuser=True`). Prevents deactivating or demoting the last active administrator. Validates passwords using Django's password validation APIs when updating credentials. Requires `auth.change_user`.
- `DELETE /api/v1/dashboard/users/<id>/`: Deletes user account. Protects against self-deletion and deletion of the last usable active administrator. Requires `auth.delete_user`.

### 15. User Groups & RBAC Management (`/api/v1/dashboard/groups/`)
- `GET /api/v1/dashboard/groups/?q=&page=&page_size=`: Server-paginated listing of Django Groups with active member counts and assigned permissions. Requires `auth.view_group`.
- `POST /api/v1/dashboard/groups/`: Creates a new permission group. Rejects duplicate group names case-insensitively. Requires `auth.add_group`.
- `GET /api/v1/dashboard/groups/<id>/`: Fetches group detail with assigned permission objects and member count. Requires `auth.view_group`.
- `PATCH /api/v1/dashboard/groups/<id>/`: Updates group name and assigns/revokes permission IDs. Requires `auth.change_group`.
- `DELETE /api/v1/dashboard/groups/<id>/`: Deletes group and removes associated permission links safely. Requires `auth.delete_group`.

### 16. Permissions Catalog (`/api/v1/dashboard/permissions/`)
- `GET /api/v1/dashboard/permissions/`: Returns full catalog of Django system permissions (`id`, `name`, `codename`, `app_label`). Accessible to superusers or staff users with user/group management rights.

### 17. Overview & Bounded Aggregates (`/api/v1/dashboard/overview/`)
- `GET /api/v1/dashboard/overview/`: Computes permission-scoped real-time ORM aggregates across authorized datasets and returns bounded recent submissions. Omit metrics for unpermitted models. Accessible to any active staff member.
  - **Metrics**:
    - `inventory` (gated by `inventory.view_inventory`): total, available, sold, booked, pre_order.
    - `stocks` (gated by `inventory.view_stock`): total, published, unpublished.
    - `quotes` (gated by `inventory.view_inventoryquote`): total.
    - `sell_cars` (gated by `home.view_sellcar`): total.
    - `contact_messages` (gated by `home.view_contactmessage`): total, buying, selling, after_sales, other.
    - `subscribers` (gated by `home.view_subscriber`): total.
    - `users` (gated by `auth.view_user`): total, active, staff, superuser.
    - `groups` (gated by `auth.view_group`): total.
  - **Recent Submissions** (bounded to latest 5 items per permitted module):
    - `quotes`: id, name, email, phone, car_name, created_at.
    - `sell_cars`: id, name, phone, car_name, car_model, car_year, offered_price, mileage.
    - `contact_messages`: id, name, topic, topic_display, phone, email, vehicle, created_at.

---

## Server-only BFF client

`lib/server/api.ts` and `lib/server/auth.ts` provide server-only authenticated request wrappers:
- `getDashboardAccess()`: Reads `sessionid` and `csrftoken` from Next.js cookie store, verifies against `auth/me/`, and decodes user profile and permissions.
- `getManagementAccess()`: Reusable gate for protected Server Components. Fails closed with typed error before querying business services.
- `hasPermission(user, permission)`: Model permission helper validating e.g. `inventory.view_inventory` with superuser bypass.
- `validateSafeRedirect(target, fallback)`: Prevents Open Redirect attacks by validating relative paths and rejecting scheme-relative/protocol paths.

Cookies are maintained as:
- `sessionid`: HttpOnly, Secure in production, SameSite=Lax, Path=/
- `csrftoken`: Secure in production, SameSite=Lax, Path=/

Credentials, tokens, and backend secrets are never placed in `localStorage`, public cookies, or `NEXT_PUBLIC_*` variables.

---

## Existing public contracts: unchanged

`apis.renderers.DefaultRenderer`, public pagination, inventory filters/details, contact form endpoints, and sitemaps remain untouched and isolated from the dashboard API namespace.
