import Class from "../models/classModel.js";
import User from "../models/userModel.js";

export const createClass = async (req, res) => {
  try {
    const {
      classCode,
      className,
      section,
      description,
      schedule,
      academicYear,
      semester,
    } = req.body;

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

    const newClass = new Class({
      classCode,
      className,
      section,
      description,
      schedule,
      academicYear,
      semester,
      teacher: req.user.id,
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

    if (classData.teacher.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: "คุณไม่มีสิทธิ์แก้ไขรายวิชานี้",
      });
    }

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

    if (classData.teacher.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: "คุณไม่มีสิทธิ์จัดการรายวิชานี้",
      });
    }

    const student = await User.findById(studentId);
    if (!student || student.role !== "student") {
      return res.status(404).json({
        success: false,
        message: "ไม่พบนักศึกษา",
      });
    }

    if (classData.students.includes(studentId)) {
      return res.status(400).json({
        success: false,
        message: "นักศึกษาอยู่ในรายวิชานี้แล้ว",
      });
    }

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

    if (classData.teacher.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: "คุณไม่มีสิทธิ์จัดการรายวิชานี้",
      });
    }

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

export const importStudentsToClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const { studentIds } = req.body;

    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "กรุณาระบุรายชื่อนักศึกษา",
      });
    }

    const classData = await Class.findById(classId);

    if (!classData) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบรายวิชา",
      });
    }

    if (classData.teacher.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: "คุณไม่มีสิทธิ์จัดการรายวิชานี้",
      });
    }

    const cleanedIds = studentIds
      .map((id) => id.trim().toLowerCase())
      .filter(Boolean);

    const students = await User.find({
      role: "student",
      $or: [{ username: { $in: cleanedIds } }, { email: { $in: cleanedIds } }],
    });

    const results = {
      added: [],
      alreadyExists: [],
      notFound: [],
    };

    const foundIds = students
      .map((s) => s.username.toLowerCase())
      .concat(students.map((s) => s.email?.toLowerCase()).filter(Boolean));

    results.notFound = cleanedIds.filter((id) => !foundIds.includes(id));

    for (const student of students) {
      if (classData.students.includes(student._id)) {
        results.alreadyExists.push({
          username: student.username,
          name: `${student.firstName || ""} ${student.lastName || ""}`.trim(),
        });
      } else {
        classData.students.push(student._id);
        results.added.push({
          username: student.username,
          name: `${student.firstName || ""} ${student.lastName || ""}`.trim(),
        });
      }
    }

    await classData.save();

    return res.status(200).json({
      success: true,
      message: `เพิ่มนักศึกษาสำเร็จ ${results.added.length} คน`,
      data: {
        added: results.added,
        alreadyExists: results.alreadyExists,
        notFound: results.notFound,
        summary: {
          total: cleanedIds.length,
          added: results.added.length,
          alreadyExists: results.alreadyExists.length,
          notFound: results.notFound.length,
        },
      },
    });
  } catch (error) {
    console.error("Error importing students:", error);
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการ Import",
    });
  }
};
