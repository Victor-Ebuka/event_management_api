import { Router } from "express";

const usersRouter = Router();

usersRouter.get("/", async (req, res) => {
  console.log(req.headers, "events");
});

usersRouter.get("/:id", async (req, res) => {
  const e_id = req.params.id;
  console.log(req.headers, e_id);
});

export default usersRouter;
