import Homework from "../models/homeworkModel.js";
import Submission from "../models/submissionModel.js";
import Class from "../models/classModel.js";

export const createHomework = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { classId, title, description, maxScore, dueDate, attachments } =
      req.body;

    const classData = await Class.findById(classId);
    if (!classData) {
      return res.status(404).json({ success: false, message: "ไม่พบวิชานี้" });
    }
    if (classData.teacher.toString() !== teacherId) {
      return res
        .status(403)
        .json({ success: false, message: "คุณไม่ได้สอนวิชานี้" });
    }

    const homework = await Homework.create({
      class: classId,
      teacher: teacherId,
      title,
      description,
      maxScore: maxScore || 100,
      dueDate,
      attachments: attachments || [],
    });

    return res.status(201).json({
      success: true,
      message: "สร้างการบ้านสำเร็จ",
      data: homework,
    });
  } catch (error) {
    console.error("Error creating homework:", error);
    return res.status(500).json({ success: false, message: "เกิดข้อผิดพลาด" });
  }
};

export const getHomeworkByClass = async (req, res) => {
  try {
    const { classId } = req.params;

    const homework = await Homework.find({
      class: classId,
      status: { $ne: "draft" },
    })
      .populate("teacher", "firstName lastName")
      .sort({ dueDate: 1 });

    return res.status(200).json({
      success: true,
      data: homework,
    });
  } catch (error) {
    console.error("Error fetching homework:", error);
    return res.status(500).json({ success: false, message: "เกิดข้อผิดพลาด" });
  }
};

export const getMyHomework = async (req, res) => {
  try {
    const studentId = req.user.id;

    const enrolledClasses = await Class.find({ students: studentId }).select(
      "_id"
    );
    const classIds = enrolledClasses.map((c) => c._id);

    const homework = await Homework.find({
      class: { $in: classIds },
      status: "published",
    })
      .populate("class", "classCode className")
      .populate("teacher", "firstName lastName")
      .sort({ dueDate: 1 });

    const submissions = await Submission.find({
      student: studentId,
      homework: { $in: homework.map((h) => h._id) },
    });

    const homeworkWithStatus = homework.map((hw) => {
      const submission = submissions.find(
        (s) => s.homework.toString() === hw._id.toString()
      );
      return {
        ...hw.toObject(),
        submitted: !!submission,
        submission: submission
          ? {
              submittedAt: submission.submittedAt,
              isLate: submission.isLate,
              score: submission.score,
              status: submission.status,
            }
          : null,
      };
    });

    return res.status(200).json({
      success: true,
      data: homeworkWithStatus,
    });
  } catch (error) {
    console.error("Error fetching my homework:", error);
    return res.status(500).json({ success: false, message: "เกิดข้อผิดพลาด" });
  }
};

export const getHomeworkById = async (req, res) => {
  try {
    const { homeworkId } = req.params;
    const userId = req.user?.id;

    const homework = await Homework.findById(homeworkId)
      .populate("class", "classCode className")
      .populate("teacher", "firstName lastName");

    if (!homework) {
      return res.status(404).json({ success: false, message: "ไม่พบการบ้าน" });
    }

    let submission = null;
    if (userId && req.user?.role === "student") {
      submission = await Submission.findOne({
        homework: homeworkId,
        student: userId,
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        ...homework.toObject(),
        submission: submission,
      },
    });
  } catch (error) {
    console.error("Error fetching homework:", error);
    return res.status(500).json({ success: false, message: "เกิดข้อผิดพลาด" });
  }
};

export const submitHomework = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { homeworkId } = req.params;
    const { content } = req.body;

    const files = req.files || [];
    const attachments = files.map((file) => {

      const decodedName = Buffer.from(file.originalname, "latin1").toString(
        "utf8"
      );
      return {
        fileName: decodedName,
        fileUrl: `/uploads/homework/${file.filename}`,
        fileType: file.mimetype,
        uploadedAt: new Date(),
      };
    });

    const homework = await Homework.findById(homeworkId);
    if (!homework) {
      return res.status(404).json({ success: false, message: "ไม่พบการบ้าน" });
    }

    const classData = await Class.findById(homework.class);
    if (!classData.students.includes(studentId)) {
      return res
        .status(403)
        .json({ success: false, message: "คุณไม่ได้ลงทะเบียนวิชานี้" });
    }

    const isLate = new Date() > new Date(homework.dueDate);

    const submission = await Submission.findOneAndUpdate(
      { homework: homeworkId, student: studentId },
      {
        content: content || "",
        attachments,
        submittedAt: new Date(),
        isLate,
        status: "submitted",
      },
      { upsert: true, new: true }
    );

    return res.status(200).json({
      success: true,
      message: isLate ? "ส่งการบ้านสำเร็จ (ส่งช้า)" : "ส่งการบ้านสำเร็จ",
      data: submission,
    });
  } catch (error) {
    console.error("Error submitting homework:", error);
    return res.status(500).json({ success: false, message: "เกิดข้อผิดพลาด" });
  }
};

export const getSubmissions = async (req, res) => {
  try {
    const { homeworkId } = req.params;

    const submissions = await Submission.find({ homework: homeworkId })
      .populate("student", "username firstName lastName")
      .sort({ submittedAt: 1 });

    return res.status(200).json({
      success: true,
      data: submissions,
    });
  } catch (error) {
    console.error("Error fetching submissions:", error);
    return res.status(500).json({ success: false, message: "เกิดข้อผิดพลาด" });
  }
};

export const gradeSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { score, feedback } = req.body;

    const submission = await Submission.findByIdAndUpdate(
      submissionId,
      {
        score,
        feedback: feedback || "",
        gradedAt: new Date(),
        status: "graded",
      },
      { new: true }
    );

    if (!submission) {
      return res
        .status(404)
        .json({ success: false, message: "ไม่พบ submission" });
    }

    return res.status(200).json({
      success: true,
      message: "ให้คะแนนสำเร็จ",
      data: submission,
    });
  } catch (error) {
    console.error("Error grading submission:", error);
    return res.status(500).json({ success: false, message: "เกิดข้อผิดพลาด" });
  }
};

export const deleteHomework = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { homeworkId } = req.params;

    const homework = await Homework.findById(homeworkId);
    if (!homework) {
      return res.status(404).json({ success: false, message: "ไม่พบการบ้าน" });
    }
    if (homework.teacher.toString() !== teacherId) {
      return res
        .status(403)
        .json({ success: false, message: "คุณไม่ได้สร้างการบ้านนี้" });
    }

    await Submission.deleteMany({ homework: homeworkId });
    await Homework.findByIdAndDelete(homeworkId);

    return res.status(200).json({
      success: true,
      message: "ลบการบ้านสำเร็จ",
    });
  } catch (error) {
    console.error("Error deleting homework:", error);
    return res.status(500).json({ success: false, message: "เกิดข้อผิดพลาด" });
  }
};
