# docker server
`docker run --name drizzle-postgres -e POSTGRES_PASSWORD=mypassword -d -p 5432:5432 postgres`

# migrations 
`bunx drizzle-kit push`



Alternatively, you can generate migrations using the drizzle-kit generate command and then apply them using the drizzle-kit migrate command:

Generate migrations:

`npx drizzle-kit generate`

Apply migrations:

`npx drizzle-kit migrate`

