<h1>Gizmo<h1/>

Overview

Gizmo is an open-source e-commerce platform designed to provide a seamless shopping experience for both customers and administrators. Built with EJS, Node, MongoDB, and Express, it offers robust features for managing products, orders, payments, and more.

Features

Product Management: Easily add, edit, and remove products with detailed descriptions, images, and pricing.

Order Processing: Streamlined order management system to track and fulfill customer orders efficiently.

User Authentication: Secure user authentication and authorization system to manage customer accounts and access control.

Payment Integration: Seamless integration with Razorpay for secure online transactions.

OTP Verification: Utilizes Nodemailer for sending OTPs during the authentication process.

Responsive Design: Mobile-friendly interface ensuring a smooth shopping experience across devices.

Search and Filtering: Powerful search and filtering capabilities to help users find products quickly.

Inventory Management: Real-time inventory tracking and management to avoid stockouts and overstocking.

Analytics and Reporting: Comprehensive analytics and reporting tools to gain insights into sales performance, customer behavior, and more.

Customization: Highly customizable platform allowing for easy branding and tailored user experiences.


Follow these steps to get Gizmo up and running on your local machine:

Clone the Repository: git clone https://github.com/muhammedt1207/gizmo.git

Install Dependencies: cd gizmo && npm install

Configure Environment Variables: Set up environment variables for database connection, API keys, etc.
Run the Application: npm start

Access the Application: Open your browser and navigate to http://localhost:3000
For detailed installation and usage instructions, refer to the Documentation.


Payment Integration
Gizmo integrates with Razorpay to facilitate secure online payments. Ensure you have a Razorpay account and configure your API keys in the environment variables.


OTP Verification
Nodemailer is used for sending OTPs during the authentication process. Configure your email settings in the environment variables to enable OTP verification.


Contributing
We welcome contributions from the community to improve Gizmo. If you'd like to contribute, please follow our Contributing Guidelines.
