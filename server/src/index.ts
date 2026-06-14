import cors from "cors";
import "dotenv/config";
import app from "./app.js";

const PORT = 3001;

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
