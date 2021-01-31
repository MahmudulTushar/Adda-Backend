const Pusher = require("pusher");
const pusher = new Pusher({
  appId: process.env.pusherAppId,
  key: process.env.pusherAppkey,
  secret: process.env.pusherAppSecret,
  cluster: process.env.pusherAppCluster,
  useTLS: process.env.pusherAppUseTLS
});

module.exports = pusher;