var express = require("express");
var router = express.Router();
const Note = require("../models/note.js");
const withAuth = require("../middlewares/auth");

router.post("/", withAuth, async function (req, res) {
  const { title, body } = req.body;

  try {
    let note = new Note({ title: title, body: body, author: req.user._id });
    await note.save();
    res.json(note);
  } catch (error) {
    res.status(401).send(err);
  }
});

router.get("/search", withAuth, async function (req, res) {
  const { query } = req.query;
  try {
    let notes = await Note.find({ author: req.user._id }).find({
      $text: { $search: query },
    });
    res.json(notes);
  } catch (error) {
    res.json({ error: error }).status(500);
  }
});

router.get("/:id", withAuth, async function (req, res) {
  try {
    const { id } = req.params;
    let note = await Note.findById(id);
    if (isOwner(req.user, note)) res.json(note);
    else res.json({ error: error }).status(500);
  } catch (error) {
    res.send(error).status(500);
  }
});

router.get("/", withAuth, async function (req, res) {
  try {
    let notes = await Note.find({ author: req.user._id });
    res.send(notes);
  } catch (error) {
    res.json({ error: error }).status(500);
  }
});

router.put("/:id", withAuth, async function (req, res) {
  const { title, body } = req.body;
  const { id } = req.params;
  try {
    let note = await Note.findOneAndUpdate(
      { _id: id },
      { $set: { title: title, body: body } },
      { upsert: true, new: true }
    );
    res.json(note);
  } catch (err) {
    res.status(500).send(err);
  }
});

router.delete("/:id", withAuth, async function (req, res) {
  const { id } = req.params;
  try {
    let note = await Note.findById(id);
    if (note && isOwner(req.user, note)) {
      await note.deleteOne();
      res.json({ message: "Note deleted" }).status(204);
    } else {
      res.json({ error: "Forbidden" }).status(403);
    }
  } catch (err) {
    res.status(500).send(err);
  }
});

const isOwner = (user, note) => {
  if (JSON.stringify(user._id) == JSON.stringify(note.author._id)) return true;
  else return false;
};

module.exports = router;
