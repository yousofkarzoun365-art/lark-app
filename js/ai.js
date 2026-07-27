/* ===== AI.JS - DeepSeek API + Demo fallback ===== */

const DEMO_CONTENT = {
  story: {
    title: "Luna's First Day in London",
    preview: "Luna stepped off the train at Victoria Station, her heart pounding with excitement. She had dreamed of visiting London her whole life, and finally, the day had arrived...",
    full: `Luna's First Day in London

Luna stepped off the train at Victoria Station, her heart pounding with excitement. She had dreamed of visiting London her whole life, and finally, the day had arrived.

She looked around at the busy station. People were rushing everywhere — businessmen in suits, tourists with large backpacks, and children holding their parents' hands. Everyone seemed to know exactly where they were going.

"Excuse me," Luna said to a kind-looking woman. "Could you help me find the Underground?"

The woman smiled warmly. "Of course! Just follow the signs for the Tube. It's quite simple once you get the hang of it."

Luna thanked her and walked toward the signs. She bought a travel card and studied the colorful map. The London Underground — nicknamed 'the Tube' — was one of the oldest metro systems in the world, built in 1863.

As she rode the train to her hotel, Luna looked at the other passengers. Some were reading books, others were listening to music, and a few were simply staring out the window. She noticed that most people were very quiet — that was the British way.

When she finally reached her hotel and unpacked her bags, Luna smiled to herself. She had successfully navigated a new city in a foreign language. It wasn't so difficult after all.

That evening, she wrote in her journal: "Today I learned that confidence is the most important thing when speaking a new language. Even if you make mistakes, people will help you."

🔑 Key Vocabulary:
• pounding – beating fast with emotion
• rush – to move quickly
• get the hang of it – to learn how to do something
• navigate – to find your way around
• confidence – belief in yourself`
  },
  grammar: {
    rule: "The Present Perfect Tense",
    preview: "have/has + past participle — connecting past to present",
    full: `The Present Perfect Tense

What is it?
The Present Perfect connects the past to the present. We use it for experiences, recent actions, or situations that started in the past and continue now.

Structure:
Positive: Subject + have/has + past participle
Negative: Subject + haven't/hasn't + past participle
Question: Have/Has + subject + past participle?

When to use it:

1. Life experiences (ever/never)
"Have you ever visited London?"
"I have never eaten sushi before."

2. Recent actions (just/already/yet)
"She has just finished her homework."
"Have you eaten yet?"
"I have already seen that movie."

3. Unfinished time periods (today/this week)
"I have studied English for three hours today."
"We haven't seen him this week."

Common irregular past participles:
go → gone | see → seen | eat → eaten | write → written | take → taken

Examples:
✅ "Luna has traveled to London." (life experience)
✅ "I have just arrived at the airport." (recent action)
✅ "They haven't finished the project yet." (not completed)

💡 Remember: Use Simple Past for specific times.
❌ "I have seen him yesterday." (wrong)
✅ "I saw him yesterday." (correct)`
  },
  quiz: [
    { question: "Which sentence uses the Present Perfect correctly?", options: ["I have seen him yesterday.", "She has just finished her work.", "They have went to the store.", "He have eaten lunch."], answer: 1 },
    { question: "Choose the correct form: 'She ___ never ___ sushi.'", options: ["has / eat", "have / eaten", "has / eaten", "have / eat"], answer: 2 },
    { question: "What does 'heart pounding' mean?", options: ["Heart beating slowly", "Heart beating fast from emotion", "Heart stopping", "Feeling sick"], answer: 1 },
    { question: "Complete: 'Have you ___ finished the report?'", options: ["yet", "already", "just", "still"], answer: 1 },
    { question: "Which is the past participle of 'go'?", options: ["went", "goed", "gone", "going"], answer: 2 },
    { question: "Luna visited which city in the story?", options: ["Paris", "London", "New York", "Berlin"], answer: 1 },
    { question: "'I ___ already seen that movie.' Choose the correct verb.", options: ["have", "has", "had", "am"], answer: 0 },
    { question: "Which sentence is correct?", options: ["I have went to school today.", "She have finished her homework.", "They have eaten breakfast.", "He has went home."], answer: 2 },
    { question: "What does 'navigate' mean?", options: ["To swim", "To cook food", "To find your way around", "To speak loudly"], answer: 2 },
    { question: "Complete: 'Have you ever ___ to England?'", options: ["go", "went", "gone", "going"], answer: 2 }
  ]
};

async function generateDailyContent() {
  const apiKey = AppState.shared.apiKey;
  if (!apiKey) return DEMO_CONTENT;

  try {
    const instructions = AppState.shared.aiInstructions || '';
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

    const prompt = `You are an English learning content creator for the Lark app. Today is ${today}.
${instructions ? 'Special instructions: ' + instructions : ''}

Generate daily English learning content in this EXACT JSON format with no markdown:
{
  "story": {
    "title": "Story title",
    "preview": "First 2 sentences only",
    "full": "Complete story 300-400 words with vocabulary section at end"
  },
  "grammar": {
    "rule": "Grammar rule name",
    "preview": "One-line summary",
    "full": "Complete grammar lesson with examples"
  },
  "quiz": [
    {"question": "Question text", "options": ["A","B","C","D"], "answer": 0}
  ]
}
Create exactly 10 quiz questions. Return ONLY valid JSON, no markdown, no extra text.`;

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({ model: 'deepseek-v4-flash', max_tokens: 3000, messages: [{ role: 'user', content: prompt }] })
    });

    if (!response.ok) throw new Error('API error');
    const data = await response.json();
    const text = data.choices[0].message.content.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(text);
    if (parsed.story && parsed.grammar && parsed.quiz) return parsed;
    throw new Error('Invalid structure');
  } catch (err) {
    console.error('AI failed, using demo:', err);
    return DEMO_CONTENT;
  }
}

async function translateWord(word) {
  const apiKey = AppState.shared.apiKey;
  if (!apiKey) return { phonetic: '', translation: 'Add API key to enable translation' };

  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'deepseek-v4-flash', max_tokens: 100,
        messages: [{ role: 'user', content: `Translate the English word "${word}" to Arabic and give its phonetic transcription. Return ONLY this JSON (no markdown): {"phonetic": "/phonetic/", "translation": "Arabic translation"}` }]
      })
    });
    if (!response.ok) throw new Error('API error');
    const data = await response.json();
    const text = data.choices[0].message.content.replace(/```json|```/g, '').trim();
    return JSON.parse(text);
  } catch {
    return { phonetic: '', translation: 'Translation failed' };
  }
}

async function chatWithAI(messages) {
  const apiKey = AppState.shared.apiKey;
  if (!apiKey) throw new Error('No API key');
  const instructions = AppState.shared.aiInstructions || '';

  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: 'deepseek-v4-flash', max_tokens: 1000,
      messages: [
        { role: 'system', content: `You are Lark AI, an English learning assistant.${instructions ? '\n' + instructions : ''}` },
        ...messages
      ]
    })
  });
  if (!response.ok) throw new Error('API error');
  const data = await response.json();
  return data.choices[0].message.content;
}
