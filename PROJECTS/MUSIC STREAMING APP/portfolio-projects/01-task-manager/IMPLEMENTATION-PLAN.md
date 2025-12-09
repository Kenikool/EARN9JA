# Task Manager Pro - Implementation Plan

**Project:** Task Management Application (Todo Pro)  
**Complexity:** Beginner ⭐⭐☆☆☆  
**Estimated Time:** 1-2 weeks  
**Stack:** MERN (MongoDB, Express, React, Node.js)

---

## 📋 Project Overview

A full-featured task management application with user authentication, CRUD operations, drag-and-drop functionality, and theme customization.

---

## 🎯 Core Features

1. User Authentication (Register/Login/Logout)
2. Task CRUD Operations
3. Task Categories & Tags
4. Priority Levels & Due Dates
5. Drag-and-Drop Task Reordering
6. Dark/Light Theme Toggle
7. Responsive Design

---

## 📁 Project Structure

```
task-manager/
├── client/                    # React Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   │   ├── LoginForm.jsx
│   │   │   │   ├── RegisterForm.jsx
│   │   │   │   └── ProtectedRoute.jsx
│   │   │   ├── tasks/
│   │   │   │   ├── TaskCard.jsx
│   │   │   │   ├── TaskForm.jsx
│   │   │   │   ├── TaskList.jsx
│   │   │   │   └── TaskFilters.jsx
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.jsx
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   └── ThemeToggle.jsx
│   │   │   └── common/
│   │   │       ├── Button.jsx
│   │   │       ├── Input.jsx
│   │   │       └── Modal.jsx
│   │   ├── pages/
│   │   │   ├── HomePage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   └── DashboardPage.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   ├── useTasks.js
│   │   │   └── useTheme.js
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   └── taskService.js
│   │   ├── utils/
│   │   │   ├── constants.js
│   │   │   └── helpers.js
│   │   ├── App.jsx
│   │   └── index.js
│   ├── package.json
│   └── tailwind.config.js
│
├── server/                    # Node.js Backend
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js
│   │   │   └── env.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Task.js
│   │   │   └── Category.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── taskController.js
│   │   │   └── categoryController.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── taskRoutes.js
│   │   │   └── categoryRoutes.js
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js
│   │   │   ├── errorHandler.js
│   │   │   └── validation.js
│   │   ├── utils/
│   │   │   ├── jwt.js
│   │   │   └── validators.js
│   │   └── server.js
│   ├── package.json
│   └── .env
│
└── README.md
```

---

## 🚀 Implementation Phases

### **PHASE 1: Project Setup & Backend Foundation** (Days 1-2)

#### Task 1.1: Initialize Project
- [ ] Create project root directory
- [ ] Initialize Git repository
- [ ] Create `.gitignore` file
- [ ] Set up folder structure (client & server)

#### Task 1.2: Backend Setup
- [ ] Initialize Node.js project (`npm init`)
- [ ] Install dependencies:
  ```bash
  npm install express mongoose dotenv cors bcryptjs jsonwebtoken
  npm install --save-dev nodemon
  ```
- [ ] Create `.env` file with:
  - `PORT=5000`
  - `MONGODB_URI=mongodb://localhost:27017/taskmanager`
  - `JWT_SECRET=your_secret_key`
  - `NODE_ENV=development`

#### Task 1.3: Database Configuration
- [ ] Create `config/database.js`
- [ ] Set up MongoDB connection
- [ ] Add connection error handling

#### Task 1.4: Create User Model
**File:** `models/User.js`
```javascript
// Fields:
- name: String (required)
- email: String (required, unique)
- password: String (required, hashed)
- createdAt: Date
- updatedAt: Date
```

#### Task 1.5: Create Task Model
**File:** `models/Task.js`
```javascript
// Fields:
- title: String (required)
- description: String
- status: Enum ['todo', 'in-progress', 'completed']
- priority: Enum ['low', 'medium', 'high']
- dueDate: Date
- category: ObjectId (ref: Category)
- tags: [String]
- order: Number
- user: ObjectId (ref: User)
- createdAt: Date
- updatedAt: Date
```

