import express from "express";
import {
  createNewBlog,
  deleteBlog,
  getAllBlog,
  updateBlog,
} from "../controller/admin/blogAdminController";
import {
  deleteCourse,
  getAllCourses,
  updateCourses,
} from "../controller/admin/coursesAdminController";
import {
  getStudents,
  newStudent,
  removeStudent,
  updateStudent,
} from "../controller/admin/ourStudentsAdminController";
import {
  allUsers,
  removeAllUnverifiedUsers,
} from "../controller/admin/userAdminController";

const route = express.Router();

route.get("/blogs", getAllBlog);
route.post("/blogs", createNewBlog);
route.put("/blogs", updateBlog);
route.delete("/blogs", deleteBlog);

// ----------------

route.get("/courses", getAllCourses);
route.put("/courses", updateCourses);
route.delete("/courses", deleteCourse);

// ----------------
route.get("/our_students", getStudents);
route.post("/our_students", newStudent);
route.put("/our_students", updateStudent);
route.delete("/our_students", removeStudent);

// -----------------

route.get("/users", allUsers);
route.put("/users", updateStudent);
route.delete("/users", removeStudent);
route.delete("/users/delete_unverified", removeAllUnverifiedUsers);

// ------------------

export default route;
