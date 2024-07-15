const History = require("../models/Story");

const publishStory = async (req, res) => {
  const { title, summary, content, tags, sharedOnLinkedIn, sharedOnMedium } =
    req.body;
  try {
    const newStory = new Story({
      title,
      summary,
      content,
      tags,
      sharedOnLinkedIn,
      sharedOnMedium,
    });

    await newStory.save();
    res.status(201).json({ message: "Story published successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Error publishing article", error });
  }
};

module.exports = { publishStory };
