# Phase 7-11 Testing Plan

## Test Date: [Current Date]
## Tester: [Your Name]

---

## PHASE 7: Search Functionality

### Backend Tests

#### Test 7.1: Search API Endpoint
- [ ] **Test**: Send GET request to `/api/search?q=test`
- [ ] **Expected**: Returns search results with posts matching "test"
- [ ] **Command**: 
```bash
curl "http://localhost:8081/api/search?q=javascript"
```

#### Test 7.2: Search with Pagination
- [ ] **Test**: Search with pagination parameters
- [ ] **Expected**: Returns paginated results
- [ ] **Command**:
```bash
curl "http://localhost:8081/api/search?q=test&page=1&limit=5"
```

#### Test 7.3: Empty Search Query
- [ ] **Test**: Send request without query parameter
- [ ] **Expected**: Returns 400 error with message "Search query is required"
- [ ] **Command**:
```bash
curl "http://localhost:8081/api/search"
```

#### Test 7.4: Text Index Verification
- [ ] **Test**: Verify text index exists on Post model
- [ ] **Expected**: Search works on title, content, and tags
- [ ] **Note**: Index should be created automatically when server starts

### Frontend Tests

#### Test 7.5: SearchBar Component
- [ ] **Test**: Navigate to home page
- [ ] **Expected**: Search bar is visible
- [ ] **Steps**:
  1. Open http://localhost:5173
  2. Verify search input field is present
  3. Type a search query
  4. Press Enter or click search button

#### Test 7.6: Search Results Page
- [ ] **Test**: Perform a search
- [ ] **Expected**: Redirects to `/search?q=query` and displays results
- [ ] **Steps**:
  1. Enter "javascript" in search bar
  2. Submit search
  3. Verify URL changes to `/search?q=javascript`
  4. Verify results are displayed

#### Test 7.7: Search Results Display
- [ ] **Test**: Check search results formatting
- [ ] **Expected**: Each result shows:
  - Post title (clickable)
  - Author name and avatar
  - Published date
  - Reading time, views, likes
  - Category badge
  - Excerpt or content preview
  - Tags
  - Featured image (if available)

#### Test 7.8: Search Pagination
- [ ] **Test**: Navigate through search result pages
- [ ] **Expected**: Pagination controls work correctly
- [ ] **Steps**:
  1. Perform search with many results
  2. Click next page button
  3. Verify URL updates with page parameter
  4. Verify new results load

#### Test 7.9: No Results Found
- [ ] **Test**: Search for non-existent term
- [ ] **Expected**: Shows "No results found" message
- [ ] **Steps**:
  1. Search for "xyzabc123nonexistent"
  2. Verify empty state message appears

#### Test 7.10: Clear Search
- [ ] **Test**: Clear search input
- [ ] **Expected**: X button clears the input
- [ ] **Steps**:
  1. Type in search bar
  2. Click X button
  3. Verify input is cleared

---

## PHASE 8: Frontend Setup

### Test 8.1: React App Running
- [ ] **Test**: Verify React app starts
- [ ] **Expected**: App runs on http://localhost:5173
- [ ] **Command**: `npm run dev` in client folder

### Test 8.2: Routing Configuration
- [ ] **Test**: Navigate to different routes
- [ ] **Expected**: All routes work correctly
- [ ] **Routes to test**:
  - [ ] `/` - Home page
  - [ ] `/login` - Login page
  - [ ] `/register` - Register page
  - [ ] `/posts` - Posts listing
  - [ ] `/posts/:slug` - Post detail
  - [ ] `/create` - Create post (protected)
  - [ ] `/edit/:id` - Edit post (protected)
  - [ ] `/search` - Search results

### Test 8.3: AuthContext
- [ ] **Test**: Login and verify user state
- [ ] **Expected**: User data persists across page refreshes
- [ ] **Steps**:
  1. Login
  2. Refresh page
  3. Verify still logged in

### Test 8.4: API Service
- [ ] **Test**: API calls include auth token
- [ ] **Expected**: Protected endpoints receive JWT token
- [ ] **Check**: Browser DevTools Network tab

---

## PHASE 9: Authentication UI

### Test 9.1: Login Page
- [ ] **Test**: Login with valid credentials
- [ ] **Expected**: Redirects to home page, shows user name
- [ ] **Steps**:
  1. Navigate to `/login`
  2. Enter email and password
  3. Click login
  4. Verify redirect and user state

### Test 9.2: Login Validation
- [ ] **Test**: Try login with invalid credentials
- [ ] **Expected**: Shows error message
- [ ] **Steps**:
  1. Enter wrong password
  2. Submit form
  3. Verify error toast appears

### Test 9.3: Register Page
- [ ] **Test**: Register new user
- [ ] **Expected**: Creates account and logs in
- [ ] **Steps**:
  1. Navigate to `/register`
  2. Fill in name, email, password
  3. Submit form
  4. Verify account created