#### Task 1.6: Create Category Model
**File:** `models/Category.js`
```javascript
// Fields:
- name: String (required)
- color: String
- user: ObjectId (ref: User)
- createdAt: Date
```

**Deliverables:**
- ✅ Backend project initialized
- ✅ Database connected
- ✅ All models created

---

### **PHASE 2: Authentication System** (Days 2-3)

#### Task 2.1: Auth Middleware
**File:** `middleware/authMiddleware.js`
- [ ] Create JWT verification middleware
- [ ] Add user authentication check
- [ ] Handle token expiration

#### Task 2.2: Auth Controller
**File:** `controllers/authController.js`
- [ ] `register` - Create new user
  - Validate input
  - Hash password with bcrypt
  - Generate JWT token
- [ ] `login` - Authenticate user
  - Validate credentials
  - Compare passwords
  - Return JWT token
- [ ] `getMe` - Get current user profile

#### Task 2.3: Auth Routes
**File:** `routes/authRoutes.js`
- [ ] `POST /api/auth/register`
- [ ] `POST /api/auth/login`
- [ ] `GET /api/auth/me` (protected)

#### Task 2.4: Validation Middleware
**File:** `middleware/validation.js`
- [ ] Email validation
- [ ] Password strength validation
- [ ] Input sanitization

**Deliverables:**
- ✅ User registration working
- ✅ User login working
- ✅ JWT authentication implemented

---

### **PHASE 3: Task CRUD Operations** (Days 3-4)

#### Task 3.1: Task Controller
**File:** `controllers/taskController.js`
- [ ] `getTasks` - Get all user tasks
  - Add filtering (status, priority, category)
  - Add sorting (date, priority)
  - Add pagination
- [ ] `getTask` - Get single task by ID
- [ ] `createTask` - Create new task
- [ ] `updateTask` - Update task
- [ ] `deleteTask` - Delete task
- [ ] `reorderTasks` - Update task order (for drag-and-drop)

#### Task 3.2: Task Routes
**File:** `routes/taskRoutes.js`
- [ ] `GET /api/tasks` (protected)
- [ ] `GET /api/tasks/:id` (protected)
- [ ] `POST /api/tasks` (protected)
- [ ] `PUT /api/tasks/:id` (protected)
- [ ] `DELETE /api/tasks/:id` (protected)
- [ ] `PATCH /api/tasks/reorder` (protected)

#### Task 3.3: Category Controller & Routes
**File:** `controllers/categoryController.js` & `routes/categoryRoutes.js`
- [ ] `GET /api/categories` - Get all categories
- [ ] `POST /api/categories` - Create category
- [ ] `PUT /api/categories/:id` - Update category
- [ ] `DELETE /api/categories/:id` - Delete category

#### Task 3.4: Error Handling
**File:** `middleware/errorHandler.js`
- [ ] Global error handler
- [ ] Custom error classes
- [ ] Validation error formatting

**Deliverables:**
- ✅ All CRUD operations working
- ✅ API tested with Postman/Thunder Client
- ✅ Error handling implemented

---

### **PHASE 4: Frontend Setup** (Day 4)

#### Task 4.1: Initialize React App
- [ ] Create React app with Vite
  ```bash
  npm create vite@latest client -- --template react
  ```
- [ ] Install dependencies:
  ```bash
  npm install axios react-router-dom react-dnd react-dnd-html5-backend
  npm install --save-dev tailwindcss postcss autoprefixer
  ```
- [ ] Configure Tailwind CSS

#### Task 4.2: Setup Routing
**File:** `App.jsx`
- [ ] Install React Router
- [ ] Create route structure:
  - `/` - Home/Landing
  - `/login` - Login page
  - `/register` - Register page
  - `/dashboard` - Main dashboard (protected)

#### Task 4.3: Create Context Providers
**File:** `context/AuthContext.jsx`
- [ ] User state management
- [ ] Login/logout functions
- [ ] Token storage (localStorage)

