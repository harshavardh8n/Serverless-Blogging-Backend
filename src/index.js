import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';
const app = new Hono();
app.get('/', (c) => {
    return c.text('Hello Honno!');
});
app.post('/api/v1/user/signup', async (c) => {
    const body = await c.req.json();
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
    try {
        await prisma.user.create({
            data: {
                email: body.email,
                password: body.password,
                name: body.name
            }
        });
        return c.text('signup successful!');
    }
    catch (error) {
        console.log(error);
        c.status(500);
        return c.text("signup error");
    }
});
app.post('/api/v1/signin', (c) => {
    return c.text('Hello signin!');
});
app.post('/api/v1/blog', (c) => {
    return c.text('Hello post blog!');
});
app.put('/api/v1/blog', (c) => {
    return c.text('Hello update blog!');
});
app.get('/api/v1/blog:id', (c) => {
    return c.text('Hello param hono');
});
export default app;
