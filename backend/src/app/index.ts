import server from './server';

const port = process.env.PORT ?? 8080;

server.listen(port, () => {
	console.log(`[<SERVER>]: Server listening on port ${port}`);
});
