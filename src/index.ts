//@ts-ignore
import { Hono } from 'hono' 
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import {decode,sign,verify} from "hono/jwt"
import { blogRouter } from './routes/blog'




const app = new Hono<{
  Bindings:{
    DATABASE_URL:string;
    JWT_SECRET:string;
  }
}>()

// const JWT_SECRET = "mysecret"
app.route("/api/v1/blog", blogRouter);

app.get('/', (c) => {
  return c.text('Hello Honno!')
})

app.post('/api/v1/user/signup',async(c)=>{
  
const body = await c.req.json()
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
}).$extends(withAccelerate())

try {
  if (!body.email || !body.password) {
    c.status(400);
    return c.json({ error: 'Missing required fields' });
  }

  const user = await prisma.user.create({
    data: {
      email: body.email,
      password: body.password,
      name: body.name
    }
  });

  // Generate JWT token with expiration
  const token = await sign({ id: user.id },c.env.JWT_SECRET);

  return c.json({ jwt: token });

} catch (error) {
  console.error("Signup error:", error);
  c.status(500);
  return c.text("Signup error");
}
});
//@ts-ignore
app.post('/api/v1/user/signin',async(c)=>{
  console
  
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
}).$extends(withAccelerate())

const body = await c.req.json()

  const user = await prisma.user.findUnique({
    where:{
      email:body.email,
      password:body.password
    }

  })

  if(!user){
    c.status(403).json({error:"user not found"});
  }

  const jwt = await sign({id:user.id},c.env.JWT_SECRET)
  return c.json({jwt})
})



export default app
