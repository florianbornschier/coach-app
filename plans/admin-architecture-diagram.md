# Admin Panel Architecture Diagram

## System Architecture

```mermaid
graph TB
    subgraph Client["Client Layer"]
        UI[User Interface]
        AdminUI[Admin Interface]
        FavUI[Favorites UI]
    end
    
    subgraph Auth["Authentication Layer"]
        Middleware[Auth Middleware]
        RoleCheck[Role Check]
    end
    
    subgraph API["API Layer"]
        AdminAPI[Admin API Routes]
        FavAPI[Favorites API]
        InstagramAPI[Instagram API]
    end
    
    subgraph Services["Service Layer"]
        BrightData[Bright Data Service]
        Cache[Cache Service]
    end
    
    subgraph Database["Database Layer"]
        Users[(Users Table)]
        Coaches[(CoachProfile Table)]
        Favorites[(Favorites Table)]
    end
    
    UI --> Middleware
    AdminUI --> Middleware
    FavUI --> Middleware
    
    Middleware --> RoleCheck
    RoleCheck --> AdminAPI
    RoleCheck --> FavAPI
    
    AdminAPI --> Coaches
    AdminAPI --> BrightData
    FavAPI --> Favorites
    InstagramAPI --> BrightData
    
    BrightData --> Cache
    Cache --> Coaches
    
    Favorites --> Users
    Favorites --> Coaches
```

## Database Schema Relationships

```mermaid
erDiagram
    User ||--o{ Favorite : has
    CoachProfile ||--o{ Favorite : favorited_by
    CoachProfile ||--o{ CoachProfile : related_to
    
    User {
        string id PK
        string email UK
        string name
        string phone
        string password
        string role
        datetime createdAt
        datetime updatedAt
    }
    
    CoachProfile {
        string id PK
        string username UK
        string fullName
        string profilePicture
        string bio
        int followersCount
        string niche
        boolean verified
        string careerPageUrl
        string contactEmail
        string metaAdsLibraryUrl
        string googleAdsLibraryUrl
        boolean isRunningAds
        string notes
        datetime createdAt
        datetime updatedAt
    }
    
    Favorite {
        string id PK
        string userId FK
        string coachProfileId FK
        datetime createdAt
    }
```

## Admin Panel Flow

```mermaid
flowchart TD
    Start[User Accesses /admin] --> CheckAuth{Authenticated?}
    CheckAuth -->|No| Login[Redirect to Login]
    CheckAuth -->|Yes| CheckRole{Is Admin?}
    CheckRole -->|No| Deny[Access Denied]
    CheckRole -->|Yes| Dashboard[Admin Dashboard]
    
    Dashboard --> Actions{Choose Action}
    
    Actions --> ListCoaches[View Coaches List]
    Actions --> CreateCoach[Create New Coach]
    Actions --> ImportIG[Import Instagram]
    Actions --> ManageUsers[Manage Users]
    
    ListCoaches --> EditCoach[Edit Coach]
    ListCoaches --> DeleteCoach[Delete Coach]
    
    CreateCoach --> FillForm[Fill Coach Form]
    FillForm --> SaveCoach[Save to Database]
    
    ImportIG --> EnterURLs[Enter Instagram URLs]
    EnterURLs --> TriggerScrape[Trigger Bright Data]
    TriggerScrape --> ProcessData[Process & Save]
    
    EditCoach --> UpdateForm[Update Form]
    UpdateForm --> SaveChanges[Save Changes]
    
    DeleteCoach --> Confirm{Confirm Delete?}
    Confirm -->|Yes| RemoveDB[Remove from DB]
    Confirm -->|No| ListCoaches
```

## Favorites Feature Flow

