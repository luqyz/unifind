# Lost & Found App

A React + Firebase application for tracking lost and found items in a community-driven environment. This app helps community members safely reconnect lost items with their owners through a verified, moderated platform.

## Features

✅ **Public feed** - Browse all lost/found listings with search and filtering
✅ **Advanced filtering** - Search by keyword, category, location, type (lost/found)
✅ **Authenticated posting** - Only logged-in users can post listings
✅ **Image upload** - Store item images securely with Firebase Storage
✅ **Safe contact system** - Message users through in-app messaging (no public emails/phones)
✅ **Verification badges** - Show account age and verification status for trust
✅ **Mark resolved** - Close listings once items are found/claimed
✅ **Report listings** - Flag spam, misleading, or inappropriate content
✅ **Admin moderation** - Admins can review reports and manage content

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19 + Vite |
| **Styling** | Tailwind CSS v4 |
| **Authentication** | Firebase Auth (Email + Google Sign-in) |
| **Database** | Firestore (NoSQL) |
| **File Storage** | Firebase Storage |
| **Hosting** | Firebase Hosting |
| **Version Control** | Git/GitHub |

## Local Setup

### Prerequisites
- Node.js 18+ and npm
- Firebase CLI (`npm install -g firebase-tools`)
- GitHub account (for version control)

### Step 1: Clone or Create Project
```bash
git clone <your-repo-url>
cd lost-and-found-app
npm install
```

### Step 2: Set Up Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create Project" and follow the prompts
3. Add a web app to your project
4. Copy the Firebase config values (shown on the config page)
5. Create a `.env.local` file (copy from `.env.example`):
   ```bash
   VITE_FIREBASE_API_KEY=your_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

### Step 3: Configure Firebase Services
In the Firebase Console:

**Authentication:**
- Go to Authentication > Sign-in method
- Enable "Email/Password"
- Enable "Google" (add authorized domains)

**Firestore:**
- Go to Firestore Database
- Create database in production mode
- Region: choose closest to your users
- Replace security rules with contents of `firestore.rules`

**Storage:**
- Go to Storage
- Create a storage bucket
- Replace security rules with contents of `storage.rules`

### Step 4: Deploy Security Rules
```bash
# Update .firebaserc with your project ID
firebase deploy --only firestore:rules,storage
```

### Step 5: Start Development Server
```bash
npm run dev
```
The app will be available at `http://localhost:5173`

## Firestore Data Model

### Collections Structure

#### `users/{uid}`
User account data - allows public reading for verification cues
```
{
  uid: "user123",
  email: "user@example.com",
  displayName: "John Doe",
  photoURL: null,
  provider: "email" | "google",
  createdAt: timestamp,
  lastLoginAt: timestamp,
  isVerified: boolean,
  role: "user" | "admin",
  bio: string | null,
  stats: {
    postsCount: number,
    resolvedCount: number,
    reportsSubmitted: number
  },
  isBanned: boolean,
  updatedAt: timestamp
}
```

#### `items/{itemId}`
Lost and found listings - public read, authenticated create
```
{
  userId: "user123",
  title: "Blue bicycle helmet",
  description: "Mountain bike helmet with reflector sticker",
  type: "lost" | "found",
  category: "Electronics" | "Accessories" | "Keys" | etc,
  location: "Central Park, Downtown",
  dateOccurred: timestamp,
  createdAt: timestamp,
  updatedAt: timestamp,
  status: "open" | "resolved" | "claimed",
  imageUrl: "gs://bucket/...",
  contact: {
    preferredMethod: "inApp" | "email" | "phone",
    maskedEmail: "j***@example.com" | null,
    maskedPhone: "(555) ***-****" | null
  },
  isDeleted: boolean,
  isHidden: boolean,
  flaggedCount: number,
  moderation: {
    reviewedBy: "admin123" | null,
    reviewNotes: string | null
  }
}
```

#### `items/{itemId}/messages/{messageId}`
Subcollection for safe in-app messaging between poster and inquirer
```
{
  senderId: "user456",
  receiverId: "user123",
  text: "Is this still available?",
  createdAt: timestamp,
  isRead: boolean
}
```

#### `reports/{reportId}`
Content reports for moderation - admin only
```
{
  itemId: "item123",
  reporterUid: "user456",
  reportedUserUid: "user123",
  reason: "spam" | "misleading" | "harassment" | "inappropriate" | "other",
  details: "Spam account posting fake items",
  createdAt: timestamp,
  status: "open" | "reviewed" | "dismissed" | "actioned",
  reviewedBy: "admin123" | null,
  resolution: "deleted" | "warned" | "banned" | null
}
```

## Build & Deploy

### Local Build
```bash
npm run build
```
Output will be in the `dist/` folder.

### Deploy to Firebase Hosting
```bash
# Login to Firebase
firebase login

# Deploy app and rules
firebase deploy

# Or deploy specific only:
firebase deploy --only hosting
firebase deploy --only firestore:rules,storage
```

## GitHub Setup

### Initial Push
```bash
git init
git add .
git commit -m "Initial commit: Lost & Found app setup"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/lost-and-found-app.git
git push -u origin main
```

### Recommended Branch Strategy
```bash
# Feature branch
git checkout -b feat/item-detail-page
# ... make changes ...
git commit -m "Add item detail page with messaging"
git push origin feat/item-detail-page
# Create Pull Request on GitHub
```

## Security & Safety

⚠️ **Important Security Practices:**

1. **Never commit `.env` files** - They contain API keys. Use `.env.example` as a template.
2. **Validate inputs** - All form data is sanitized on the frontend and validated in Firestore rules.
3. **Image security** - Size limited to 5MB, type restricted to JPG/PNG/WEBP.
4. **User permissions** - Firestore rules ensure users can only edit their own posts.
5. **No public contact info** - Email and phone are masked or sent through in-app messaging.
6. **Moderation tools** - Admins can review flagged content and ban malicious users.
7. **Account trust cues** - Show account creation date and verification status for credibility.

## Available Scripts

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run preview   # Preview production build
npm run lint      # Run linter (oxlint)
```

## Troubleshooting

**"Firebase config not found" error:**
- Make sure `.env.local` file exists with all required variables
- Restart dev server after changing `.env` file

**"Permission denied" when creating items:**
- Check you're logged in
- Verify Firestore security rules were deployed
- Check user document exists in `users` collection

**"Images not uploading:**
- Ensure Firebase Storage bucket is created
- Verify storage rules were deployed
- Check image size < 5MB and type is JPG/PNG/WEBP

**"Google sign-in not working:**
- Add your domain to authorized redirect URIs in Firebase Console
- For localhost: ensure `http://localhost:5173` is authorized

## Contributing

1. Create a feature branch (`git checkout -b feat/your-feature`)
2. Commit your changes (`git commit -m "Add feature"`)
3. Push to your branch (`git push origin feat/your-feature`)
4. Open a Pull Request

## License

MIT License - feel free to use this as a template for your own projects.
