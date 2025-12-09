// Test script to verify Gemini API connection using @google/generative-ai SDK
// Run: node test-gemini-api.js

require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const testGeminiConnection = async () => {
  console.log("\n========== GEMINI API CONNECTION TEST (SDK) ==========");

  // Step 1: Check API Key
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  console.log("1. Checking API Key...");
  if (!GEMINI_API_KEY) {
    console.error("   ❌ ERROR: GEMINI_API_KEY not found in .env file");
    console.log("   → Add GEMINI_API_KEY=your_key_here to .env file");
    return;
  }

  if (GEMINI_API_KEY.length < 10) {
    console.error("   ❌ ERROR: GEMINI_API_KEY seems invalid (too short)");
    console.log("   → Current length:", GEMINI_API_KEY.length);
    return;
  }

  console.log("   ✅ API Key found:", GEMINI_API_KEY.substring(0, 10) + "...");
  console.log("   → Length:", GEMINI_API_KEY.length, "characters\n");

  // Step 2: Test API Connection (SDK)
  console.log("2. Testing API Connection with gemini-1.5-flash ...");

  const prompt = `Generate 2 simple multiple-choice quiz questions about JavaScript.\n\nFor each question, provide:\n1. A clear question text\n2. Four answer options\n3. The correct answer (A, B, C, or D)\n4. A brief explanation\n\nFormat as JSON array:\n[\n  {\n    \"questionText\": \"What is JavaScript?\",\n    \"options\": [\"Option A\", \"Option B\", \"Option C\", \"Option D\"],\n    \"correctAnswer\": \"A\",\n    \"explanation\": \"Brief explanation\"\n  }\n]`;

  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(prompt);
    const response = result.response;

    console.log("   Connection successful!\n");

    // Step 3: Parse Response
    console.log("3. Parsing Response...");
    let generatedText = response.text();

    if (!generatedText) {
      console.error("   ❌ ERROR: No content in response");
      console.log("   → Response:", JSON.stringify(response, null, 2));
      return;
    }

    console.log(
      "   → Generated text length:",
      generatedText.length,
      "characters"
    );

    // Clean response
    generatedText = generatedText
      .replace(/```json\n?/gi, "")
      .replace(/```javascript\n?/gi, "")
      .replace(/```\n?/g, "")
      .trim();

    const jsonMatch = generatedText.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      generatedText = jsonMatch[0];
    }

    // Step 4: Validate JSON
    console.log("4. Validating JSON...");
    let questions;
    try {
      questions = JSON.parse(generatedText);
      console.log("   ✅ JSON parsed successfully");
      console.log("   → Questions count:", questions.length, "\n");
    } catch (parseError) {
      console.error("   ❌ ERROR: Failed to parse JSON");
      console.error("   → Error:", parseError.message);
      console.log("\n   Generated text preview:");
      console.log("   ", generatedText.substring(0, 200) + "...\n");
      return;
    }

    // Step 5: Display Results
    console.log("5. Generated Questions:\n");
    questions.forEach((q, i) => {
      console.log("   Question " + (i + 1) + ":");
      console.log("   | Text: " + q.questionText);
      console.log(
        "   | Options: " + ((q.options && q.options.length) || 0) + " options"
      );
      console.log("   | Correct: " + q.correctAnswer);
      console.log(
        "   | Explanation: " +
          (q.explanation ? q.explanation.substring(0, 50) : "") +
          "...\n"
      );
    });

    // Step 6: Validation Summary
    console.log("6. Validation Summary:");
    let validCount = 0;

    questions.forEach(function (q, i) {
      var isValid =
        q.questionText &&
        Array.isArray(q.options) &&
        q.options.length === 4 &&
        q.correctAnswer &&
        ["A", "B", "C", "D"].includes(q.correctAnswer.toUpperCase());
      if (isValid) {
        validCount++;
      } else {
        console.log("   [!] Question " + (i + 1) + " has validation issues");
      }
    });
    console.log("   Valid questions: " + validCount + "/" + questions.length);

    if (validCount === questions.length) {
      console.log("\n========== ALL TESTS PASSED ==========");
      console.log("Your Gemini API is working correctly!");
      console.log("You can now use the AI Quiz Generator feature.\n");
    } else {
      console.log("\n========== TESTS COMPLETED WITH WARNINGS ==========");
      console.log(
        "API connection works but some questions have validation issues."
      );
      console.log("This might be due to AI response format variations.\n");
    }
  } catch (error) {
    console.error("   ❌ ERROR:", error.message);
    console.log("\n========== ❌ TESTS FAILED ==========\n");
  }
};
