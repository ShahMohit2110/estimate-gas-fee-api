import express from 'express';
import dotenv from 'dotenv';
import gasRoutes from './routes/gas';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());
app.use('/api/gas', gasRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});
