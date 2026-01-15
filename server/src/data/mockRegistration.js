export const mockCourses = [
  {
    courseCode: "CS101",
    section: "01",
    courseName: "การเขียนโปรแกรมคอมพิวเตอร์ 1",
    credits: 3,
    instructor: {
      name: "ดร.สมชาย วิชาการ",
      email: "panuponghansana@gmail.com",
    },
    schedule: [
      {
        day: "monday",
        startTime: "09:00",
        endTime: "12:00",
        room: "IT-301",
      },
    ],
    midtermExam: {
      date: "2025-02-17",
      startTime: "09:00",
      endTime: "12:00",
      room: "EXAM-A01",
    },
    finalExam: {
      date: "2025-04-21",
      startTime: "09:00",
      endTime: "12:00",
      room: "EXAM-A01",
    },
  },
  {
    courseCode: "CS102",
    section: "01",
    courseName: "การเขียนโปรแกรมคอมพิวเตอร์ 2",
    credits: 3,
    instructor: {
      name: "ดร.สมชาย วิชาการ",
      email: "panuponghansana@gmail.com",
    },
    schedule: [
      {
        day: "tuesday",
        startTime: "13:00",
        endTime: "16:00",
        room: "IT-302",
      },
    ],
    midtermExam: {
      date: "2025-02-18",
      startTime: "13:00",
      endTime: "16:00",
      room: "EXAM-A02",
    },
    finalExam: {
      date: "2025-04-22",
      startTime: "13:00",
      endTime: "16:00",
      room: "EXAM-A02",
    },
  },
  {
    courseCode: "MATH201",
    section: "02",
    courseName: "คณิตศาสตร์วิศวกรรม",
    credits: 3,
    instructor: {
      name: "ดร.สมชาย วิชาการ",
      email: "panuponghansana@gmail.com",
    },
    schedule: [
      {
        day: "wednesday",
        startTime: "09:00",
        endTime: "12:00",
        room: "SC-201",
      },
    ],
    midtermExam: {
      date: "2025-02-19",
      startTime: "09:00",
      endTime: "12:00",
      room: "EXAM-B01",
    },
    finalExam: {
      date: "2025-04-23",
      startTime: "09:00",
      endTime: "12:00",
      room: "EXAM-B01",
    },
  },
  {
    courseCode: "ENG101",
    section: "03",
    courseName: "ภาษาอังกฤษเพื่อการสื่อสาร",
    credits: 3,
    instructor: {
      name: "ดร.สมชาย วิชาการ",
      email: "panuponghansana@gmail.com",
    },
    schedule: [
      {
        day: "thursday",
        startTime: "13:00",
        endTime: "16:00",
        room: "LA-101",
      },
    ],
    midtermExam: {
      date: "2025-02-20",
      startTime: "13:00",
      endTime: "16:00",
      room: "EXAM-C01",
    },
    finalExam: {
      date: "2025-04-24",
      startTime: "13:00",
      endTime: "16:00",
      room: "EXAM-C01",
    },
  },
  {
    courseCode: "PHY101",
    section: "01",
    courseName: "ฟิสิกส์ทั่วไป",
    credits: 3,
    instructor: {
      name: "ดร.สมชาย วิชาการ",
      email: "panuponghansana@gmail.com",
    },
    schedule: [
      {
        day: "friday",
        startTime: "09:00",
        endTime: "12:00",
        room: "SC-301",
      },
    ],
    midtermExam: {
      date: "2025-02-21",
      startTime: "09:00",
      endTime: "12:00",
      room: "EXAM-B02",
    },
    finalExam: {
      date: "2025-04-25",
      startTime: "09:00",
      endTime: "12:00",
      room: "EXAM-B02",
    },
  },
];

export const mockEnrollments = {
  1651010541132: ["CS101", "CS102", "MATH201", "ENG101"],
  1651010541001: ["CS101", "MATH201", "PHY101"],
  1651010541002: ["CS102", "ENG101", "PHY101"],
};

export const getEnrolledCourses = (studentId) => {
  const enrolledCodes = mockEnrollments[studentId] || [];
  return mockCourses.filter((course) =>
    enrolledCodes.includes(course.courseCode)
  );
};

export const getAllCourses = () => {
  return mockCourses;
};

export const getCourseByCode = (courseCode) => {
  return mockCourses.find((course) => course.courseCode === courseCode) || null;
};

export const getTeacherCourses = (teacherEmail, teacherName = "") => {
  if (!teacherEmail && !teacherName) return [];

  return mockCourses.filter((course) => {

    const emailMatch =
      teacherEmail &&
      course.instructor.email.toLowerCase() === teacherEmail.toLowerCase();

    const nameMatch =
      teacherName && course.instructor.name.includes(teacherName);

    if (teacherName) {
      return emailMatch && nameMatch;
    }
    return emailMatch;
  });
};

export default {
  mockCourses,
  mockEnrollments,
  getEnrolledCourses,
  getAllCourses,
  getCourseByCode,
  getTeacherCourses,
};
