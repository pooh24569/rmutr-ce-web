import axios from "axios";
import MockAdapter from "axios-mock-adapter";

// สร้าง mock adapter
const mock = new MockAdapter(axios, { delayResponse: 1000 });

// เก็บข้อมูล users mock
let users = [
  { username: "student1", password: "123456", email: "koonnanutza03@gmail.com" },
];

// LOGIN
mock.onPost(/\/api\/auth\/login/).reply((config) => {
  const { username, password } = JSON.parse(config.data);
  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    return [200, { token: "mock-token-123", user: { username: user.username, email: user.email } }];
  } else {
    return [401, { message: "เข้าสู่ระบบไม่สำเร็จ" }];
  }
});

// RESET EMAIL (ขอรีเซ็ตรหัสผ่าน)
mock.onPost(/\/api\/auth\/reset-password$/).reply((config) => {
  const { email } = JSON.parse(config.data);
  const user = users.find(u => u.email === email);

  if (user) {
    // สร้างลิงก์จำลองสำหรับ reset password
    const resetLink = `http://localhost:5173/reset-password?email=${encodeURIComponent(email)}`;
    console.log("🔗 ลิงก์รีเซ็ตรหัสผ่านจำลอง:", resetLink);

    return [200, { message: "ส่งลิงก์รีเซ็ตรหัสผ่านเรียบร้อย" }];
  } else {
    return [404, { message: "ไม่พบอีเมลในระบบ" }];
  }
});

// RESET PASSWORD
mock.onPost(/\/api\/auth\/reset-password\/confirm/).reply((config) => {
  const { email, password } = JSON.parse(config.data);
  const userIndex = users.findIndex(u => u.email === email);
  if (userIndex !== -1) {
    users[userIndex].password = password;
    return [200, { message: "รีเซ็ตรหัสผ่านเรียบร้อย" }];
  } else {
    return [404, { message: "ไม่พบอีเมลในระบบ" }];
  }
});

export default mock;
