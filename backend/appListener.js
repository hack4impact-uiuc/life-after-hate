const app = require("./app");
const mongoose = require("mongoose");
app.locals.ready
  .then(() => {
    const server = app.listen(Number(process.env.PORT || 5000), () =>
      console.info("API ready"),
    );
    for (const signal of ["SIGTERM", "SIGINT"]) {
      process.on(signal, () => {
        server.close(async () => {
          await mongoose.disconnect();
          process.exit(0);
        });
        setTimeout(() => process.exit(1), 10000).unref();
      });
    }
  })
  .catch(() => {
    console.error("Database connection failed");
    process.exit(1);
  });
