import app from '../api/index';

const PORT = process.env.PORT || 3001;

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`⚡ Nexus VCF Backend API Server running on port ${PORT}`);
  });
}

export default app;
