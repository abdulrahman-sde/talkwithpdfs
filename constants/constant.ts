export const loadingStates = [
  { text: "Uploading PDF to cloud" },
  { text: "Storing file securely" },
  { text: "Extracting text from PDF" },
  { text: "Splitting content into chunks" },
  { text: "Generating vector embeddings" },
  { text: "Saving vectors to database" },
  { text: "Preparing chat session" },
];

// Example mock conversationId
const conversationId = "11111111-1111-1111-1111-111111111111";

export const mockMessages = [
  {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    conversationId,
    sender: "user",
    content: "Hey, can you help me summarize this PDF?",
    createdAt: new Date("2025-09-10T10:00:00Z"),
  },
  {
    id: "b2c3d4e5-f6a7-8901-bcde-f23456789012",
    conversationId,
    sender: "ai",
    content: "Of course! Please upload your PDF and I’ll process it for you.",
    createdAt: new Date("2025-09-10T10:00:05Z"),
  },
  {
    id: "c3d4e5f6-a7b8-9012-cdef-345678901234",
    conversationId,
    sender: "user",
    content: "Uploaded! It’s about deep learning basics.",
    createdAt: new Date("2025-09-10T10:00:15Z"),
  },
  {
    id: "d4e5f6a7-b8c9-0123-def0-456789012345",
    conversationId,
    sender: "ai",
    content:
      "Got it. The document introduces neural networks, backpropagation, and CNNs. Do you want a detailed summary or just the key points?",
    createdAt: new Date("2025-09-10T10:00:30Z"),
  },
  {
    id: "e5f6a7b8-c9d0-1234-ef01-567890123456",
    conversationId,
    sender: "user",
    content: "Just the key points, please.",
    createdAt: new Date("2025-09-10T10:00:40Z"),
  },
  {
    id: "f6a7b8c-d0e1-2345-f012-678901234567",
    conversationId,
    sender: "ai",
    content:
      "✅ Key points: Neural networks mimic the human brain.. Backpropagation trains models efficiently.\n3. CNNs are powerful for image recognition.✅ Key points:\n1. Neural networks mimic the human brain.\n2. Backpropagation trains models efficiently.\n3. CNNs are powerful for image recognition.✅ Key points:\n1. Neural networks mimic the human brain.\n2. Backpropagation trains models efficiently.\n3. CNNs are powerful for image recognition.",
    createdAt: new Date("2025-09-10T10:00:55Z"),
  },
  {
    id: "a1b2c34-e5f6-7890-abcd-ef1234567890",
    conversationId,
    sender: "user",
    content: "Hey, can you help me summarize this PDF?",
    createdAt: new Date("2025-09-10T10:00:00Z"),
  },
  {
    id: "b2c3de5-f6a7-8901-bcde-f23456789012",
    conversationId,
    sender: "ai",
    content: "Of course! Please upload your PDF and I’ll process it for you.",
    createdAt: new Date("2025-09-10T10:00:05Z"),
  },
  {
    id: "c3d45f6-a7b8-9012-cdef-345678901234",
    conversationId,
    sender: "user",
    content: "Uploaded! It’s about deep learning basics.",
    createdAt: new Date("2025-09-10T10:00:15Z"),
  },
  {
    id: "d4ef6a7-b8c9-0123-def0-456789012345",
    conversationId,
    sender: "ai",
    content:
      "Got it. The document introduces neural networks, backpropagation, and CNNs. Do you want a detailed summary or just the key points?",
    createdAt: new Date("2025-09-10T10:00:30Z"),
  },
  {
    id: "e56a7b8-c9d0-1234-ef01-567890123456",
    conversationId,
    sender: "user",
    content: "Just the key points, please.",
    createdAt: new Date("2025-09-10T10:00:40Z"),
  },
  {
    id: "fa7b8c9-d0e1-2345-f012-678901234567",
    conversationId,
    sender: "ai",
    content:
      "✅ Key points:\n1. Neural networks mimic the human brain.\n2. Backpropagation trains models efficiently.\n3. CNNs are powerful for image recognition.",
    createdAt: new Date("2025-09-10T10:00:55Z"),
  },
];
