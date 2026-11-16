import { createApp } from './http/createApp.ts';

const DEFAULT_PORT = 8787;
const port = Number(process.env.PORT) || DEFAULT_PORT;

createApp().listen(port, () => {
  console.log(`Server escuchando en el puerto ${port}`);
});
