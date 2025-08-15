

```
src/
├── app.controller.ts                    # Main application controller
├── app.module.ts                        # Root application module
├── app.service.ts                       # Main application service
├── main.ts                             # Application entry point
│
├── common/                             # Shared utilities and common code
│   ├── constants/                      # Application constants (empty)
│   ├── decorator/                      # Custom decorators (empty)
│   ├── enum/                          # Enums and type definitions
│   │   └── entity.enum.ts             # Entity-related enums (ImageEnum, NotificationEnum, OrderStatusEnum, etc.)
│   ├── module.ts                      # will servive as a module for all service such as auth, auditlog, user, order
│
├── config/                            # Configuration files
│
├── dto/                               # Data Transfer Objects
│   ├── request/                       # Request DTOs (empty - to be populated)
│   └── response/                      # Response DTOs (empty - to be populated)
│
├── entities/                          # TypeORM entities
│   ├── base.entity.ts                 # Base entity with common fields
│   ├── audit-log.entity.ts            # Audit logging entity
│   ├── category.entity.ts             # Product/part categories
│   ├── image.entity.ts                # Image management entity
│   ├── notification.entity.ts         # User notifications
│   ├── order.entity.ts                # Customer orders
│   ├── order-item.entity.ts           # Individual order items
│   ├── part.entity.ts                 # Auto parts/products
│   ├── password-reset-token.entity.ts # Password reset tokens
│   ├── report.entity.ts               # Business reports
│   ├── user.entity.ts                 # User accounts
│   ├── vehicle.entity.ts              # Vehicle information
│   └── vehicle-profit.entity.ts       # Vehicle profit tracking
│
├── modules/                           # Feature modules
│   └── auditLog/                      # Audit logging module
│       ├── auditLog.controller.ts     # Audit log controller
│       └── auditLog.service.ts        # Audit log service
│
└── seed/                              # Database seeding (empty - to be populated)
