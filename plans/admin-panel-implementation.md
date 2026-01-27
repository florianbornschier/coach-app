# Admin Panel Implementation Plan

## Overview
This plan outlines the implementation of a comprehensive admin panel for the Coach Database application. The admin panel will allow authorized users to manage coach profiles, track advertising data, manage career information, and enable users to save favorites.

## Current System Analysis

### Existing Features
- User authentication (login/signup/password reset)
- Instagram profile scraping via Bright Data
- Coach profile display with filtering
- Supabase database integration
- Dashboard with sidebar navigation

### Database Schema (Current)
```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String?
  phone     String?
  password  String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model CoachProfile {
  id                    String   @id
  username              String   @unique
  fullName              String?
  profilePicture        String?
  bio                   String?
  biography             String?
  externalUrls          String?
  followersCount        Int      @default(0)
  followsCount          Int      @default(0)
  postsCount            Int      @default(0)
  isBusinessAccount     Boolean  @default(false)
  isProfessionalAccount Boolean  @default(false)
  profilePicUrl         String?
  niche                 String?
  verified              Boolean  @default(false)
  isPartial             Boolean  @default(false)
  relatedProfiles       CoachProfile[] @relation("RelatedProfiles")
  relatedTo             CoachProfile[] @relation("RelatedProfiles")
  lastFetched           DateTime @default(now())
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
}
```

## Required Changes

### 1. Database Schema Updates

#### Add Admin Role to User Model
```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String?
  phone     String?
  password  String?
  role      String   @default("user") // "user" | "admin"
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  favorites Favorite[]
}
```

#### Extend CoachProfile Model
```prisma
model CoachProfile {
  // ... existing fields ...
  
  // Career/Contact Information
  careerPageUrl     String?
  contactEmail      String?
  contactPhone      String?
  applicationUrl    String?
  
  // Ads Tracking
  metaAdsLibraryUrl   String?
  googleAdsLibraryUrl String?
  isRunningAds        Boolean @default(false)
  lastAdsCheck        DateTime?
  
  // Additional metadata
  notes             String?
  tags              String[] // For categorization
  
  favorites         Favorite[]
}
```

#### Create Favorite Model
```prisma
model Favorite {
  id              String        @id @default(uuid())
  userId          String
  coachProfileId  String
  user            User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  coachProfile    CoachProfile  @relation(fields: [coachProfileId], references: [id], onDelete: Cascade)
  createdAt       DateTime      @default(now())
  
  @@unique([userId, coachProfileId])
  @@index([userId])
  @@index([coachProfileId])
}
```

### 2. Admin Authentication & Authorization

#### Middleware for Admin Routes
- Create middleware to check user role
- Protect `/admin/*` routes
- Redirect unauthorized users

#### Admin User Setup
- Add migration to create initial admin user
- Or provide admin registration with secret key

### 3. Admin Panel Structure

```
/admin
├── /dashboard          # Overview stats
├── /coaches            # List all coaches
│   ├── /[id]          # Edit specific coach
│   └── /new           # Add new coach
├── /import            # Bulk import Instagram accounts
├── /users             # Manage users (optional)
└── /settings          # Admin settings
```

### 4. Admin Panel Features

#### A. Coach Management (CRUD)
- **List View**
  - Searchable/filterable table
  - Pagination
  - Quick actions (edit, delete, view)
  - Bulk operations
  
- **Create/Edit Form**
  - All profile fields
  - Instagram data refresh button
  - Career information section
  - Ads tracking URLs
  - Tags/notes
  - Image upload/URL
  
- **Delete**
  - Confirmation dialog
  - Cascade delete related data

#### B. Instagram Import Feature
- Input field for Instagram URLs (bulk)
- Trigger scraping via Bright Data
- Progress indicator
- Error handling
- Auto-populate coach profiles

#### C. Ads Tracking
- Meta Ads Library URL field
- Google Ads Library URL field
- Quick links to check ads
- Last checked timestamp
- Running ads indicator

#### D. Career Information
- Career page URL
- Contact email
- Contact phone
- Application URL
- Display on public profile (toggle)

### 5. Favorites Functionality

#### User Features
- Heart icon on coach cards
- Favorites page/section
- Persist across sessions
- Remove from favorites

#### Implementation
- API routes for add/remove favorites
- Client-side state management
- Database persistence
- User association

### 6. API Routes

