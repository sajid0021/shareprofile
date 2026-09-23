import dns from "node:dns";
import mongoose from "mongoose";

export const isMongoConfigured = () => Boolean(process.env.MONGODB_URI);
export const isMongoReady = () =>
  isMongoConfigured() && mongoose.connection.readyState === 1;

const connectDatabase = async () => {
  try {
    const dnsServers = (process.env.MONGODB_DNS_SERVERS || "1.1.1.1,8.8.8.8")
      .split(",")
      .map((server) => server.trim())
      .filter(Boolean);

    if (dnsServers.length > 0) {
      dns.setServers(dnsServers);
    }

    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB connected successfully");
    return true;
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    return false;
  }
};

export default connectDatabase;