# College Course Registration System 🎓

## ✨ Overview
This project enables students to:
- ✅ **Register for courses** offered by their college.
- ✅ **Check grades** for completed courses.

The system provides a user-friendly interface and robust backend to ensure a seamless experience while maintaining data security.

---

## 💻 Technologies Used
### Backend:
- **Node.js**: For server-side logic and handling API requests.
- **SQL**: For managing relational database operations.
  
### Frontend:
- **HTML & CSS**: To create an intuitive and visually appealing user interface.

---

## 🔒 Security Features
1. **Password Hashing**: 
   - Ensures user credentials are securely stored using industry-standard hashing techniques.
2. **Web Token Authentication**:
   - Uses **JWT** (JSON Web Tokens) to authenticate and authorize users during interactions.


---

## 🛠️ Features
- 📝 **Course Registration**:
  - Students can browse available courses, check their sections, and register for the desired courses.
- 📊 **Grade Review**:
  - View a list of completed courses along with corresponding grades.
- 🚀 **Dynamic Tables**:
  - Provides real-time updates for available and registered courses with status indicators.
  
---

## 🚧 How It Works
1. **User Authentication**:
   - On login, a token is issued and verified to protect sensitive routes.
2. **Course Listings**:
   - Fetches and displays available courses dynamically for a given semester and year.
3. **Grade Reports**:
   - Displays past course performance with an elegant tabular format.

---

## 📦 Installation and Setup
1. INSTALL **postgress** in your system and setup your password(here it is password).
2. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/college-course-registration.git
   cd college-course-registration
3.  In the directory run
    ```bash
    psql -U postgres -h localhost -p 5432
    enter password
    CREATE DATABASE students;
    \c students
    \i ddl.sql
    \i univ-data.sql
4. Install packages used in **server.js**  using **npm**.
5. Run
   ```bash
   node server.js
6. Go to **localhost:5000** and you can see the demo
## 🔗 Future Enhancements
1. Add Admin Panel for managing courses and student enrollments.
2. Integrate Email Notifications for registration confirmation.
3. Enhance UI with frameworks like React.js or Bootstrap.


Crafted with ❤️ using Node.js, SQL, and a passion for learning. 🚀








