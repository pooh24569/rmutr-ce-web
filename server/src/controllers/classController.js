import Class from "../models/classModel.js";
import User from "../models/userModel.js";

/**
 * สร้าง Class ใหม่ (อาจารย์เท่านั้น)
 */
export const createClass = async (req, res) => {
  try {
    const { 
      classCode, 
      className, 
      section, 
      description, 
      schedule, 
      academicYear, 
      semester 
    } = req.body;

    // ตรวจสอบว่ามี Class ซ้ำหรือไม่
    const existingClass = await Class.findOne({
      classCode,
      section,
      academicYear,
      semester,
    });

    if (existingClass) {
      return res.status(400).json({
        success: false,
        message: "รายวิชานี้มีอยู่แล้ว",
      });
    }

    // สร้าง Class ใหม่
    const newClass = new Class({
      classCode,
      className,
      section,
      description,
      schedule,
      academicYear,
      semester,
      teacher: req.user.id, // อาจารย์ที่ login อยู่
      students: [],
    });

    await newClass.save();

    return res.status(201).json({
      success: true,
      message: "สร้างรายวิชาสำเร็จ",
      data: newClass,
    });
  } catch (error) {
    console.error("Error creating class:", error);
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการสร้างรายวิชา",
    });
  }
};

/**
 * ดึง Class ทั้งหมดของอาจารย์
 */
export const getMyClasses = async (req, res) => {
  try {
    const classes = await Class.find({ teacher: req.user.id })
      .populate("students", "username email firstName lastName")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: classes,
    });
  } catch (error) {
    console.error("Error fetching classes:", error);
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูล",
    });
  }
};

/**
 * ดึง Class ที่นักศึกษาลงทะเบียน
 */
export const getEnrolledClasses = async (req, res) => {
  try {
    const classes = await Class.find({ students: req.user.id })
      .populate("teacher", "username email firstName lastName")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: classes,
    });
  } catch (error) {
    console.error("Error fetching enrolled classes:", error);
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูล",
    });
  }
};

/**
 * ดึงข้อมูล Class ตาม ID
 */
export const getClassById = async (req, res) => {
  try {
    const { classId } = req.params;

    const classData = await Class.findById(classId)
      .populate("teacher", "username email firstName lastName")
      .populate("students", "username email firstName lastName");

    if (!classData) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบรายวิชา",
      });
    }

    return res.status(200).json({
      success: true,
      data: classData,
    });
  } catch (error) {
    console.error("Error fetching class:", error);
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูล",
    });
  }
};

/**
 * แก้ไข Class (อาจารย์เจ้าของเท่านั้น)
 */
export const updateClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const updates = req.body;

    const classData = await Class.findById(classId);

    if (!classData) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบรายวิชา",
      });
    }

    // ตรวจสอบว่าเป็นอาจารย์เจ้าของวิชา
    if (classData.teacher.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: "คุณไม่มีสิทธิ์แก้ไขรายวิชานี้",
      });
    }

    // อัพเดท
    Object.keys(updates).forEach((key) => {
      if (key !== "teacher" && key !== "students") {
        classData[key] = updates[key];
      }
    });

    await classData.save();

    return res.status(200).json({
      success: true,
      message: "แก้ไขรายวิชาสำเร็จ",
      data: classData,
    });
  } catch (error) {
    console.error("Error updating class:", error);
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการแก้ไข",
    });
  }
};

/**
 * ลบ Class (อาจารย์เจ้าของเท่านั้น)
 */
export const deleteClass = async (req, res) => {
  try {
    const { classId } = req.params;

    const classData = await Class.findById(classId);

    if (!classData) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบรายวิชา",
      });
    }

    // ตรวจสอบว่าเป็นอาจารย์เจ้าของวิชา
    if (classData.teacher.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: "คุณไม่มีสิทธิ์ลบรายวิชานี้",
      });
    }

    await Class.findByIdAndDelete(classId);

    return res.status(200).json({
      success: true,
      message: "ลบรายวิชาสำเร็จ",
    });
  } catch (error) {
    console.error("Error deleting class:", error);
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการลบ",
    });
  }
};

/**
 * เพิ่มนักศึกษาเข้า Class
 */
export const addStudentToClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const { studentId } = req.body;

    const classData = await Class.findById(classId);

    if (!classData) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบรายวิชา",
      });
    }

    // ตรวจสอบว่าเป็นอาจารย์เจ้าของวิชา
    if (classData.teacher.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: "คุณไม่มีสิทธิ์จัดการรายวิชานี้",
      });
    }

    // ตรวจสอบว่านักศึกษามีอยู่จริง
    const student = await User.findById(studentId);
    if (!student || student.role !== "student") {
      return res.status(404).json({
        success: false,
        message: "ไม่พบนักศึกษา",
      });
    }

    // ตรวจสอบว่านักศึกษาอยู่ใน Class แล้วหรือยัง
    if (classData.students.includes(studentId)) {
      return res.status(400).json({
        success: false,
        message: "นักศึกษาอยู่ในรายวิชานี้แล้ว",
      });
    }

    // เพิ่มนักศึกษา
    classData.students.push(studentId);
    await classData.save();

    return res.status(200).json({
      success: true,
      message: "เพิ่มนักศึกษาสำเร็จ",
      data: classData,
    });
  } catch (error) {
    console.error("Error adding student:", error);
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาด",
    });
  }
};

/**
 * ลบนักศึกษาออกจาก Class
 */
export const removeStudentFromClass = async (req, res) => {
  try {
    const { classId, studentId } = req.params;

    const classData = await Class.findById(classId);

    if (!classData) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบรายวิชา",
      });
    }

    // ตรวจสอบว่าเป็นอาจารย์เจ้าของวิชา
    if (classData.teacher.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: "คุณไม่มีสิทธิ์จัดการรายวิชานี้",
      });
    }

    // ลบนักศึกษา
    classData.students = classData.students.filter(
      (s) => s.toString() !== studentId
    );
    await classData.save();

    return res.status(200).json({
      success: true,
      message: "ลบนักศึกษาสำเร็จ",
      data: classData,
    });
  } catch (error) {
    console.error("Error removing student:", error);
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาด",
    });
  }
};

/**
 * ดึงรายชื่อนักศึกษาทั้งหมด (สำหรับเพิ่มเข้า Class)
 */
export const getAllStudents = async (req, res) => {
  try {
    const students = await User.find({ role: "student" })
      .select("username email firstName lastName")
      .sort({ firstName: 1 });

    return res.status(200).json({
      success: true,
      data: students,
    });
  } catch (error) {
    console.error("Error fetching students:", error);
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาด",
    });
  }
};
