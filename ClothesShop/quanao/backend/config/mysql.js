import mysql from 'mysql2'
import dotenv from 'dotenv'



// load các biến môi trường từ file .env
dotenv.config();

// tạo connection single để kết nối
const connectDB = mysql.createConnection(process.env.MYSQL_URI);


export default connectDB;