**File:** `context/ThemeContext.jsx`
- [ ] Theme state (light/dark)
- [ ] Toggle theme function
- [ ] Persist theme preference

#### Task 4.4: API Service Setup
**File:** `services/api.js`
- [ ] Axios instance with base URL
- [ ] Request interceptor (add JWT token)
- [ ] Response interceptor (handle errors)

**Deliverables:**
- ✅ React app initialized
- ✅ Routing configured
- ✅ Context providers created

---

### **PHASE 5: Authentication UI** (Day 5)

#### Task 5.1: Login Page
**File:** `pages/LoginPage.jsx`
- [ ] Email input field
- [ ] Password input field
- [ ] Submit button
- [ ] Link to register page
- [ ] Form validation
- [ ] Error message display

#### Task 5.2: Register Page
**File:** `pages/RegisterPage.jsx`
- [ ] Name input field
- [ ] Email input field
- [ ] Password input field
- [ ] Confirm password field
- [ ] Submit button
- [ ] Link to login page
- [ ] Form validation

#### Task 5.3: Auth Service
**File:** `services/authService.js`
- [ ] `register(userData)` function
- [ ] `login(credentials)` function
- [ ] `logout()` function
- [ ] `getCurrentUser()` function

#### Task 5.4: Protected Route Component
**File:** `components/auth/ProtectedRoute.jsx`
- [ ] Check authentication status
- [ ] Redirect to login if not authenticated
- [ ] Show loading state

**Deliverables:**
- ✅ Login/Register forms working
- ✅ Authentication flow complete
- ✅ Protected routes implemented

---

### **PHASE 6: Task Management UI** (Days 6-7)

#### Task 6.1: Dashboard Layout
**File:** `pages/DashboardPage.jsx`
- [ ] Navbar component
- [ ] Sidebar for filters
- [ ] Main content area
- [ ] Responsive layout

#### Task 6.2: Task Card Component
**File:** `components/tasks/TaskCard.jsx`
- [ ] Display task title
- [ ] Display description
- [ ] Show priority badge
- [ ] Show due date
- [ ] Show category
- [ ] Edit button
- [ ] Delete button
- [ ] Checkbox for completion

#### Task 6.3: Task List Component
**File:** `components/tasks/TaskList.jsx`
- [ ] Render list of TaskCards
- [ ] Group by status (Todo, In Progress, Done)
- [ ] Empty state message
- [ ] Loading state

#### Task 6.4: Task Form Component
**File:** `components/tasks/TaskForm.jsx`
- [ ] Title input
- [ ] Description textarea
- [ ] Priority dropdown
- [ ] Due date picker
- [ ] Category selector
- [ ] Tags input
- [ ] Submit button
- [ ] Form validation

#### Task 6.5: Task Service
**File:** `services/taskService.js`
- [ ] `getTasks(filters)` function
- [ ] `getTask(id)` function
- [ ] `createTask(taskData)` function
- [ ] `updateTask(id, taskData)` function
- [ ] `deleteTask(id)` function

**Deliverables:**
- ✅ Dashboard UI complete
- ✅ Task CRUD operations in UI
- ✅ Task display working

---

### **PHASE 7: Advanced Features** (Days 8-9)

#### Task 7.1: Drag-and-Drop Functionality
**File:** `components/tasks/TaskList.jsx` (enhanced)
- [ ] Install react-dnd
- [ ] Make TaskCard draggable
- [ ] Create drop zones for each status
- [ ] Update task order on drop
- [ ] Update task status on drop
- [ ] API call to save new order

#### Task 7.2: Task Filters
**File:** `components/tasks/TaskFilters.jsx`
- [ ] Filter by status
- [ ] Filter by priority
- [ ] Filter by category
- [ ] Filter by due date
- [ ] Search by title
- [ ] Clear filters button

#### Task 7.3: Category Management
**File:** `components/tasks/CategoryManager.jsx`
- [ ] List all categories
- [ ] Add new category
- [ ] Edit category
- [ ] Delete category
- [ ] Color picker for categories