### Test 9.4: Protected Routes
- [ ] **Test**: Access protected route without login
- [ ] **Expected**: Redirects to login page
- [ ] **Steps**:
  1. Logout
  2. Try to access `/create`
  3. Verify redirect to `/login`

### Test 9.5: Logout
- [ ] **Test**: Logout functionality
- [ ] **Expected**: Clears user state and token
- [ ] **Steps**:
  1. Login
  2. Click logout
  3. Verify redirected and logged out

---

## PHASE 10: Blog Post UI

### Test 10.1: Home Page
- [ ] **Test**: View home page
- [ ] **Expected**: Shows hero section with features
- [ ] **Verify**:
  - [ ] Hero text
  - [ ] Search bar
  - [ ] Login/Register buttons (if not logged in)
  - [ ] Browse/Write buttons (if logged in)
  - [ ] Feature cards

### Test 10.2: Posts Page
- [ ] **Test**: View all posts
- [ ] **Expected**: Grid of post cards
- [ ] **Verify**:
  - [ ] Posts display in grid
  - [ ] Each card shows title, author, date, stats
  - [ ] Featured images display
  - [ ] Cards are clickable

### Test 10.3: Post Detail Page
- [ ] **Test**: Click on a post
- [ ] **Expected**: Shows full post content
- [ ] **Verify**:
  - [ ] Title displays
  - [ ] Author info with avatar
  - [ ] Published date
  - [ ] Reading time, views, likes
  - [ ] Category badge
  - [ ] Tags
  - [ ] Full content (HTML rendered safely)
  - [ ] Featured image
  - [ ] Comments section

### Test 10.4: Like Post
- [ ] **Test**: Like a post
- [ ] **Expected**: Like count increases, heart fills
- [ ] **Steps**:
  1. Login
  2. View post detail
  3. Click heart icon
  4. Verify count increases
  5. Click again to unlike

### Test 10.5: Post Stats
- [ ] **Test**: View count increments
- [ ] **Expected**: Views increase when viewing post
- [ ] **Steps**:
  1. Note current view count
  2. Refresh page
  3. Verify count increased by 1

---

## PHASE 11: Rich Text Editor

### Test 11.1: Create Post Page
- [ ] **Test**: Access create post page
- [ ] **Expected**: Form with rich text editor
- [ ] **Steps**:
  1. Login
  2. Navigate to `/create`
  3. Verify form displays

### Test 11.2: Rich Text Editor Features
- [ ] **Test**: Use editor formatting options
- [ ] **Expected**: All toolbar options work
- [ ] **Test each**:
  - [ ] Headers (H1, H2, H3)
  - [ ] Bold text
  - [ ] Italic text
  - [ ] Underline text
  - [ ] Strike through
  - [ ] Ordered list
  - [ ] Unordered list
  - [ ] Blockquote
  - [ ] Code block
  - [ ] Links
  - [ ] Clean formatting

### Test 11.3: Create Post
- [ ] **Test**: Create a new post
- [ ] **Expected**: Post is created and saved
- [ ] **Steps**:
  1. Fill in title
  2. Add content with formatting
  3. Add excerpt (optional)
  4. Add featured image URL
  5. Select category
  6. Add tags (comma-separated)
  7. Choose status (draft/published)
  8. Click "Publish Post" or "Save Draft"
  9. Verify redirect to post detail page

### Test 11.4: Draft vs Published
- [ ] **Test**: Save as draft
- [ ] **Expected**: Draft not visible in public posts
- [ ] **Steps**:
  1. Create post as draft
  2. Logout
  3. Verify post not in public listing
  4. Login as author
  5. Verify can see own drafts

### Test 11.5: Edit Post Page
- [ ] **Test**: Edit existing post
- [ ] **Expected**: Form loads with existing data
- [ ] **Steps**:
  1. Login as post author
  2. View post detail
  3. Click "Edit Post" button
  4. Verify form loads with current data
  5. Make changes
  6. Click "Update Post"
  7. Verify changes saved

### Test 11.6: Edit Authorization
- [ ] **Test**: Try to edit someone else's post
- [ ] **Expected**: Shows "Not authorized" message
- [ ] **Steps**:
  1. Login as different user
  2. Try to access `/edit/:id` of another user's post
  3. Verify authorization check

### Test 11.7: Delete Post
- [ ] **Test**: Delete a post
- [ ] **Expected**: Post is deleted
- [ ] **Steps**:
  1. Login as post author
  2. Edit post
  3. Click "Delete" button
  4. Confirm deletion
  5. Verify redirect to posts page
  6. Verify post no longer exists

### Test 11.8: Form Validation
- [ ] **Test**: Submit form with missing required fields
- [ ] **Expected**: Shows validation errors
- [ ] **Steps**:
  1. Try to submit without title
  2. Verify error message
  3. Try to submit without content
  4. Verify error message

### Test 11.9: Excerpt Character Limit
- [ ] **Test**: Type in excerpt field
- [ ] **Expected**: Shows character count (max 300)
- [ ] **Steps**:
  1. Type in excerpt field
  2. Verify counter updates
  3. Try to exceed 300 characters
  4. Verify limit enforced

