TO START: NPM RUN DEV

PRODUCTION: 

1) [index.ts] change: const io = require("socket.io")(8080, {...}) -> const io = require("socket.io")(server, {...})
2) [index.ts] uncomment secure and sameSite in cookie: 
                {
                    maxAge: 2 * 60 * 60 * 1000,
                    secure: true,
                    httpOnly: true,
                    sameSite: 'none'
                },