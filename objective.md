// objective.md

### **Project Requirements: Car Part Shop Management System**

#### **1. Authentication & User Management (AUTH)**
- Implement a secure auth system where **only authorized users (with appropriate roles)** can create new users.
- New users receive credentials via **email or SMS** (temporary password + username) based on provided contact info.
- First-time login requires **password change** before accessing any features (track via `isFirstLogin` flag).
- Admin should choose between **email/SMS** when creating a user.
- **Services to use**:
  - Email: Nodemailer / SendGrid
  - SMS: use services other than Twilio

#### **2. Vehicle Management**
- Store vehicle details (VIN, make, model, auction price, etc.).
- Track part extraction status via `isPartedOut` (boolean).

#### **3. Vehicle Profit Tracking**
- Record **profit/loss** per vehicle by aggregating part sales.
- Update profit metrics on each transaction.

#### **4. Parts & Categories**
- Parts belong to **categories/subcategories** (e.g., `Engine → Turbocharger`).
- Include part details (condition, price, vehicle source, etc.).

#### **5. Orders & Delivery**
- Orders can contain **multiple items**.
- Track delivery method (**pickup** or **shipping**).
- Record **discounts** per item.

#### **6. Reports (CSV/PDF)**
- Generate:
  - **Sales reports** (by date, customer, etc.).
  - **Inventory reports** (stock levels, part status).
  - **Profit reports** (vehicle/part profitability).
- **Monthly cron job** to compile all reports into a single file (PDF/CSV).
- **Libraries**: PDFKit, csv-writer.

#### **7. Audit Logs**
- Log **all CRUD operations** (user, timestamp, action).

#### **8. Notifications**
- Trigger alerts for:
  - User creation.
  - Report generation.
- Use **WebSockets** or email/SMS.

#### **9. Tech Stack**
- **Database**: Supabase (PostgreSQL).
- **Queuing**: BullMQ/RabbitMQ (for async tasks like emails/reports).
- **Caching**: Redis.
- **API Docs**: Swagger/OpenAPI.
- **Image Storage**: Cloudinary (for vehicle/part/user images).

#### **10. Image Management**
- Entities: use image entities for storing image info and types

---

### **Additional Notes for Cursor AI:**
- Prioritize **clean, modular code** (e.g., separate services for auth, notifications, etc.).
- Use **Dependency Injection** for testability.
- Ensure **role-based access control** (RBAC) for all sensitive operations.
- for entity creation refer yourself to the tables folder
- use the existing folder structure
- the modules will contain service and covtroller and module file
