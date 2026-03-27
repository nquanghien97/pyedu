import { withAsyncErrorHandling } from "../../withAsyncErrorHandling"

const OLLAMA_URL = 'http://localhost:11434';

export const chatbotHandler = withAsyncErrorHandling(async (req, res) => {
  try {
    const { prompt } = req.body;

    const response = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'qwen3:4b',
        prompt,
        stream: false,
        options: {
          reasoning: false
        }
      })
    });

    const data = await response.json() as { response: string };

    res.json({
      success: true,
      data: data.response
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: err
    });
  }
});
