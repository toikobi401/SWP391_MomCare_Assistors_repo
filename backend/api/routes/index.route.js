const categoryRoutes = require("./category.route");
const userRoutes = require("./user.route");
const roleRoutes = require("./role.route");
const authRoutes = require("./auth.route");
const blogRoutes = require("./blog.route");
const upLoadRoutes = require("./upload.route");
const conversationRoutes = require("./conversation.route");
const messageRoutes = require("./message.route");
const modelRoutes = require("./model.route");
const chatUploadRoutes = require("./chatUpload.route");

module.exports = (app) => {
  const version = "/api";
  app.use(version + "/blog", blogRoutes);

  app.use(version + "/users", userRoutes);

  app.use(version + "/category", categoryRoutes);

  app.use(version + "/role", roleRoutes);

  app.use(version + "/auth", authRoutes);

  app.use(version + "/upload", upLoadRoutes);

  // Chat routes
  app.use(version + "/conversations", conversationRoutes);
  app.use(version + "/messages", messageRoutes);
  app.use(version + "/models", modelRoutes);
  app.use(version + "/chat-upload", chatUploadRoutes);
};