#### Task 7.4: Theme Toggle
**File:** `components/layout/ThemeToggle.jsx`
- [ ] Toggle button (sun/moon icon)
- [ ] Switch between light/dark mode
- [ ] Apply theme classes to body
- [ ] Persist theme in localStorage

**Deliverables:**
- ✅ Drag-and-drop working
- ✅ Filters functional
- ✅ Theme toggle working

---

### **PHASE 8: Polish & Optimization** (Days 10-11)

#### Task 8.1: Responsive Design
- [ ] Mobile-first approach
- [ ] Tablet breakpoints
- [ ] Desktop layout
- [ ] Touch-friendly interactions
- [ ] Hamburger menu for mobile

#### Task 8.2: Loading States
- [ ] Skeleton loaders
- [ ] Spinner components
- [ ] Progress indicators
- [ ] Disable buttons during API calls

#### Task 8.3: Error Handling
- [ ] Toast notifications
- [ ] Error boundaries
- [ ] Validation messages
- [ ] Network error handling

#### Task 8.4: Performance Optimization
- [ ] Lazy loading components
- [ ] Memoization (useMemo, useCallback)
- [ ] Debounce search input
- [ ] Optimize re-renders

#### Task 8.5: Accessibility
- [ ] Keyboard navigation
- [ ] ARIA labels
- [ ] Focus management
- [ ] Screen reader support

**Deliverables:**
- ✅ Fully responsive
- ✅ Smooth user experience
- ✅ Accessible

---

### **PHASE 9: Testing & Deployment** (Days 12-14)

#### Task 9.1: Testing
- [ ] Test all API endpoints
- [ ] Test authentication flow
- [ ] Test CRUD operations
- [ ] Test drag-and-drop
- [ ] Test on different browsers
- [ ] Test on mobile devices

#### Task 9.2: Documentation
**File:** `README.md`
- [ ] Project description
- [ ] Features list
- [ ] Tech stack
- [ ] Installation instructions
- [ ] Environment variables
- [ ] API documentation
- [ ] Screenshots

#### Task 9.3: Deployment Preparation
- [ ] Create production build
- [ ] Set up environment variables
- [ ] Configure CORS for production
- [ ] Add security headers

#### Task 9.4: Deploy Backend
- [ ] Deploy to Render/Railway/Heroku
- [ ] Set up MongoDB Atlas
- [ ] Configure environment variables
- [ ] Test API endpoints

#### Task 9.5: Deploy Frontend
- [ ] Deploy to Vercel/Netlify
- [ ] Update API base URL
- [ ] Test production build
- [ ] Configure custom domain (optional)

**Deliverables:**
- ✅ Fully tested application
- ✅ Complete documentation
- ✅ Deployed to production

---

## 📦 Dependencies

### Backend
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^7.5.0",
    "dotenv": "^16.3.1",
    "cors": "^2.8.5",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "express-validator": "^7.0.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

### Frontend
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.16.0",
    "axios": "^1.5.0",
    "react-dnd": "^16.0.1",
    "react-dnd-html5-backend": "^16.0.1",
    "date-fns": "^2.30.0",
    "react-icons": "^4.11.0"
  },
  "devDependencies": {
    "vite": "^4.4.9",
    "tailwindcss": "^3.3.3",
    "autoprefixer": "^10.4.15",
    "postcss": "^8.4.29"
  }
}
```

---

## 🎨 Design Guidelines

### Color Palette
**Light Theme:**
- Primary: `#3B82F6` (Blue)
- Success: `#10B981` (Green)
- Warning: `#F59E0B` (Orange)
- Danger: `#EF4444` (Red)
- Background: `#F9FAFB`
- Text: `#111827`

**Dark Theme:**
- Primary: `#60A5FA`
- Success: `#34D399`
- Warning: `#FBBF24`
- Danger: `#F87171`
- Background: `#111827`
- Text: `#F9FAFB`

### Priority Colors
- Low: Green
- Medium: Orange
- High: Red

---