### Test 11.10: Category Selection
- [ ] **Test**: Select category from dropdown
- [ ] **Expected**: Categories load from API
- [ ] **Steps**:
  1. Open category dropdown
  2. Verify categories are listed
  3. Select a category
  4. Verify selection saved

---

## PHASE 12: Comments UI

### Test 12.1: View Comments
- [ ] **Test**: View comments on post
- [ ] **Expected**: Comments display below post
- [ ] **Verify**:
  - [ ] Comment count shown
  - [ ] Comments sorted by newest first
  - [ ] Author name and avatar
  - [ ] Comment content
  - [ ] Timestamp

### Test 12.2: Add Comment
- [ ] **Test**: Add a comment
- [ ] **Expected**: Comment is posted
- [ ] **Steps**:
  1. Login
  2. View post
  3. Type comment in textarea
  4. Click "Post Comment"
  5. Verify comment appears

### Test 12.3: Comment Without Login
- [ ] **Test**: Try to comment without login
- [ ] **Expected**: Shows message to login
- [ ] **Steps**:
  1. Logout
  2. View post
  3. Verify comment form shows login prompt

### Test 12.4: Reply to Comment
- [ ] **Test**: Reply to a comment
- [ ] **Expected**: Nested reply appears
- [ ] **Steps**:
  1. Login
  2. Click "Reply" on a comment
  3. Type reply
  4. Click "Post Reply"
  5. Verify reply appears nested under parent

### Test 12.5: Delete Comment
- [ ] **Test**: Delete own comment
- [ ] **Expected**: Comment is removed
- [ ] **Steps**:
  1. Login as comment author
  2. Click delete button on own comment
  3. Verify comment deleted

### Test 12.6: Delete Authorization
- [ ] **Test**: Try to delete someone else's comment
- [ ] **Expected**: Delete button not visible
- [ ] **Steps**:
  1. Login as different user
  2. View comments
  3. Verify no delete button on others' comments

### Test 12.7: Admin Delete
- [ ] **Test**: Admin can delete any comment
- [ ] **Expected**: Admin sees delete on all comments
- [ ] **Steps**:
  1. Login as admin
  2. View comments
  3. Verify delete button on all comments

### Test 12.8: Nested Comments Display
- [ ] **Test**: View nested comment structure
- [ ] **Expected**: Replies are indented and styled differently
- [ ] **Verify**:
  - [ ] Visual indentation
  - [ ] Different background color
  - [ ] Smaller avatar size

---

## Integration Tests

### Test INT-1: Complete User Flow
- [ ] **Test**: Full user journey
- [ ] **Steps**:
  1. Register new account
  2. Login
  3. Search for posts
  4. View search results
  5. Click on a post
  6. Like the post
  7. Add a comment
  8. Reply to a comment
  9. Create new post
  10. Edit own post
  11. Delete own post
  12. Logout

### Test INT-2: Cross-Feature Integration
- [ ] **Test**: Search finds newly created posts
- [ ] **Steps**:
  1. Create post with unique keyword
  2. Search for that keyword
  3. Verify post appears in results

### Test INT-3: Real-time Updates
- [ ] **Test**: Like/comment counts update
- [ ] **Steps**:
  1. Open post in two browser windows
  2. Like in one window
  3. Refresh other window
  4. Verify count updated

---

## Performance Tests

### Test PERF-1: Search Performance
- [ ] **Test**: Search with large dataset
- [ ] **Expected**: Results return in < 1 second
- [ ] **Note**: Create 100+ posts for testing

### Test PERF-2: Editor Performance
- [ ] **Test**: Type in editor with large content
- [ ] **Expected**: No lag or stuttering
- [ ] **Note**: Paste 5000+ words

---

## Browser Compatibility

### Test BROWSER-1: Chrome
- [ ] All features work in Chrome

### Test BROWSER-2: Firefox
- [ ] All features work in Firefox

### Test BROWSER-3: Safari
- [ ] All features work in Safari

### Test BROWSER-4: Edge
- [ ] All features work in Edge

---

## Mobile Responsiveness

### Test MOBILE-1: Mobile View
- [ ] **Test**: View on mobile device or DevTools mobile view
- [ ] **Expected**: All pages are responsive
- [ ] **Check**:
  - [ ] Home page
  - [ ] Posts page
  - [ ] Post detail
  - [ ] Create/Edit forms
  - [ ] Search results
  - [ ] Comments section

---

## Summary

### Completed Features
- [ ] Phase 7: Search Functionality
- [ ] Phase 8: Frontend Setup
- [ ] Phase 9: Authentication UI
- [ ] Phase 10: Blog Post UI
- [ ] Phase 11: Rich Text Editor
- [ ] Phase 12: Comments UI

### Known Issues
[List any issues found during testing]

### Next Steps
[List any remaining work or improvements needed]
