# Admin Panel Setup Guide

## Admin Credentials

An admin user has been created with the following credentials:

- **Email**: `admin@coachapp.com`
- **Password**: `admin123`
- **Role**: admin

⚠️ **IMPORTANT**: Change this password after first login!

## Accessing the Admin Panel

1. Start the development server:
   ```bash
   pnpm dev
   ```

2. Navigate to: `http://localhost:3000/login`

3. Login with the admin credentials above

4. After login, access the admin panel at: `http://localhost:3000/admin`

## Admin Panel Features

### Dashboard (`/admin`)
- View statistics (Total Coaches, Verified Coaches, Total Users, Recent Additions)
- Quick actions for common tasks
- Overview of the database

### Coaches Management (`/admin/coaches`)
- List all coaches with pagination
- Search and filter coaches
- Edit coach profiles
- Delete coaches
- Add new coaches manually

### Import (`/admin/import`)
- Bulk import Instagram accounts
- Scrape profile data via Bright Data
- Auto-populate coach profiles

### Settings (`/admin/settings`)
- Admin panel configuration
- User management

## Managing Coaches

### Adding a New Coach
1. Go to `/admin/coaches/new`
2. Fill in the coach details:
   - Basic Info (username, name, bio, etc.)
   - Career Information (career page URL, contact details)
   - Ads Tracking (Meta Ads Library URL, Google Ads Library URL)
   - Metadata (notes, tags)
3. Click "Save"

### Editing a Coach
1. Go to `/admin/coaches`
2. Click on a coach to edit
3. Update the fields
4. Click "Save Changes"

### Deleting a Coach
1. Go to `/admin/coaches`
2. Click the delete button on a coach
3. Confirm deletion

## Database Scripts

### Create Admin User
```bash
npx tsx scripts/create-admin.ts <email> <password> [name]
```

Example:
```bash
npx tsx scripts/create-admin.ts admin@example.com mypassword "Admin User"
```

### List All Users
```bash
npx tsx scripts/list-users.ts
```

### Count Users and Coaches
```bash
npx tsx count_users_script.ts
```

## Security Notes

1. **Change Default Password**: The default admin password should be changed immediately after first login
2. **Admin Role**: Only users with `role: "admin"` can access the admin panel
3. **Protected Routes**: All `/admin/*` routes require authentication and admin role
4. **API Protection**: All admin API routes check for admin role before allowing operations

## Troubleshooting

### Cannot Access Admin Panel
- Ensure you're logged in
- Verify your user has `role: "admin"` in the database
- Check browser console for errors

### Database Connection Issues
- Verify `.env` file has correct `DATABASE_URL` and `DIRECT_URL`
- Ensure Supabase project is active
- Run `npx prisma db push` to sync schema

### Missing Features
- Some features are still in development
- Check the implementation plan in `plans/admin-panel-implementation.md`

## Next Steps

The following features are planned but not yet implemented:

1. ✅ Database schema with admin role, favorites, career info, ads tracking
2. ✅ Admin authentication and authorization
3. ✅ Admin dashboard with statistics
4. ✅ API routes for CRUD operations
5. ⏳ Coach management UI (list, create, edit, delete)
6. ⏳ Instagram import interface
7. ⏳ Favorites functionality
8. ⏳ User management interface

## Support

For issues or questions, refer to:
- Implementation plan: `plans/admin-panel-implementation.md`
- Architecture diagrams: `plans/admin-architecture-diagram.md`