```mermaid
flowchart TD
    User[User Views Coach] --> FavButton{Click Favorite}
    FavButton --> CheckLogin{Logged In?}
    CheckLogin -->|No| LoginPrompt[Prompt Login]
    CheckLogin -->|Yes| CheckFav{Already Favorited?}
    
    CheckFav -->|No| AddFav[Add to Favorites]
    CheckFav -->|Yes| RemoveFav[Remove from Favorites]
    
    AddFav --> UpdateDB[Update Database]
    RemoveFav --> UpdateDB
    UpdateDB --> UpdateUI[Update UI State]
    
    User --> ViewFavs[View Favorites Page]
    ViewFavs --> LoadFavs[Load User Favorites]
    LoadFavs --> DisplayFavs[Display Favorite Coaches]
```

## Component Hierarchy

```mermaid
graph TD
    App[App Root] --> Layout[Layout]
    Layout --> Public[Public Routes]
    Layout --> Protected[Protected Routes]
    Layout --> Admin[Admin Routes]
    
    Public --> Home[Home Page]
    Public --> Login[Login Page]
    Public --> Signup[Signup Page]
    
    Protected --> Dashboard[Dashboard]
    Protected --> Favorites[Favorites Page]
    
    Dashboard --> CoachFinder[Coach Finder]
    CoachFinder --> ProfileCard[Profile Card]
    ProfileCard --> FavoriteButton[Favorite Button]
    
    Admin --> AdminLayout[Admin Layout]
    AdminLayout --> AdminDashboard[Admin Dashboard]
    AdminLayout --> CoachManagement[Coach Management]
    AdminLayout --> ImportInterface[Import Interface]
    
    CoachManagement --> CoachTable[Coach Table]
    CoachManagement --> CoachForm[Coach Form]
    
    CoachForm --> BasicInfo[Basic Info Section]
    CoachForm --> CareerInfo[Career Info Section]
    CoachForm --> AdsTracking[Ads Tracking Section]
    CoachForm --> MetaData[Metadata Section]
```

## API Route Structure

```mermaid
graph LR
    subgraph Public["Public API"]
        GetCoaches[GET /api/coaches]
        GetCoach[GET /api/coaches/id]
    end
    
    subgraph Protected["Protected API"]
        AddFav[POST /api/favorites]
        RemoveFav[DELETE /api/favorites/id]
        GetFavs[GET /api/favorites]
    end
    
    subgraph Admin["Admin API"]
        CreateCoach[POST /api/admin/coaches]
        UpdateCoach[PUT /api/admin/coaches/id]
        DeleteCoach[DELETE /api/admin/coaches/id]
        ImportIG[POST /api/admin/import]
        GetStats[GET /api/admin/stats]
    end
    
    Public --> DB[(Database)]
    Protected --> DB
    Admin --> DB
    Admin --> BrightData[Bright Data API]
```

## Data Flow for Instagram Import

```mermaid
sequenceDiagram
    participant Admin
    participant UI as Admin UI
    participant API as Import API
    participant BD as Bright Data
    participant DB as Database
    participant Cache
    
    Admin->>UI: Enter Instagram URLs
    UI->>API: POST /api/admin/import
    API->>BD: Request profile data
    BD-->>API: Return profile data
    API->>DB: Save coach profiles
    API->>Cache: Update cache
    API-->>UI: Return success + profiles
    UI-->>Admin: Show imported coaches
```

## Security Layers

```mermaid
graph TD
    Request[Incoming Request] --> SSL[SSL/TLS]
    SSL --> NextAuth[NextAuth.js]
    NextAuth --> Session{Valid Session?}
    Session -->|No| Reject[401 Unauthorized]
    Session -->|Yes| Middleware[Auth Middleware]
    Middleware --> RoleCheck{Admin Role?}
    RoleCheck -->|No| Forbidden[403 Forbidden]
    RoleCheck -->|Yes| Validation[Input Validation]
    Validation --> Sanitize[Sanitize Input]
    Sanitize --> Prisma[Prisma ORM]
    Prisma --> Database[(Database)]
```

## State Management

```mermaid
graph LR
    subgraph Client["Client State"]
        LocalState[Local Component State]
        Context[React Context]
        Cache[Client Cache]
    end
    
    subgraph Server["Server State"]
        Session[User Session]
        DBState[Database State]
    end
    
    LocalState --> Context
    Context --> Cache
    Cache <--> Server
    Session --> DBState
```
