import express, { Request, Response, response } from "express";
import bodyParser from "body-parser";
import fs from "fs";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import { checkAuth } from "./auth";

const PORT = 5000;
const app = express();

app.use(cors());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

interface User {
  email: string;
  password: string;
  cartItem: Menu[];
}

let users: User[] = [];
try {
  users = JSON.parse(fs.readFileSync("data.json", "utf-8"));
} catch (error) {
  users = [];
}

app.post("/home", (req: Request, res: Response) => {
  const { menuName, price, userName } = req.body;

  const findUser = users.find((d: any) => d.email === userName);

  const menuSearch = findUser?.cartItem.find((d) => d.name === menuName);

  if (menuSearch) {
    return console.log("This menu is taken!!");
  }

  if (findUser) {
    const cartMenu: Menu = {
      name: menuName,
      price: price,
    };

    findUser.cartItem.push(cartMenu);
    fs.writeFileSync("data.json", JSON.stringify(users, null, 2));
    res.status(200).send({
      message: "Success",
      data: findUser,
    });
  }
});

// register post
app.post("/register", (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.send({
      condition: "Failed",
      message: "Email or password is required!",
      color: "red",
    });
  }

  let findUser = users.find((user) => user.email === email);

  if (findUser) {
    return res.status(400).send({
      condition: "Found",
      message: "This email is already taken!",
      color: "red",
    });
  }

  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);

  const user: User = {
    email: email,
    password: hash,
    cartItem: [],
  };

  users.push(user);
  fs.writeFileSync("data.json", JSON.stringify(users, null, 2));

  const token = jwt.sign({ email }, "exHRqeQclr", { expiresIn: "3min" });

  res.status(200).json({
    message: "Register Successful..",
    color: "#3fb73f",
    token,
  });
});

// login post
app.post("/login", (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.send({
      message: "Email or password is required!",
      color: "red",
    });
  }

  let findUser = users.find((user) => user.email === email);

  if (!findUser) {
    return res.status(400).send({
      message: "User not found",
      color: "red",
    });
  }

  let comparePassword = bcrypt.compareSync(password, findUser.password);

  if (!comparePassword) {
    return res.status(400).send({
      message: "Incorrect password.Try again",
      color: "red",
    });
  }

  const token = jwt.sign({ email }, "exHRqeQclr", { expiresIn: "10min" });
  const menuUpdateToken = jwt.sign({ email }, "YvHA2IgRf", {
    expiresIn: "1hr",
  });

  if (findUser.email === "npm@gmail.com") {
    return res.send({
      message: "Login Successful..",
      color: "#3fb73f",
      updateToken: menuUpdateToken,
      token,
    });
  }

  res.status(200).send({
    message: "Login Successful..",
    color: "#3fb73f",
    token,
  });
});

// menu adding route
interface Menu {
  name: string;
  price: number;
}
let menus: Menu[] = [];

try {
  menus = JSON.parse(fs.readFileSync("./menu/menuData.json", "utf-8"));
} catch (error) {
  menus = [];
}

app.post("/menuAdd", (req: Request, res: Response) => {
  const { menuName, price } = req.body;

  if (!menuName || !price) {
    return res.send({
      message: "Please add menu",
      color: "red",
    });
  }

  let menu = {
    name: menuName,
    price: price,
  };

  menus.push(menu);
  fs.writeFileSync("./menu/menuData.json", JSON.stringify(menus, null, 2));
  res.send({
    message: "Succeed",
    color: "green",
    menus,
  });
});

app.get("/home", (req: Request, res: Response) => {
  res.send({
    menusData: menus,
    userData: users,
  });
});

/*
app.delete("/menuAdd", (req: Request, res: Response) => {
  const { menuName, price } = req.body;
  let takeMenu = menus.filter((d) => d.name !== menuName);
  let findMenu = menus.find((d) => d.name === menuName);

  if (!findMenu) {
    return res.send("Menu not found!!");
  }

  menus = takeMenu;
  fs.writeFileSync("./menu/menuData.json", JSON.stringify(menus, null, 2));
  res.send("Deleted successfully!");
});
*/

app.delete("/cartMenuDelete", (req: Request, res: Response) => {
  let { menu, user } = req.body;

  const findUser: any = users.find((d) => d.email === user);

  const filterMenu = findUser?.cartItem.filter((d: any) => d.name !== menu);

  if (filterMenu) {
    findUser.cartItem = filterMenu;
    fs.writeFileSync("data.json", JSON.stringify(users, null, 2));
    res.status(200).send({
      message: "Success",
      filterMenu,
    });
    console.log("Delete Success!");
  }
});

app.delete("/", (req: Request, res: Response) => {
  const { email, password } = req.body;
  let takeUser = users.filter((d) => d.email !== email);
  let findUser = users.find((d) => d.email === email);

  if (!findUser) {
    return res.send("User not found!!");
  }

  users = takeUser;
  fs.writeFileSync("data.json", JSON.stringify(users, null, 2));
  res.send("Deleted successfully!");
});

app.listen(PORT, () => {
  console.log(`This server is running on port : ${PORT}`);
});
