<img width="1919" height="995" alt="Screenshot From 2025-10-17 10-06-58" src="https://github.com/user-attachments/assets/fc020833-b288-40c5-ac0e-8eb5b3ea947d" />
<img width="1919" height="995" alt="Screenshot From 2025-10-17 10-07-08" src="https://github.com/user-attachments/assets/46557f20-2377-40ed-8459-6e384c63accf" />



# Task Manager Dashboard 🌟

## Project Overview 📋
This is a full-stack Task Manager Dashboard application. It allows users to create, update, view, and delete tasks with filtering and pagination features, along with an audit log of all actions. 🎉

## Tech Stack 💻
- **Backend**: Java Spring with Spring Security 🔒
- **Frontend**: HTML, CSS, JavaScript 🌐
- **Database**: MySQL (via Docker 🐳)

## Prerequisites ✅
- Java Development Kit (JDK) 17+ ☕
- Maven 🛠️
- Docker 🐳

## Installation 🚀
1. Clone the repository:
   ```bash
   git clone <your-repo-link>
   cd task-manager-dashboard
   ```
2. Start MySQL with Docker:
   ```bash
   cd docker
   docker-compose up -d
   ```
   - Ensure the `application.properties` file in `src/main/resources` is configured with:
     - `spring.datasource.url=jdbc:mysql://localhost:3306/taskdb`
     - `spring.datasource.username=rootuser`
     - `spring.datasource.password=rootpass`
3. Build the backend:
   ```bash
   cd backend
   mvn clean install
   ```
4. Start the backend server:
   ```bash
   mvn spring-boot:run
   ```

## Running the Application 🎮
- Ensure the backend is running on `http://localhost:8080`.
- Open `http://localhost:8080` in your browser to access the dashboard.
- Use the following credentials for Basic Authentication with Spring Security:
  - Username: `admin`
  - Password: `password123` 🔐

## UI Design 🎨
- **Layout**: Features a sleek left sidebar with icons for navigation (Tasks 📋 and Audit Logs 📊), a top header bar with the "Task Manager" title, and a main area displaying a task table.
- **Task Table**: Includes columns for ID, Title, Description, Created At, and Actions (Edit ✏️ and Delete 🗑️ buttons per row with icons).
- **Styling**: Utilizes a modern dark theme with a navy background (#1A2A44), white text, and vibrant action buttons (Green ✅ for Create, Yellow ⚠️ for Update, Red ❌ for Delete). Icons are added using Font Awesome or similar libraries.
- **Responsiveness**: Optimized for desktop and tablet views with a collapsible sidebar and responsive table layout.
- **Modal/Drawer**: Create and Update tasks open a stylish modal with a semi-transparent overlay, featuring input fields for Title and Description with validation feedback.

## API Endpoints 🌐
- `GET /api/tasks` - Fetch paginated list of tasks
- `POST /api/tasks` - Create a new task
- `PUT /api/tasks/:id` - Update existing task
- `DELETE /api/tasks/:id` - Delete a task
- `GET /api/logs` - Get all audit logs

## Usage 🖱️
- Navigate using the left sidebar (Tasks 📋 and Audit Logs 📊).
- Use the search bar 🔍 to filter tasks by title or description.
- Create, edit, or delete tasks using the respective buttons with icons.
- View audit logs with color-coded action types (Green ✅ for Create, Yellow ⚠️ for Update, Red ❌ for Delete).

## Notes 📝
- Ensure input validation is active (title max 100 chars, description max 500 chars).
- Sanitize inputs to prevent XSS. 🚫
- The application includes Spring Security for Basic Authentication for all API routes. 🔒

## Docker Cleanup 🗑️
- To stop and remove the MySQL container:
  ```bash
  docker-compose down
  ```
