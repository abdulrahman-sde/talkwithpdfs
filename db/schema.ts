import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  jsonb,
  boolean,
  vector,
} from "drizzle-orm/pg-core";

// -------------------- USERS --------------------
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  clerkId: text().unique().notNull(),
  email: text("email").notNull().unique(),
  name: text("name"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// -------------------- PDFS --------------------
export const pdfs = pgTable("pdfs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  title: text("title").notNull(),
  fileUrl: text("file_url").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// -------------------- PDF CHUNKS (with embeddings) --------------------
export const pdfChunks = pgTable("pdf_chunks", {
  id: uuid("id").primaryKey().defaultRandom(),
  pdfId: uuid("pdf_id")
    .references(() => pdfs.id, { onDelete: "cascade" })
    .notNull(),
  chunkIndex: integer("chunk_index").notNull(),
  content: text("content").notNull(),
  embedding: vector("embedding", { dimensions: 1536 }), // adjust to your embedding model
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// -------------------- CONVERSATIONS --------------------
export const conversations = pgTable("conversations", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  pdfId: uuid("pdf_id")
    .references(() => pdfs.id, { onDelete: "cascade" })
    .notNull(),
  title: text("title"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// -------------------- MESSAGES --------------------
export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  conversationId: uuid("conversation_id")
    .references(() => conversations.id, { onDelete: "cascade" })
    .notNull(),
  sender: text("sender").$type<"user" | "ai">().notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// -------------------- QUIZZES --------------------
export const quizzes = pgTable("quizzes", {
  id: uuid("id").primaryKey().defaultRandom(),
  pdfId: uuid("pdf_id")
    .references(() => pdfs.id, { onDelete: "cascade" })
    .notNull(),
  conversationId: uuid("conversation_id").references(() => conversations.id, {
    onDelete: "cascade",
  }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// -------------------- QUIZ QUESTIONS --------------------
export const quizQuestions = pgTable("quiz_questions", {
  id: uuid("id").primaryKey().defaultRandom(),
  quizId: uuid("quiz_id")
    .references(() => quizzes.id, { onDelete: "cascade" })
    .notNull(),
  questionText: text("question_text").notNull(),
  options: jsonb("options"), // multiple choice options
  correctAnswer: text("correct_answer"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// -------------------- QUIZ ANSWERS --------------------
export const quizAnswers = pgTable("quiz_answers", {
  id: uuid("id").primaryKey().defaultRandom(),
  quizQuestionId: uuid("quiz_question_id")
    .references(() => quizQuestions.id, { onDelete: "cascade" })
    .notNull(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  answer: text("answer"),
  isCorrect: boolean("is_correct"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
