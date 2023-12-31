const express = require("express");
const router = express.Router();

const Entry = require("../../models/Entry");

// ENTRY CRUD FUNCTIONS

const createEntry = async (req, res) => {
  if (!req.body.id) {
    return res.status(400).json({ message: "entry ID required" });
  }

  const already = await Entry.findOne({ id: req.body.id }).exec();
  if (already) {
    return res.status(409).json({
      message: `entry ID ${req.body.id} (${already.name}) already exists`,
    });
  }

  const newEntry = await Entry.create({
    id: req.body.id,
    description: req.body.description,
    name: req.body.name,
    stats: req.body.stats,
    image: req.body.image,
  });

  res
    .status(201)
    .json({ success: `Added ${req.body.name} to the Tattle Log!` });
  // res.status(201).json(newEntry);
};

const getAllEntries = async (req, res) => {
  const entries = await Entry.find().sort({ id: 1 });
  res.json(entries);
};

const updateEntry = async (req, res) => {
  // check if entry we want to update exists in database
  if (!req.body.id) {
    return res.status(400).json({ message: "entry ID required" });
  }
  const entry = await Entry.findOne({ id: req.body.id }).exec();
  if (!entry) {
    return res
      .status(204)
      .json({ message: `entry ID ${req.body.id} not found` });
  }

  // update entry's values accordingly
  if (req.body.description) entry.description = req.body.description;
  if (req.body.name) entry.name = req.body.name;
  if (req.body.stats) entry.stats = req.body.stats;
  if (req.body.image) entry.image = req.body.image;
  const result = await entry.save();

  res.json(result);
};

const deleteEntry = async (req, res) => {
  // same as update, except old entry is only deleted, and filtered array is set as state
  if (!req.body.id) {
    return res.status(400).json({ message: "entry ID required" });
  }
  const entry = await Entry.findOne({ id: req.body.id }).exec();
  if (!entry) {
    return res
      .status(204)
      .json({ message: `entry ID ${req.body.id} not found` });
  }
  const result = await Entry.deleteOne({ id: req.body.id });

  res.json(result);
};

const getEntry = async (req, res) => {
  const entry = await Entry.findOne({ id: req.params.id }).exec();
  if (!entry) {
    return res
      .status(400)
      .json({ message: `entry ID ${req.params.id} not found` });
  }

  res.json(entry);
};

// PASS CRUD FUNCTIONS TO ROUTER

router
  .route("/")
  .post(createEntry)
  .get(getAllEntries)
  .put(updateEntry)
  .delete(deleteEntry);

router.route("/:id").get(getEntry);

module.exports = router;