## ✅ Testing Checklist

### Authentication
- [ ] User can register with valid data
- [ ] User cannot register with existing email
- [ ] User can login with correct credentials
- [ ] User cannot login with wrong credentials
- [ ] Token is stored in localStorage
- [ ] User is redirected after login
- [ ] User can logout
- [ ] Protected routes work correctly

### Tasks
- [ ] User can create a task
- [ ] User can view all tasks
- [ ] User can edit a task
- [ ] User can delete a task
- [ ] User can mark task as complete
- [ ] User can filter tasks
- [ ] User can search tasks
- [ ] Drag-and-drop updates task order
- [ ] Drag-and-drop updates task status

### Categories
- [ ] User can create category
- [ ] User can edit category
- [ ] User can delete category
- [ ] Tasks show correct category

### UI/UX
- [ ] Theme toggle works
- [ ] Theme persists on reload
- [ ] Responsive on mobile
- [ ] Responsive on tablet
- [ ] Loading states show correctly
- [ ] Error messages display
- [ ] Success messages display

---

## 🚀 Deployment URLs

**Backend:** `https://your-app.render.com`  
**Frontend:** `https://your-app.vercel.app`  
**Database:** MongoDB Atlas

---

## 📝 Notes

- Use environment variables for sensitive data
- Implement proper error handling
- Add input validation on both frontend and backend
- Use HTTPS in production
- Implement rate limiting for API endpoints
- Add request logging
- Consider adding email verification (optional)
- Consider adding password reset (optional)

---

## 🎯 Success Criteria

- ✅ User can register and login
- ✅ User can perform all CRUD operations on tasks
- ✅ Drag-and-drop functionality works smoothly
- ✅ Theme toggle works and persists
- ✅ Application is fully responsive
- ✅ Application is deployed and accessible
- ✅ Code is clean and well-documented

---

**Good luck building! 🚀**


