import { db } from './db';
import { MockInterview, UserAnswer } from './schema';
import { eq } from 'drizzle-orm';

export async function deleteInterview(mockId) {
  try {
    // First, delete associated user answers
    await db.delete(UserAnswer)
      .where(eq(UserAnswer.mockIdRef, mockId));

    // Then delete the interview
    await db.delete(MockInterview)
      .where(eq(MockInterview.mockId, mockId));

    return { success: true };
  } catch (error) {
    console.error("Error deleting interview:", error);
    return { success: false, error };
  }
}