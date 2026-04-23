
# 📄 Next.js Full Stack Developer Assessment

## **Objective:**

Create a simple Employee Management System with the following features:

* User authentication and authorization with role-based access (Admin/HR and Employee).
* Employee check-in and check-out functionality.
* Leave request management with three statuses (Pending, Approved, Declined).
* Task management, where employees can create tasks, update task statuses, and Admin/HR can assign and manage tasks.
* Basic frontend implementation using **Next.js** to interact with backend APIs.

---

## **Assessment Tasks:**

## **1. Full Stack Development (Next.js, Prisma, NeonDB):**

### **User Authentication & Authorization:**

* Implement a user registration and login system using JWT for authentication.
* Implement role-based access control with two roles: Admin/HR and Employee.
* Admin/HR should have access to all employee data, leave requests, and task management.
* Employees should only have access to their own data, tasks, and leave requests.

---

### **Employee Check-in/Check-out:**

* Create API routes for employees to check in and check out of work using Next.js API routes.
* Ensure that check-in and check-out times are recorded properly in the database.
* Admin/HR should be able to view the check-in/check-out records of all employees.

---

### **Leave Request Management:**

* Create API routes for employees to submit leave requests.
* Leave requests should have three possible statuses: Pending, Approved, and Declined.
* Admin/HR should be able to view all leave requests and change the status of each request.

---

### **Task Management:**

#### **Employee Task Creation:**

* Employees can create tasks for themselves.
* Tasks should have a title, description, and due date.
* When an employee creates a task, it should be set to In Progress.

#### **Task Status Updates:**

* Employees can update the status of their tasks to In Progress and Done.

#### **Admin/HR Task Assignment:**

* Admin/HR can assign tasks to employees.
* Admin/HR can view all tasks and change task statuses.

#### **Task Statuses:**

* Tasks should have three statuses: To Do, In Progress, Done.

#### **API Routes for Task Management:**

* Create CRUD operations for managing tasks (/api/tasks):

  * POST: Create a new task (employee/admin/hr).
  * GET: Get all tasks (Admin/HR) or employee-specific tasks (Employee).
  * PATCH: Update task status (employee/admin/hr).
  * DELETE: Remove tasks (Admin/HR).

---

### **Password Management:**

* Implement an endpoint for password change, protected by OTP verification.
* Admin/HR and Employees should be able to change their password after OTP verification.

---

## **2. Frontend Development (Next.js):**

### **1. Login & Registration:**

* Create a simple login page where users can authenticate themselves.
* Provide a registration page where new users can sign up.

---

### **2. Employee Dashboard:**

Create a dashboard for employees where they can:

* Check in and check out.
* Submit leave requests and view the status of their leave requests.
* Create, view, and update their own tasks (with statuses: To Do, In Progress, Done).

---

### **3. Admin/HR Dashboard:**

Create a dashboard for Admin/HR where they can:

* View all employee data.
* Manage check-in/check-out records.
* Approve or decline leave requests.
* Assign tasks to employees and update task statuses.
* View all tasks and their statuses.

---

### **4. Task Management UI:**

* Admin/HR interface to view all tasks, filter by employee, and update the task status.
* Employees should see tasks assigned to them and be able to update the status.

---

### **5. Notifications:**

* Implement success/error notifications for key actions like login, check-in, task assignment, and leave request submission.

---

## **Feature Breakdown**

| Feature             | Description                                                       | Access             |
| ------------------- | ----------------------------------------------------------------- | ------------------ |
| Login/Registration  | JWT-based authentication for users using Next.js API routes       | Admin/HR, Employee |
| Check-in/Check-out  | Employees can check in and check out of work                      | Employee           |
| Leave Requests      | Employees can submit leave requests. Admin/HR can approve/decline | Admin/HR, Employee |
| Task Management     | Task creation, assignment, and management                         | Admin/HR, Employee |
| Task Status         | Task statuses: To Do, In Progress, Done                           | Admin/HR, Employee |
| Password Management | OTP-based password reset and change functionality                 | Admin/HR, Employee |
| Dashboard           | Employees and Admin/HR have different views on the dashboard      | Admin/HR, Employee |

---

## **3. Optional Tasks (Bonus Points):**

* Implement a dashboard that shows analytics (e.g., employee attendance statistics, leave status breakdown, task completion rates).
* Secure sensitive API routes with middleware that checks user roles.
* Add unit tests for the critical parts of the application.

---

## **Submission Guidelines:**

* GitHub Repository: Create a public GitHub repository and push your code to it. Provide the link in your submission.
* Documentation: Include a README file that describes how to set up and run the project locally.
* Include details about the API routes and how to interact with them.

---

## **Evaluation Criteria:**

* Code Quality: Clean, readable, and well-organized code with proper comments.
* Functionality: Proper implementation of the required features.
* Security: Implementation of secure password storage, role-based access control, and proper authentication.
* UI/UX: A functional and user-friendly frontend.
* Bonus Points: Additional features, code quality, and testing.

---