###pseand/collak exptasmplement 
- [ ] Ikboxtion check comple ] Add tased
- [sks in roverdue ta
- [ ] Show ingformattith  due date wlay ] Dispoding
- [ity color crior ] Add pes
- [us badgstatd task es
- [ ] Aday Featursplsk Di### 4.2 Tarst)

mobile-five design ( responsiement] Implicons)
- [ t or react-ide-reac(lucns ico] Add 
- [ windilrds with Tacatyle task  S
- [ ] filtersidebar for Create s
- [ ]n baravigatio ] Design n
- [t componenoutmain lay ] Create t
- [ou& Lay4.1 Styling y 6)

### cements (DaEnhanI/UX 4: U 🎨 Phase ##

asks

---for tnctionality  CRUD fuFull** liverable:s

**Der stateerrog and in[ ] Add load
- entgeme manatask stat] Implement )
- [ t.jsx`t/TaskContex/contexlient/srcontext (`ceate task c- [ ] Cranagement
5 State M

### 3.ngndlir had erro [ ] Adrations
-UD ope CR allement ] Impl
- [`)Service.jsces/tasksrc/servient/ (`cliAPI servicesk Create tayer
- [ ] ervice La3.4 Task S
### )
sx`.js/Dashboard/paget/src`clienage (oard p Dashb Create`)
- [ ]sx.jForms/Task/componentlient/srcnt (`crm componeeate TaskFo [ ] Cr.jsx`)
-askItems/Trc/componentt/senponent (`clicomskItem e Ta
- [ ] Creatt.jsx`)ts/TaskLissrc/componennt/`clienent (poist comCreate TaskL- [ ] 
entssk Compon Ta3.3 Frontend# 

## middlewarelidationdd va
- [ ] Aroller.js`)s/taskContcontroller(`server/controller ask  ] Create t [ task
-id` - Deletes/:api/task DELETE `/e task
  -id` - Updatks/:i/tas `/ap
  - PUT Create task -tasks`/api/
  - POST `taskngle ` - Get si/:idapi/tasks  - GET `/asks
ll user t - Get as`T `/api/taskGE  - `)
ks.js/routes/tasserverutes (`task rote - [ ] Creaontrollers
Routes & CTask  3.2 

###mance perforindexes for Add ']
- [ ]'highmedium', w', ': ['lonum- Priority eleted']
   'compss','in-progreo', ['todus enum: tatt
  - SpdatedAtedAt, u, creaId, usery, tagsate, categoriority, dueD, pratuscription, st title, des
  - Fields:ask.js`)odels/Tver/mel (`sere Task mod] Createma
- [ Model & Sch## 3.1 Task 
#
 4-5)Dayrations (sk CRUD Ope Core Ta3:se ha✅ P
---

## er
n/registh logim witsysteication authent* Complete le:***Deliverabhandling

piration exen est tok [ ] T routes
-st protectedTe
- [ ] ginest user lo- [ ] Tion
 registratest user- [ ] T
stingh Te### 2.4 Aut

tponenRoute comte Private- [ ] CreaStorage
 in localWT J[ ] Storeation
- valid forms with eregistlogin/rent - [ ] Implemx`)
ext.jsAuthContext/t/src/cont (`clienh contexte aut
- [ ] Creatx`)gister.jses/Re/pagent/srcliage (`c Register peateCr- [ ] `)
sxes/Login.jnt/src/pagie(`cl Login page  ] Createages
- [d Auth P2.3 Frontenmple

### oute exarotected rdd p- [ ] Aion
rificatoken veement tImpljs`)
- [ ] auth.leware/rver/midd(`sedleware  auth mid- [ ] CreateMiddleware
 2.2 Auth 

###tionen generament JWT tokple] Im
- [ ler.js`)uthControl/arsr/controlleler (`servecontrolCreate auth - [ ] ent user)
urrh/me` (get caut`/api/
  - GET th/login``/api/au`
  - POST ister/auth/regOST `/apis`)
  - P/auth.jrver/routeses (`seoutauth r [ ] Create ypt
- bcrng with hashid password- AdatedAt
   cre password,mail,ds: name, e  - Fiel)
s/User.js`elrver/model (`seer mod Us [ ] Create
-tesl & Rou Mode## 2.1 User)

#(Day 2-3tem Syshentication Authase 2:  P--

## 🔐unicate

- commt cand client thaserver an Working ble:**
**Delivera
t 5000s on por run server
- [ ] Test`)/api/healthoint (`GET h check endphealt Create [ ]are
- dlewhandling midor sic errtup baSe
- [ ] S CORure [ ] Configtup
-s seith Expresndex.js` w `server/ieate
- [ ] Crrationonfigurver Cic Se 1.3 Bas

###ctionconneabase Test dat] 
- [ ig/db.js`erver/confon in `sctise conne databa
- [ ] SetupngoDB) local Mount (or accoongoDB AtlasCreate Mup
- [ ] ase Set1.2 Datab

### ignore` Setup `.git ]
- [vernd serlient a for both c` files`.env ] Create tion
- [figuraon cTailwind CSS[ ] Setup   ```
- ixer
 autoprefpostcssailwindcss install -D tm  np
 uter-domeact-ros rall axionpm instreact
  ate  -- --templlatest .e@ create vit
  npmnt cd ../clie ```bash
 e)
 t + Vit(Reace frontend  Initializ  ```
- [ ]emon
 -D nodnstall  npm iebtoken
onwptjs js bcrydotenv corss mongoose all expres
  npm inst-yinit  && npm   cd serverlient
ir server cr
  mkdtask-managecd & manager &ir task-mkdash
  ``b)
  `goDBess + Monnd (Expralize backe] Initi
- [ urer structdeproject folate ree
- [ ] Ccturect Struize Proj 1.1 Initial
###)
 1ayion (D& Foundatct Setup jePhase 1: Pro
## 📋 --


-ereginn** ⭐⭐☆☆☆ B*Difficulty:s  
*-2 weekme:** 1ated TiEstim 
**sk Manager nced Tao Pro - AdvaTod:** ojectPr

**anion PlImplementatnt App - agemeMan# Task 