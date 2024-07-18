const Story = require("../models/Story");
const https = require("https");
const dotenv = require("dotenv");

dotenv.config();

const { MEDIUM_ACCESS_TOKEN, MEDIUM_AUTHOR_ID } = process.env;

// Get all stories
const getStories = async (req, res) => {
  try {
    const stories = await Story.find();
    res.json(stories);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Get a single story by ID
const getStoryById = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) {
      return res.status(404).json({ message: "Story not found" });
    }
    res.json(story);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Publish on Medium
const publishToMedium = async (storyData) => {
  const postData = JSON.stringify({
    title: storyData.title,
    contentFormat: "html",
    content: storyData.content,
    tags: storyData.tags,
    publishStatus: "draft",
  });

  const options = {
    hostname: "api.medium.com",
    port: 443,
    path: `/v1/users/${MEDIUM_AUTHOR_ID}/posts`,
    method: "POST",
    headers: {
      Authorization: `Bearer ${MEDIUM_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      "Accept-Charset": "utf-8",
    },
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        if (res.statusCode === 201) {
          resolve(JSON.parse(data));
        } else {
          reject(JSON.parse(data));
        }
      });
    });

    req.on("error", (e) => {
      reject(e);
    });

    req.write(postData);
    req.end();
  });
};

// Create a new story
const createStory = async (req, res) => {
  try {
    const newStory = new Story(req.body);
    const savedStory = await newStory.save();

    if (savedStory.sharedOnMedium) {
      await publishToMedium(savedStory);
    }

    res.status(201).json(savedStory);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Update a story by ID
const updateStory = async (req, res) => {
  try {
    const updatedStory = await Story.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedStory) {
      return res.status(404).json({ message: "Story not found" });
    }
    res.json(updatedStory);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Delete a story by ID
const deleteStory = async (req, res) => {
  try {
    const deletedStory = await Story.findByIdAndDelete(req.params.id);
    if (!deletedStory) {
      return res.status(404).json({ message: "Story not found" });
    }
    res.json({ message: "Story deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

module.exports = {
  getStories,
  getStoryById,
  createStory,
  updateStory,
  deleteStory,
};
