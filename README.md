You are a senior full-stack developer specializing in Angular and Node.js applications. I need you to integrate an "Experience" module into an existing E-tourism platform frontend.

**Project Context:**
- E-tourism platform similar to GetYourGuide/Viator
- Frontend: Angular v14 with Angular Material
- Backend: using Node.js/Express/TypeScript with remote vm machine 
- Backend is deployed and fully functional on remote VM

**Current Status:**
- Backend API is working and tested via Postman
- Frontend runs locally and connects to other modules (Flights, Hotels, Visa, ERP)
- Experience module backend is complete but not integrated into frontend

**Integration Requirements:**

1. **API Integration:**
   - Base URL: `http://<remote-ip>:<port>/experiences`
   - Available endpoints:
     - GET /experiences (list all)
     - GET /experiences/:id (get single)
     - POST /experiences (create new)
     - DELETE /experiences/:id (delete)

2. **Frontend Components Needed:**
   - Experience list component with search/filter capabilities
   - Experience detail view component
   - Experience creation/edit form component
   - Integration with existing sidebar navigation

3. **Technical Requirements:**
   - Create Angular service for API communication
   - Implement proper routing for experience module
   - Follow existing Angular Material design patterns
   - Handle error states and loading indicators
   - Ensure responsive design

4. **File Structure:**
   ```
   src/app/experience/
   ├── components/
   ├── services/
   ├── models/
   └── experience-routing.module.ts
   ```

**Deliverables:**
- Complete Experience module integration
- Proper error handling and user feedback
- Clean, maintainable code following Angular best practices
- Documentation for any configuration changes needed

Please provide step-by-step implementation with code examples for each component and service.
