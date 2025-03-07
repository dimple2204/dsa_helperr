function createChatBot() {
  const chatBotContainer = document.createElement('div');
  chatBotContainer.className = 'helper-chatbot';
  chatBotContainer.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px; /* Changed to bottom right */
    z-index: 10000;
    font-family: Arial, sans-serif;
  `;

  const toggleButton = document.createElement('button');
  toggleButton.className = 'chatbot-toggle-btn';
  toggleButton.textContent = ' AI Help?';
  toggleButton.style.cssText = `
    background-color: #4CAF50; /* Green color */
    color: white;
    border: none;
    border-radius: 50px;
    padding: 10px 20px;
    cursor: pointer;
    font-size: 14px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    transition: all 0.3s ease;
  `;
  
  const chatPanel = document.createElement('div');
  chatPanel.className = 'chatbot-panel';
  chatPanel.style.cssText = `
    display: none;
    position: fixed;
    bottom: 80px;
    right: 20px; /* Changed to bottom right */
    width: 350px;
    height: 450px;
    background-color: white; /* White background */
    border-radius: 10px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.2); /* Lighter shadow */
    flex-direction: column;
    overflow: hidden;
    color: #333; /* Dark text color */
    resize: both; /* Allow resizing */
    overflow: auto; /* Ensure resize works */
  `;

  const chatHeader = document.createElement('div');
  chatHeader.className = 'chatbot-header';
  chatHeader.style.cssText = `
    background-color: #4CAF50; /* Green color */
    color: white;
    padding: 10px 15px;
    font-weight: bold;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: move; /* Indicate draggable area */
  `;
  chatHeader.textContent = 'DSA Helper';
  
  const closeButton = document.createElement('button');
  closeButton.textContent = '✕';
  closeButton.style.cssText = `
    background: none;
    border: none;
    color: white;
    font-size: 16px;
    cursor: pointer;
  `;
  
  const deleteButton = document.createElement('button');
  deleteButton.textContent = '🗑️';
  deleteButton.style.cssText = `
    background: none;
    border: none;
    color: white;
    font-size: 16px;
    cursor: pointer;
    margin-left: 10px;
  `;
  
  const chatMessages = document.createElement('div');
  chatMessages.className = 'chatbot-messages';
  chatMessages.style.cssText = `
    flex: 1;
    padding: 15px;
    overflow-y: auto;
    background-color: #f9f9f9; /* Light gray background */
    color: #333; /* Dark text color */
  `;

  const inputContainer = document.createElement('div');
  inputContainer.className = 'chatbot-input-container';
  inputContainer.style.cssText = `
    display: flex;
    padding: 10px;
    border-top: 1px solid #ddd; /* Light gray border */
    background-color: white; /* White background */
  `;

  const chatInput = document.createElement('input');
  chatInput.className = 'chatbot-input';
  chatInput.placeholder = 'Ask about this problem...';
  chatInput.style.cssText = `
    flex: 1;
    padding: 10px;
    border: 1px solid #ddd; /* Light gray border */
    border-radius: 20px;
    margin-right: 8px;
    font-size: 14px;
    background-color: white; /* White background */
    color: #333; /* Dark text color */
  `;

  chatHeader.appendChild(closeButton);
  chatHeader.appendChild(deleteButton); // Add delete button
  inputContainer.appendChild(chatInput);
  
  chatPanel.appendChild(chatHeader);
  chatPanel.appendChild(chatMessages);
  chatPanel.appendChild(inputContainer);
  
  chatBotContainer.appendChild(toggleButton);
  chatBotContainer.appendChild(chatPanel);
  
  document.body.appendChild(chatBotContainer);

  addMessage('bot', 'How can I help you?', chatMessages);

  // Toggle chat panel visibility
  toggleButton.addEventListener('click', () => {
    if (chatPanel.style.display === 'none') {
      chatPanel.style.display = 'flex';
    } else {
      chatPanel.style.display = 'none';
    }
  });

  // Close chat panel
  closeButton.addEventListener('click', () => {
    chatPanel.style.display = 'none';
  });

  // Delete all chat messages
  deleteButton.addEventListener('click', () => {
    chatMessages.innerHTML = ''; // Clear all messages
  });

  // Send message on Enter key
  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  });

  function sendMessage() {
    const userMessage = chatInput.value.trim();
    if (userMessage === '') return;
    
    addMessage('user', userMessage, chatMessages);
    
    chatInput.value = '';
    
    // Check if the user says "Hi"
    if (userMessage.toLowerCase() === 'hi') {
      addMessage('bot', 'Hello!', chatMessages);
    } else {
      const problemInfo = getProblemInfo(); // Get problem info
      sendToGemini(userMessage, problemInfo, chatMessages); // Call sendToGemini
    }
  }

  return chatBotContainer;
}

function addMessage(sender, text, chatMessagesElement) {
  const messageElement = document.createElement('div');
  messageElement.className = `message message-${sender}`;
  messageElement.style.cssText = `
    margin-bottom: 10px;
    padding: 10px 15px;
    border-radius: 10px;
    max-width: 80%;
    ${sender === 'user' ? 
      'background-color: #2563eb; color: white; align-self: flex-end; margin-left: auto;' : 
      'background-color: #3a3a3a; color: #e0e0e0;'}
    line-height: 1.4;
    font-size: 14px;
    white-space: pre-wrap;
  `;
  
  messageElement.textContent = text;
  chatMessagesElement.appendChild(messageElement);
  
  chatMessagesElement.scrollTop = chatMessagesElement.scrollHeight;
}

function getProblemInfo() {
  let title = '';
  let description = '';
  let code = '';
  
  const titleContainer = document.querySelector('.coding_desc_container_RD00M');
  if (titleContainer) {
    const headingElement = titleContainer.querySelector('h1, h2, h3, h4, h5') || titleContainer.firstElementChild;
    if (headingElement) {
      title = headingElement.textContent.trim();
    }
  }
  
  if (!title) {
    title = document.title.replace(' -maang.in', '').trim();
  }
  
  const descriptionContainer = document.querySelector('.coding_desc_container_RD00M');
  if (descriptionContainer) {
    const descClone = descriptionContainer.cloneNode(true);
    
    const codeBlocks = descClone.querySelectorAll('pre, code');
    codeBlocks.forEach(block => block.remove());
    
    description = descClone.textContent.trim();
  }
  
  if (window.monaco && window.monaco.editor) {
    const editors = window.monaco.editor.getEditors();
    if (editors && editors.length > 0) {
      code = editors[0].getValue();
    }
  }
  
  if (!code) {
    const codeMirrorElement = document.querySelector('.CodeMirror');
    if (codeMirrorElement && codeMirrorElement.CodeMirror) {
      code = codeMirrorElement.CodeMirror.getValue();
    } else {
      if (window.ace && window.ace.edit) {
        const aceEditors = document.querySelectorAll('.ace_editor');
        if (aceEditors.length > 0) {
          const editorId = aceEditors[0].id;
          if (editorId) {
            const editor = window.ace.edit(editorId);
            if (editor) {
              code = editor.getValue();
            }
          }
        }
      } else {
        const codeElement = document.querySelector('textarea.code-editor, pre.code-editor');
        if (codeElement) {
          code = codeElement.value || codeElement.textContent;
        }
      }
    }
  }
  
  let language = 'unknown';
  const languageSelectors = document.querySelectorAll('.coding_nav_bg_HMkIn nav button, .language-selector button');
  languageSelectors.forEach(btn => {
    if (btn.classList.contains('active') || btn.getAttribute('aria-selected') === 'true') {
      language = btn.textContent.trim().toLowerCase();
    }
  });
  
  let difficulty = '';
  const difficultyElement = document.querySelector('.difficulty-label, .difficulty');
  if (difficultyElement) {
    difficulty = difficultyElement.textContent.trim();
  }

  console.log("Extracted problem info:", { title, description: description.substring(0, 100) + "...", codePreview: code.substring(0, 100) + "...", language, difficulty });
  
  return {
    title,
    description,
    code,
    language,
    difficulty,
    url: window.location.href
  };
}

async function sendToGemini(userQuestion, problemInfo, chatMessagesElement) {
  try {
    const apiKeyObj = await chrome.storage.local.get("geminiApiKey");
    const API_KEY = apiKeyObj.geminiApiKey;
    
    if (!API_KEY) {
      addMessage('bot', 'API key not found. Please set your Gemini API key in the extension settings.', chatMessagesElement);
      return;
    }
    function findCourseKey() {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("course")) {
          return key;
        }
      }
      return null; 
    }
    const key = findCourseKey();
    function extractFirstNumber(str) {
      const match = str.match(/_(\d+)_/);
      return match ? match[1] : null;
    }

    const UserId = extractFirstNumber(key);

    function extractQuestionNumber(url) {
      const match = url.match(/-(\d+)$/);
      return match ? match[1] : null;
    }
    
    const URLofPage = window.location.href;
    const questionNumber = extractQuestionNumber(URLofPage);

    //getting the hints

    function clickHints() {
      // Find element containing "Hints" text
      const elements = Array.from(document.querySelectorAll("li"));
      const hintsElement = elements.find(el => el.textContent.includes("Hints"));
      
      if (hintsElement) {
        hintsElement.click();
        console.log("Clicked the Hints button");
      } else {
        console.log("Hints button not found");
      }
    }
    function clickDescription() {
      const descriptionElement = Array.from(document.querySelectorAll("li"))
        .find(el => el.textContent.includes("Description"));
      
      if (descriptionElement) {
        descriptionElement.click();
        console.log("Clicked the Description button");
      } else {
        console.log("Description button not found");
      }
    }
    
    
    
    // Execute the function
    clickHints();

    async function getHints() {
      const hints = {};
  
      async function clickAndExtractHint(hintText) {
          const hintButton = [...document.querySelectorAll('.coding_border__67F3C')]
              .find(el => el.innerText.includes(hintText));
  
          if (hintButton) {
              hintButton.click(); // Click to expand
              await new Promise(resolve => setTimeout(resolve, 1500)); // Wait for content to load
              
              // Extract hint content
              let contentElement = hintButton.parentElement?.nextElementSibling?.querySelector('.problem_paragraph');
              if (contentElement) {
                  hints[hintText] = contentElement.textContent.trim();
              }
          }
      }
  
      await clickAndExtractHint("Hint 1");
      await clickAndExtractHint("Hint 2");
  
      console.log(hints);
  }
  
  getHints();
  clickDescription()
  
  
  

    
    
    let Language = "unknown";
    const languageElement = document.querySelector(".ant-select-selection-item");
    if (languageElement) {
      Language = languageElement.innerText.trim();
    }

    
    
    const QuestionCodeKey = "course_" + UserId + "_" + questionNumber + '_' + Language;
    const code = localStorage.getItem(QuestionCodeKey);
    
    const contextKey = "Context_" + problemInfo.title;
    const contextObj = await chrome.storage.local.get(contextKey);
    const context = contextObj[contextKey] || { question: "", answer: "" };

    
    addMessage('bot', 'Got it, Let me think about this...', chatMessagesElement);
    
    const prompt = `
      Previous chat of your's with user:- ${JSON.stringify(context) || ""}
      PROBLEM INFORMATION:
      Title: ${problemInfo.title || "Unknown problem title"}
      URL: ${problemInfo.url}
      Difficulty: ${problemInfo.difficulty || "Unknown"}
      Language: ${problemInfo.language || "Unknown"}
      
      Description: 
      ${problemInfo.description || "No description available"}
      
      Current Code:
      \`\`\`${problemInfo.language || ""}
      ${problemInfo.code || "No code available"}
      \`\`\`
      
      USER QUESTION: ${userQuestion}
      This is the current code written by the User:- ${code || "No code available"}

      

      Never give the code unless the user explicitly asks for it and if asked only give code in c++.
      Avoid using unnecessary formatting like bold or headers.
      Only answer related to DSA and Coding question.
      Start by understanding the user's question and provide only hints at first.
      Encourage the user to think through the problem, ask guiding questions, and help them break it down logically.
      Once the user has attempted an approach or needs more help, guide them step by step toward an optimal solution.
      Only provide the code when the user specifically requests it.
      Your personality is that of a friendly and patient DSA mentor. Respond in a simple, conversational manner, like a human teacher guiding a student. Keep explanations clear and concise without sounding robotic.

      Keep the conversation natural and in type of wording or language of user but in english alphabets (like "are bhai ye question aise hoga" if user asks in hindi) and engaging to create the feeling of a real mentor-student interaction. Answer in user like language.
    `;
    
    const requestBody = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 4096,
        topP: 0.8,
        topK: 40
      }
    };
    
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyDDtzrUjYr-O6r5cWJB-bbpWLihiy8IWBY', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    
    // Remove the "thinking" message
    const thinkingMessages = chatMessagesElement.querySelectorAll('.message-bot');
    for (const msg of thinkingMessages) {
      if (msg.textContent === 'Got it, Let me think about this...') {
        chatMessagesElement.removeChild(msg);
        break;
      }
    }
    
    if (data.candidates && data.candidates.length > 0 && 
        data.candidates[0].content && 
        data.candidates[0].content.parts && 
        data.candidates[0].content.parts.length > 0) {
      
      const responseText = data.candidates[0].content.parts[0].text;
      addMessage('bot', responseText, chatMessagesElement);

      await chrome.storage.local.set({ 
        [contextKey]: {
          question: (context.question || "") + "\n\nUser: " + userQuestion,
          answer: (context.answer || "") + "\n\nDimple: " + responseText
        } 
      });
    
    } else {
      throw new Error('Unexpected API response format');
    }
    
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    
    
    const thinkingMessages = chatMessagesElement.querySelectorAll('.message-bot');
    for (const msg of thinkingMessages) {
      if (msg.textContent === 'Got it, Let me think about this...' || msg.textContent === 'Thinking...') {
        chatMessagesElement.removeChild(msg);
        break;
      }
    }
    
    addMessage('bot', 'Sorry, I encountered an error. Please try again later. Error details: ' + error.message, chatMessagesElement);
  }
}

function setupMutationObserver() {
  const observer = new MutationObserver((mutationsList, observer) => {
    if (!document.querySelector('.helper-chatbot')) {
      createChatBot();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

function shouldRunChatBot() {
  const allowedURLs = [
    "https://maang.in/problems/"
    
  ];

  return allowedURLs.some(url => window.location.href.startsWith(url));
}


window.addEventListener("load", () => {
  if (shouldRunChatBot()) {
      createChatBot();
      setupMutationObserver();
      console.log("DSA Helper Extension loaded and ready");
  }
});

if (document.readyState === "complete" || document.readyState === "interactive") {
  if (shouldRunChatBot()) {
      createChatBot();
      setupMutationObserver();
  }
}