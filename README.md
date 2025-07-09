# Contact Manager Application

A modern, full-stack contact management application built with React.js frontend and Node.js backend.

---

## 🗺️ Application Workflow Diagram

Below is a concise workflow diagram of the Contact Manager application, representing the main user flows and backend interactions:

```mermaid
flowchart TD
    A[USER OPENS APP] --> B[LOAD CONTACTS]
    B --> C[DISPLAY CONTACT LIST]

    %% Add Contact
    C --> D[USER ADDS CONTACT]
    D --> E[VALIDATE INPUT]
    E --> F{VALID?}
    F -->|NO| G[SHOW ERROR]
    F -->|YES| H[SAVE TO DATABASE]
    G --> D
    H --> I[SHOW SUCCESS]
    I --> C

    %% Search
    C --> J[USER SEARCHES]
    J --> K[SEARCH DATABASE]
    K --> L[DISPLAY RESULTS]
    L --> C

    %% Delete
    C --> M[USER DELETES]
    M --> N{CONFIRM?}
    N -->|NO| C
    N -->|YES| O[DELETE FROM DATABASE]
    O --> P[SHOW SUCCESS]
    P --> C

    %% Error Handling
    G --> Q[ERROR HANDLER]
    I --> Q
    P --> Q
    Q --> R[DISPLAY MESSAGE]
    R --> C

    %% Database/API
    B --> S[GET ALL CONTACTS]
    H --> T[INSERT CONTACT]
    K --> U[SEARCH CONTACTS]
    O --> V[DELETE CONTACT]
    S --> W[API CALL]
    T --> W
    U --> W
    V --> W
```

---

## 🚀 Features

### ✅ Core Functionality
- **Add Contacts**: Add new contacts with name and email validation
- **View Contacts**: Display all contacts in a clean, card-based interface
- **Search Contacts**: Real-time search by name or email
- **Delete Contacts**: Remove contacts with confirmation dialog

### 🎨 User Experience
- **Modern UI**: Clean, responsive design with hover effects
- **Form Validation**: Real-time validation with helpful error messages
- **Loading States**: Visual feedback during API operations
- **Success/Error Messages**: Clear feedback for all user actions
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile

### 🔧 Technical Features
- **Component Architecture**: Modular React components
- **API Service Layer**: Clean separation of API calls
- **Error Handling**: Comprehensive error handling and recovery
- **RESTful API**: Well-designed backend endpoints
- **Input Validation**: Both frontend and backend validation

## 🛠️ Technology Stack

### Frontend
- **React.js** - Modern UI framework
- **CSS3** - Custom styling with modern features
- **Jest & React Testing Library** - Testing framework

### Backend
- **Node.js** - Server runtime
- **Express.js** - Web framework
- **express-validator** - Input validation
- **CORS** - Cross-origin resource sharing

## 📦 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Backend Setup
```bash
cd backend
npm install
npm start
```
The backend will run on `http://localhost:3001`

### Frontend Setup
```bash
cd frontend
npm install
npm start
```
The frontend will run on `http://localhost:3000`

## 🧪 Testing

### Frontend Tests
```bash
cd frontend
npm test
```

### Backend Tests
```bash
cd backend
npm test
```

### Test Coverage
The application includes comprehensive tests covering:
- ✅ Component rendering
- ✅ User interactions
- ✅ Form validation
- ✅ API endpoints
- ✅ Error handling

## 📸 Screenshots & Demo

### Application Views
1. **Main Interface**: Clean, modern contact list
2. **Add Contact Form**: User-friendly input form
3. **Search Results**: Real-time filtering
4. **Empty State**: No contacts view
5. **Error States**: Validation and network errors
6. **Mobile View**: Responsive design

### Demo Video Script
Create a 2-3 minute demo showing:
1. **Introduction** (30s) - App overview
2. **Adding Contacts** (45s) - Form usage and validation
3. **Searching** (30s) - Real-time search functionality
4. **Managing Contacts** (30s) - Delete operations
5. **Error Handling** (15s) - Error states and recovery

## 🏗️ Project Structure

```
Contact-Manager/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ContactForm.js
│   │   │   ├── ContactList.js
│   │   │   ├── ContactItem.js
│   │   │   ├── SearchBox.js
│   │   │   └── Message.js
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.js
│   │   ├── App.css
│   │   └── index.js
│   └── package.json
├── backend/
│   ├── server.js
│   ├── database.js
│   └── package.json
└── README.md
```

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/contacts` | Get all contacts |
| POST | `/api/contacts` | Add new contact |
| DELETE | `/api/contacts/:id` | Delete contact |
| GET | `/api/contacts/search?q=term` | Search contacts |
| GET | `/api/health` | Health check |

## 🎯 Key Features Implementation

### Search Functionality
- **Real-time search** as you type
- **Search by name AND email**
- **Case-insensitive matching**
- **Empty search shows all contacts**

### Form Validation
- **Required field validation**
- **Email format validation**
- **Duplicate email prevention**
- **Real-time feedback**

### Error Handling
- **Network error recovery**
- **User-friendly error messages**
- **Graceful degradation**
- **Loading states**

## 🚀 Deployment

### Frontend Deployment
```bash
cd frontend
npm run build
```
Deploy the `build` folder to your hosting service.

### Backend Deployment
```bash
cd backend
npm start
```
Deploy to your Node.js hosting service (Heroku, Vercel, etc.).

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🆘 Support

For support or questions, please open an issue in the repository.

---

**Built with ❤️ using React.js and Node.js** 