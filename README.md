# TITLE: SMARTTRASH - AN AUTOMATED WASTE MANAGEMENT SYSTEM ♻️

---

## � CERTIFICATE OF AUTHENTICITY
This is to certify that the project entitled **"SmartTrash: Waste Management System"** is a bonafide work carried out by **Megarajan** in partial fulfillment of the requirements for the academic project submission 2026.

---

## 🙏 ACKNOWLEDGEMENTS
I would like to express my deep sense of gratitude to my mentors and the open-source community for their constant encouragement and guidance during the development of this project. Special thanks to the creators of Node.js and Express for providing a robust platform for building scalable web applications.

---

## 📄 ABSTRACT
The **SmartTrash Waste Management System** is a full-stack digital solution designed to streamline urban sanitation workflows. The system replaces traditional manual reporting with a centralized web-based platform, enabling citizens to raise waste pickup requests and administrators to manage resource allocation efficiently. Utilizing **Node.js**, **Express.js**, and **SQLite**, the application provides a lightweight yet secure environment for real-time task tracking, role-based access control, and automated driver assignment.

---

## 📚 TABLE OF CONTENTS
1. [Introduction](#1-introduction)
2. [System Analysis](#2-system-analysis)
3. [System Requirement Specification](#3-system-requirement-specification)
4. [System Design & Diagrams](#4-system-design--diagrams)
5. [Database Architecture](#5-database-architecture)
6. [Setup & Installation](#6-setup--installation)
7. [Testing & User Credentials](#7-testing--user-credentials)
8. [Conclusion & Future Scope](#8-conclusion--future-scope)

---

## 1. INTRODUCTION
### 1.1 Overview
In the era of smart cities, waste management remains a persistent challenge. "SmartTrash" is developed to modernize this sector by providing a transparent interface between three key stakeholders: Citizens, Drivers, and Administrators.

### 1.2 Motivation
- **Automation**: Reducing manual paperwork in waste logging.
- **Transparency**: Allowing users to track their request status.
- **Efficiency**: Helping administrators assign the nearest or most eligible driver to a task.

---

## 2. SYSTEM ANALYSIS
### 2.1 Existing System
- Lack of communication between citizens and municipal authorities.
- Manual assignment of pickup locations leading to route inefficiency.
- No history tracking for requests.

### 2.2 Proposed System
- Real-time digital request submission.
- Automated status updates ("Pending" to "Resolved").
- Secure role-based dashboards for Admin, Driver, and User.

---

## 3. SYSTEM REQUIREMENT SPECIFICATION
### 3.1 Hardware Requirements
- **Processor**: Intel Core i3 or equivalent (Minimum).
- **Memory**: 4 GB RAM.
- **Storage**: 200 MB of Available Space.

### 3.2 Software Requirements
- **Operating System**: Windows 10+, macOS 12+, or Linux.
- **Runtime**: Node.js (v18.x or higher).
- **Editor**: VS Code or any modern IDE.
- **Database**: SQLite3.

---

## 4. SYSTEM DESIGN & DIAGRAMS

### 4.1 Real-World Usage Scenario 🏙️
*Sarah, a resident, notices accumulated waste.*
1. **Sarah (User)**: Logs in -> Raises a Pickup Request -> Enters Address.
2. **Admin**: Views "Unassigned" request -> Assigns to "Driver 01".
3. **Driver 01**: Receives task -> Collects Waste -> Marks as "Resolved".
4. **Sarah**: Checks history -> Sees "Resolved" status.

### 4.2 Data Flow Diagram (DFD)
```text
[ Citizen ] ----(Pickup Request)----> [ Express Backend ] <----(Update Task)---- [ Driver ]
      ^                                     |                                     ^
      |                                     |                                     |
      |                              [ SQLite DB ]                                |
      |                                     |                                     |
      +------------(Status Sync)------------+------------(Assignment)-------------+
                                            |
                                            V
                                     [ Administrator ]
```

### 4.3 Class Diagram
```text
+---------------------+       +---------------------+       +---------------------+
|      User           |       |      Driver         |       |      Admin          |
+---------------------+       +---------------------+       +---------------------+
| - id: Integer       |       | - id: Integer       |       | - email: String     |
| - name: String      |       | - name: String      |       | - role: "admin"     |
| - email: String     |       | - vehicle_num: String|       +---------------------+
| - number: String    |       | - status: String    |       | + login()           |
+---------------------+       +---------------------+       | + getAllRequests()  |
| + signup()          |       | + login()           |       | + assignDriver()    |
| + login()           |       | + getDashboard()    |       | + createDriver()    |
| + submitRequest()   |       | + resolveRequest()  |       +---------------------+
| + getMyRequests()   |       +---------------------+
+---------------------+
          |                              |
          | raises                       | carries out
          v                              v
+---------------------------------------------------------+
|                      Request                            |
+---------------------------------------------------------+
| - id: Integer                                           |
| - user_number: String                                   |
| - request_type: Enum                                    |
| - status: Enum (Pending/Resolved/Rejected)              |
| - assignedDriverId: Integer                             |
| - time_stamp: DateTime                                  |
+---------------------------------------------------------+
```

### 4.4 Sequence Diagram: Waste Pickup Request
```text
User Browser        Frontend Server        Backend API         Database
     |                     |                    |                  |
     |----(Request Home)-->|                    |                  |
     |                     |---(Render EJS)---->|                  |
     | <---(Display Form)--|                    |                  |
     |---(Submit Form)---->|                    |                  |
     |                     |----(JSON API Call)-->|                  |
     |                     |                    |---(Verify JWT)-->|
     |                     |                    |----(SQL INSERT)->|
     |                     |<---(Response 200)--|                  |
     | <---(Alert Success)-|                    |                  |
```

---

## 5. DATABASE ARCHITECTURE
The system uses **SQLite** for lightweight, file-based persistence.

### 5.1 Entity Relationship (ER) Diagram
```text
    +-------------------+               +-------------------+
    |      USERS        |               |      DRIVERS      |
    +-------------------+               +-------------------+
    | PK: id            |               | PK: id            |
    | U:  email         |               | U:  email         |
    | U:  number        |               | U:  number        |
    |     name          |               |     name          |
    |     password      |               |     password      |
    +---------+---------+               +---------+---------+
              |                                   |
              | 1                                 | 1
              |                                   |
              | N                                 | N
    +---------V-----------------------------------V---------+
    |                    REQUESTS                           |
    +-------------------------------------------------------+
    | PK: id                                                |
    | FK: user_number  -----> (Matches USERS.number)        |
    |     request_type, quantity, address, status           |
    | FK: assignedDriverId -----> (Matches DRIVERS.id)      |
    +-------------------------------------------------------+
```

---

## 6. SETUP & INSTALLATION

### 6.1 Backend API (Port 8000)
1. `cd backend`
2. `npm install`
3. `npm run init-db` (Initializes tables and seeds sample data)
4. `npm run dev`

### 6.2 Frontend App (Port 3000)
1. `cd frontend`
2. `npm install`
3. `npm run dev`

---

## 7. TESTING & USER CREDENTIALS

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@example.com` | `Admin@123` |
| **User** | `user1@example.com` | `user123` |
| **Driver** | `driver1@example.com` | `driver123` |

---

## 8. CONCLUSION & FUTURE SCOPE
### 8.1 Conclusion
**SmartTrash** successfully digitizes the waste management lifecycle. The project implementation covers secure authentication, dynamic view rendering with EJS, and relational data management with SQLite.

### 8.2 Future Scope
- **GPS Integration**: Real-time tracking of collection vehicles.
- **Payment Gateway**: Integration for premium commercial waste pickup services.
- **IoT Sensors**: Smart bins that trigger automated requests when 90% full.

---
**Submitted by:** Megarajan
**Project Year:** 2026
