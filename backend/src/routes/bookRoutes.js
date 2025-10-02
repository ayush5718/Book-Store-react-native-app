import express from "express";
import cloudinary from "../lib/cloudinary.js";
import Book from "../models/Book.js";
import { protectRoute } from "../middleware/auth.middleware.js";
const router = express.Router();

//creating book
// as if we dont protect this route then anyone can come and just create a book but we dont want it right we want only authenticated user should be able to create any book to the server or in his profile
// so to protect the route we will create a simple func to protect the route
router.post("/", protectRoute, async (req, res) => {
  try {
    const { title, caption, rating, image } = req.body;

    //checking if all the fields are provided or not
    if (!title || !image || !caption || !rating) {
      return res.status(400).json({ message: "Please provide all feilds" });
    }

    // Validate the image looks like a data URL (basic)
    if (typeof image !== "string" || !image.startsWith("data:")) {
      return res
        .status(400)
        .json({ message: "Invalid image format. Expecting data URL." });
    }
    // upload the image to cloudinary
    const uploadResponse = await cloudinary.uploader.upload(image);
    const imageUrl = uploadResponse.secure_url; // getting the saved image url

    // defining the new data for saving new book
    const newBook = new Book({
      title,
      caption,
      rating,
      image: imageUrl,
      user: req.user._id,
    });

    await newBook.save();
    res.status(201).json(newBook);
  } catch (error) {
    console.log("Server error", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// getting all book with pagination
router.get("/", protectRoute, async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 5;
    const skip = (page - 1) * limit;

    // getting all books with limit page and also the user details like username and profileimage
    const books = await Book.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "username profileImage");

    const totalBookCount = await Book.countDocuments();
    res.send({
      books,
      currentPage: page,
      totalBooks: totalBookCount,
      totalPages: Math.ceil(totalBookCount / limit),
    });
    // const books = await Book.find().sort({ createdAt: -1 }); //books in ascending order
  } catch (error) {
    console.error("Error getting book", error);
    return res.status(500).json({ message: "Error getting books" });
  }
});

// deleting book
router.delete("/:id", protectRoute, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(400).json({ message: "Book not found" });
    }

    //check if user is creator of the book
    if (book.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // we are delting the books but also we have to delete the image from the clodinary too
    if (book.image && book.image.includes("cloudinary")) {
      try {
        const publicId = book.image.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(publicId);
      } catch (error) {
        console.error("image deleting error", error);
      }
    }
    await book.deleteOne();
    res.json({ message: "Book deleted successfully" });
  } catch (error) {
    console.error("Error deleting book", error);
    return res.status(500).json({ message: "Error deleting books" });
  }
});

// get recommended books by the logged in user
router.get("/user", protectRoute, async (req, res) => {
  try {
    const books = await Book.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(books);
  } catch (error) {
    console.error("Error getting recommended books", error);
    res.status.apply(500).json({ message: "Internal server error" });
  }
});
export default router;
