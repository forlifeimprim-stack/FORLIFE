process.env.NODE_ENV = "test";
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL ?? "postgresql://forlife:forlife@localhost:5432/forlife_com_test";
process.env.JWT_SECRET = "test-secret-test-secret-test-secret-123";
process.env.ENCRYPTION_KEY = Buffer.alloc(32, 7).toString("base64");
process.env.AI_PROVIDERS = "mock";
process.env.RUN_WORKER_INLINE = "false";
process.env.STORAGE_LOCAL_DIR = "./storage-test";
