const request = require("supertest");
let agent;
let token;
module.exports = () =>
  new Proxy(agent, {
    get(target, method) {
      if (["post", "put", "patch", "delete"].includes(method))
        return (url) => target[method](url).set("X-CSRF-Token", token);
      return typeof target[method] === "function"
        ? target[method].bind(target)
        : target[method];
    },
  });
module.exports.prepare = async (app) => {
  agent = request.agent(app);
  token = (await agent.get("/api/auth/csrf").expect(200)).body.token;
};
