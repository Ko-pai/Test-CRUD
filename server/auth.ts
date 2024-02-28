import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export const checkAuth = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.token;

  if (!token) {
    return res.send("Invalid creditential");
  }

  jwt.verify(token, "exHRqeQclr", (err: any) => {
    if (err) {
      return res.status(401).send({
        message: "Unauthorized",
        color: "red",
      });
    }
  });

  next();
};