```
POST   /api/admin/coaches          # Create coach
GET    /api/admin/coaches          # List coaches
GET    /api/admin/coaches/[id]     # Get coach
PUT    /api/admin/coaches/[id]     # Update coach
DELETE /api/admin/coaches/[id]     # Delete coach

POST   /api/admin/import           # Import Instagram accounts
GET    /api/admin/import/status    # Check import status

POST   /api/favorites              # Add favorite
DELETE /api/favorites/[id]         # Remove favorite
GET    /api/favorites              # Get user favorites
```

### 7. UI Components

#### Admin Components
- `AdminLayout` - Layout with admin navigation
- `CoachTable` - Data table for coaches
- `CoachForm` - Create/edit form
- `ImportDialog` - Instagram import interface
- `StatsCards` - Dashboard statistics
- `AdsTracker` - Ads tracking interface

#### User Components (Enhanced)
- `FavoriteButton` - Toggle favorite
- `FavoritesList` - Display favorites
- `CareerInfo` - Display career details
- `AdsIndicator` - Show if running ads

## Implementation Steps

### Phase 1: Database & Auth
1. Update Prisma schema
2. Run migrations
3. Create admin middleware
4. Add role-based access control
5. Create initial admin user

### Phase 2: Admin Panel Core
1. Create admin layout
2. Build dashboard page
3. Implement coach list view
4. Create coach form (create/edit)
5. Add delete functionality

### Phase 3: Advanced Features
1. Instagram import interface
2. Ads tracking fields
3. Career information management
4. Bulk operations

### Phase 4: Favorites
1. Create Favorite model
2. API routes for favorites
3. UI components
4. Favorites page

### Phase 5: Testing & Polish
1. Test all CRUD operations
2. Test import functionality
3. Test favorites
4. Add loading states
5. Error handling
6. Responsive design

## Technical Considerations

### Security
- Admin routes protected by middleware
- CSRF protection
- Input validation
- SQL injection prevention (Prisma handles this)
- XSS prevention

### Performance
- Pagination for large datasets
- Lazy loading
- Caching strategies
- Optimistic UI updates

### UX
- Loading indicators
- Success/error messages
- Confirmation dialogs
- Keyboard shortcuts
- Responsive design

## File Structure

```
app/
├── admin/
│   ├── layout.tsx
│   ├── page.tsx (dashboard)
│   ├── coaches/
│   │   ├── page.tsx (list)
│   │   ├── [id]/
│   │   │   └── page.tsx (edit)
│   │   └── new/
│   │       └── page.tsx (create)
│   └── import/
│       └── page.tsx
├── api/
│   ├── admin/
│   │   ├── coaches/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       └── route.ts
│   │   └── import/
│   │       └── route.ts
│   └── favorites/
│       ├── route.ts
│       └── [id]/
│           └── route.ts
├── favorites/
│   └── page.tsx
└── middleware.ts (admin auth)

components/
├── admin/
│   ├── AdminLayout.tsx
│   ├── CoachTable.tsx
│   ├── CoachForm.tsx
│   ├── ImportDialog.tsx
│   ├── StatsCards.tsx
│   └── AdsTracker.tsx
└── FavoriteButton.tsx

lib/
├── admin/
│   ├── auth.ts
│   └── permissions.ts
└── favorites.ts
```

## Dependencies to Add

```json
{
  "@tanstack/react-table": "^8.x", // For admin tables
  "react-hook-form": "^7.x",       // For forms
  "zod": "^3.x",                   // Already installed
  "@radix-ui/react-dialog": "^1.x", // For modals
  "@radix-ui/react-toast": "^1.x"  // For notifications
}
```

## Migration Strategy

1. Create backup of current database
2. Test schema changes in development
3. Run migrations on production
4. Create admin user
5. Deploy admin panel
6. Monitor for issues

## Success Criteria

- ✅ Admin can create, read, update, delete coach profiles
- ✅ Admin can bulk import Instagram accounts
- ✅ Ads tracking URLs are stored and displayed
- ✅ Career information is manageable
- ✅ Users can save and view favorites
- ✅ All operations are secure and performant
- ✅ UI is intuitive and responsive

## Timeline Estimate

- Phase 1: Database & Auth - 2-3 hours
- Phase 2: Admin Panel Core - 4-5 hours
- Phase 3: Advanced Features - 3-4 hours
- Phase 4: Favorites - 2-3 hours
- Phase 5: Testing & Polish - 2-3 hours

**Total: 13-18 hours**

## Next Steps

1. Review and approve this plan
2. Begin Phase 1 implementation
3. Iterate based on feedback
4. Deploy incrementally
