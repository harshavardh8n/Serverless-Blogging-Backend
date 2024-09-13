import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { decode, sign, verify } from "hono/jwt";

export const blogRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
}>();

blogRouter.use("/*", async (c, next) => {
    console.log("Inside Middleware")
  const header = c.req.header("authorization") || "";
  try {
    const token = header.split(" ")[1];
  console.log(token);
  const response = await verify(token, c.env.JWT_SECRET);
//   console.log(response);
  if (response.id) {
    c.set("userId",response.id);
    console.log(response.id);
    await next();
  } else {
    c.status(403);
    return c.json({ error: "Unauthorized" });
  }

  } catch (error) {
     c.status(403);
     return c.json({error:"Youre not logged in"})

  }
  // console.log(header)
  
});


blogRouter.post("/", async (c) => {
    const authorId = c.get("userId")
    const body = await c.req.json();
    console.log("author id is ",authorId);
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  
  const Post = await prisma.post.create({
    data: {
      title: body.title,
      content: body.content,
      authorId: authorId,
    },
  });

  return c.json({ id: Post.id });
});


blogRouter.put("/", async(c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
      }).$extends(withAccelerate());
      const body = await c.req.json();
    
      const Post = await prisma.post.update({
        where:{
            id:body.id
        },
        data: {
          title: body.title,
          content: body.content,
        },
      });
      return c.json({ mssg:"Post updated successfully"});
    });


    
// pagination
// Corrected pagination route to fetch all posts
blogRouter.get("/bulk", async (c) => {
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
    
    try {
      const posts = await prisma.post.findMany({
        select: {
            id:true,
          title: true,
          content: true,
          published: true,  // Fetching published status if needed
          authorId:true
        }
      });
  
      return c.json({ posts }); // Return all posts
    } catch (e) {
      c.status(411);
      return c.json({ mssg: "Error fetching post details" });
    }
  });

blogRouter.get("/:id", async(c) => {
    const id = await c.req.param("id");
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
      }).$extends(withAccelerate());
    try {
        const Post = await prisma.post.findFirst({
            where:{
                id:id
            }
        })
        return c.json({
            Post
        });
        
    } catch (e) {
        c.status(411);
        c.json({"mssg":"Error fetching post details"})
    }
});

  

blogRouter.get("/yoyo",async(c)=>{
    return c.json({mssg:"works"});
});
