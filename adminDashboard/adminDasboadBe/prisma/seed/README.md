# Seed User Instructions

This seed file creates an admin user with the following credentials:

- **Email**: uteadmin@gmail.com
- **Password**: 1234567890
- **Role**: ADMIN
- **Status**: Verified

## How to run the seed:

From the `adminDasboadBe` directory, run:

```bash
npm run seed
```

Or alternatively, you can use Prisma's seed command:

```bash
npx prisma db seed
```

The seed uses `upsert` operation, which means:

- If the user doesn't exist, it will create a new one
- If the user already exists, it will update it with the provided credentials

## What it does:

1. Hashes the password using bcrypt with 10 salt rounds
2. Creates/updates the admin user in the database
3. Sets the user as verified
4. Assigns the ADMIN role

Make sure your database is running and Prisma migrations have been applied before running the seed!
