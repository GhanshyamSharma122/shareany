# exnoteshare
<a>https://shareany.me</a>
A simple and secure temporary file and text sharing application that automatically deletes shared content after 24 hours.

## 🌟 Features

- **File Sharing**: Upload up to 3 files at once
- **Text Sharing**: Share text content with unique keywords
- **Auto-Expiry**: All shared data automatically deletes after 24 hours
- **Secure Links**: Access shared content via unique generated keywords
- **File Management**: Download, copy links, or view files directly
- **Real-time Feedback**: Toast notifications for all actions
- **Responsive Design**: Modern UI built with React and Tailwind CSS

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Radix UI** components
- **Sonner** for toast notifications

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **Cloudinary** for file storage
- **Multer** for file upload handling
- **CORS** enabled for cross-origin requests

## 📁 Project Structure

```
shareany/
├── _frontend/                 # React frontend application
│   ├── src/
│   │   ├── pages/
│   │   │   ├── SimpleShareAny.tsx    # Main upload/share page
│   │   │   └── RetrievePage.tsx      # File retrieval page
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
└── backend/                   # Node.js backend API
    ├── src/
    │   ├── app.js            # Express app configuration
    │   ├── server.js         # Server entry point
    │   ├── controller.js     # Request handlers
    │   ├── model.js          # MongoDB schemas
    │   ├── db.js            # Database connection
    │   ├── cloudinary.js    # File upload service
    │   ├── multer.middleware.js  # File handling middleware
    │   └── services/
    │       └── cleanup.service.js    # Auto-cleanup service
    ├── public/temp/          # Temporary file storage
    └── package.json
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- Bun (for frontend) or npm
- MongoDB database
- Cloudinary account

### Environment Variables

Create a `.env` file in the `backend` directory:

```env
MONGODB_URI=your_mongodb_connection_string
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
PORT=5000
```

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/GhanshyamSharma122/shareany.git
   cd shareany
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

3. **Setup Frontend**
   ```bash
   cd _frontend
   bun install
   bun run dev
   ```

The application will be available at:
- Frontend: `http://localhost:8080`
- Backend API: `http://localhost:5000`

## 📖 API Endpoints

### Upload Data
```http
POST /
Content-Type: multipart/form-data

Body:
- text: string (optional)
- files: File[] (optional, max 3 files)
```

### Retrieve Data
```http
GET /:keyword
```

## 🔧 How It Works

1. **Upload**: Users can upload files and/or text content
2. **Keyword Generation**: System generates a unique keyword using [`random-words`](backend/src/model.js) library
3. **Storage**: Files are uploaded to Cloudinary, metadata stored in MongoDB
4. **Sharing**: Users receive a unique link containing the keyword
5. **Retrieval**: Others can access content using the shared link
6. **Auto-Cleanup**: [`cleanUP`](backend/src/services/cleanup.service.js) service runs every 24 hours to delete expired content

## 🗄️ Database Schema

### Storage Collection
```javascript
{
  text: String,           // Optional text content
  files: [String],        // Array of Cloudinary URLs
  keyword: String,        // Unique access keyword (indexed)
  createdAt: Date,        // Auto-generated timestamp
  updatedAt: Date         // Auto-generated timestamp
}
```

### TimeStore Collection
```javascript
{
  createdAt: Date,        // Tracks cleanup schedule
  updatedAt: Date
}
```

## 🔒 Security Features

- **Auto-Expiry**: All data automatically deleted after 24 hours
- **Unique Keywords**: Random word generation prevents guessing
- **CORS Protection**: Configured for secure cross-origin requests
- **File Type Validation**: Handled by Cloudinary
- **Temporary Storage**: Local files deleted immediately after upload

## 🚀 Deployment

### Frontend (Vercel)
The frontend is configured for Vercel deployment with:
- [`vercel.json`](_frontend/vercel.json) for routing
- [`_redirects`](_frontend/public/_redirects) for SPA support

### Backend (Render/Railway/Heroku)
- Update the API_URL in [`SimpleShareAny.tsx`](_frontend/src/pages/SimpleShareAny.tsx)
- Ensure environment variables are set
- MongoDB and Cloudinary services are accessible

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 🙏 Acknowledgments

- [Radix UI](https://www.radix-ui.com/) for accessible components
- [Cloudinary](https://cloudinary.com/) for file storage
- [MongoDB](https://www.mongodb.com/) for database
- [Vercel](https://vercel.com/) for frontend hosting

---

**Note**: This is a temporary sharing service. Do not upload sensitive or important files as they will be automatically deleted after 24 hours.
