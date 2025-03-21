import express from "express";
import {
  getAllBlog,
  updateBlog,
  deleteBlog,
  createBlog,
} from "../controller/admin/blogAdminController.js";
import {
  newCourse,
  deleteCourse,
  getAllCourses,
  updateCourses,
} from "../controller/admin/coursesAdminController.js";
import {
  allUsers,
  updateUser,
  removeUser,
} from "../controller/admin/userAdminController.js";
import {
  newStudent,
  getStudents,
  updateStudent,
  removeStudent,
} from "../controller/admin/ourStudentsAdminController.js";

const route = express.Router();

route.post("/blogs/create", createBlog); //working
route.get("/blogs/all", getAllBlog); // working
route.put("/blogs/update", updateBlog); //working
route.delete("/blogs/delete", deleteBlog); //working

// // ----------------

route.post("/courses/create", newCourse); //working
route.get("/courses/all", getAllCourses); //working
route.put("/courses/update", updateCourses); //working
route.delete("/courses/remove", deleteCourse); //working

// // ----------------
route.get("/our_students/getall", getStudents); //working
route.post("/our_students/create", newStudent); //working
route.put("/our_students/update", updateStudent); //working
route.delete("/our_students/remove", removeStudent); //working

// -----------------

route.get("/users/all", allUsers); //working
route.put("/users/update", updateUser); // working
route.delete("/users/remove", removeUser); //working

// ------------------

export default route;
