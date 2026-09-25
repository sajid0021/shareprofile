import Project from "./project.model.js";

function serializeProject(project) {
  if (!project) return null;
  const plain = typeof project.toObject === "function" ? project.toObject() : project;
  const { _id, __v, ...rest } = plain;
  return { ...rest, id: String(_id) };
}

export async function createProjectForUser(userId, payload) {
  const project = await Project.create({ user: userId, ...payload });
  return serializeProject(project);
}

export async function getProjectsForUser(userId) {
  const projects = await Project.find({ user: userId }).sort({ startDate: -1, createdAt: -1 }).exec();
  return projects.map((project) => serializeProject(project));
}

export async function getProjectForUser(userId, projectId) {
  const project = await Project.findOne({ _id: projectId, user: userId }).exec();
  return serializeProject(project);
}

export async function updateProjectForUser(userId, projectId, payload) {
  const project = await Project.findOneAndUpdate({ _id: projectId, user: userId }, payload, {
    new: true,
    runValidators: true,
  }).exec();

  return serializeProject(project);
}

export async function deleteProjectForUser(userId, projectId) {
  const project = await Project.findOneAndDelete({ _id: projectId, user: userId }).exec();
  return serializeProject(project);
}
