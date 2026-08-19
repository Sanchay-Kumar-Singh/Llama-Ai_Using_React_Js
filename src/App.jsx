import React, { useEffect, useRef, useState } from 'react';
import './App.css';

import gptLogo from './assets/3.png';
import addBtn from './assets/add-30.png';
import msgIcon from './assets/message.svg';
import home from './assets/home.svg';
import saved from './assets/bookmark.svg';
import rocket from './assets/rocket.svg';
import sendBtn from './assets/send.svg';
import userIcon from './assets/sanchay.jpg';
import gptImgLogo from './assets/3.png';

import { sendMsgToOpenAI } from './openai';

const App = () => {
  const msgEnd = useRef(null);

  const [input, setInput] = useState('');

  const [messages, setMessages] = useState([
    {
      text: "Hi, I’m Chat LLaMA Ai — your AI buddy for questions, learning, and endless curiosity.",
      isBot: true,
    },
  ]);

  // Scroll to latest message
  useEffect(() => {
    msgEnd.current?.scrollIntoView({
      behavior: 'smooth',
    });
  }, [messages]);

  // ==========================================
  // INLINE FORMATTER
  // ==========================================

  const formatInline = (text) => {
    const elements = [];
    let remaining = text;
    let key = 0;

    const regex =
      /(\*\*.*?\*\*|__.*?__|`.*?`|\*.*?\*|_.*?_)/;

    while (remaining.length > 0) {
      const match = remaining.match(regex);

      if (!match) {
        elements.push(
          <span key={key++}>
            {remaining}
          </span>
        );
        break;
      }

      const index = match.index;

      // Text before formatting
      if (index > 0) {
        elements.push(
          <span key={key++}>
            {remaining.substring(0, index)}
          </span>
        );
      }

      const value = match[0];

      // Bold
      if (
        (value.startsWith('**') &&
          value.endsWith('**')) ||
        (value.startsWith('__') &&
          value.endsWith('__'))
      ) {
        elements.push(
          <strong key={key++}>
            {value.substring(2, value.length - 2)}
          </strong>
        );
      }

      // Inline code
      else if (
        value.startsWith('`') &&
        value.endsWith('`')
      ) {
        elements.push(
          <code
            key={key++}
            className="inlineCode"
          >
            {value.substring(1, value.length - 1)}
          </code>
        );
      }

      // Italic
      else {
        elements.push(
          <em key={key++}>
            {value.substring(1, value.length - 1)}
          </em>
        );
      }

      remaining = remaining.substring(
        index + value.length
      );
    }

    return elements;
  };

  // ==========================================
  // RESPONSE FORMATTER
  // ==========================================

  const formatResponse = (text) => {
    if (!text) return null;

    // Remove unwanted | symbols
    const cleanedText = text
      .replace(/\|/g, '')
      .replace(/\r/g, '');

    const lines = cleanedText.split('\n');

    const output = [];

    let inCodeBlock = false;
    let codeLanguage = '';
    let codeContent = [];

    let i = 0;

    while (i < lines.length) {
      const line = lines[i];
      const trimmed = line.trim();

      // ========================================
      // CODE BLOCK
      // ========================================

      if (trimmed.startsWith('```')) {
        if (!inCodeBlock) {
          inCodeBlock = true;

          codeLanguage = trimmed
            .replace('```', '')
            .trim();

          codeContent = [];
        } else {
          inCodeBlock = false;

          output.push(
            <div
              className="codeBlock"
              key={`code-${i}`}
            >
              <div className="codeHeader">
                <span>
                  {codeLanguage || 'Code'}
                </span>

                <button
                  onClick={() =>
                    navigator.clipboard.writeText(
                      codeContent.join('\n')
                    )
                  }
                >
                  Copy
                </button>
              </div>

              <pre>
                <code>
                  {codeContent.join('\n')}
                </code>
              </pre>
            </div>
          );

          codeContent = [];
        }

        i++;
        continue;
      }

      // Inside code block
      if (inCodeBlock) {
        codeContent.push(line);
        i++;
        continue;
      }

      // ========================================
      // EMPTY LINE
      // ========================================

      if (!trimmed) {
        output.push(
          <div
            key={`space-${i}`}
            className="responseSpace"
          />
        );

        i++;
        continue;
      }

      // ========================================
      // HEADINGS
      // ========================================

      if (/^#{1,6}\s/.test(trimmed)) {
        const heading = trimmed.replace(
          /^#{1,6}\s+/,
          ''
        );

        output.push(
          <h3
            key={`heading-${i}`}
            className="responseHeading"
          >
            {formatInline(heading)}
          </h3>
        );

        i++;
        continue;
      }

      // ========================================
      // HORIZONTAL LINE
      // ========================================

      if (
        /^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)
      ) {
        output.push(
          <hr
            key={`hr-${i}`}
            className="responseHr"
          />
        );

        i++;
        continue;
      }

      // ========================================
      // BLOCKQUOTE
      // ========================================

      if (trimmed.startsWith('>')) {
        const quote = trimmed.replace(
          /^>\s?/,
          ''
        );

        output.push(
          <div
            key={`quote-${i}`}
            className="responseQuote"
          >
            {formatInline(quote)}
          </div>
        );

        i++;
        continue;
      }

      // ========================================
      // BULLET LIST
      // ========================================

      if (/^[-*+]\s+/.test(trimmed)) {
        const bullet = trimmed.replace(
          /^[-*+]\s+/,
          ''
        );

        output.push(
          <div
            key={`bullet-${i}`}
            className="responseBullet"
          >
            <span className="bulletIcon">
              •
            </span>

            <span>
              {formatInline(bullet)}
            </span>
          </div>
        );

        i++;
        continue;
      }

      // ========================================
      // NUMBERED LIST
      // ========================================

      const numbered = trimmed.match(
        /^(\d+)[.)]\s+(.*)$/
      );

      if (numbered) {
        output.push(
          <div
            key={`number-${i}`}
            className="responseNumber"
          >
            <span className="numberIcon">
              {numbered[1]}.
            </span>

            <span>
              {formatInline(numbered[2])}
            </span>
          </div>
        );

        i++;
        continue;
      }

      // ========================================
      // NORMAL PARAGRAPH
      // ========================================

      output.push(
        <p
          key={`paragraph-${i}`}
          className="responseParagraph"
        >
          {formatInline(trimmed)}
        </p>
      );

      i++;
    }

    return output;
  };

  // ==========================================
  // SEND MESSAGE
  // ==========================================

  const handleSend = async () => {
    const text = input.trim();

    if (!text) return;

    setInput('');

    // Add user message
    setMessages((prev) => [
      ...prev,
      {
        text: text,
        isBot: false,
      },
    ]);

    try {
      const res = await sendMsgToOpenAI(text);

      // Add AI message
      setMessages((prev) => [
        ...prev,
        {
          text: res,
          isBot: true,
        },
      ]);
    } catch (error) {
      console.error('Error:', error);

      setMessages((prev) => [
        ...prev,
        {
          text:
            'Sorry, something went wrong. Please try again.',
          isBot: true,
        },
      ]);
    }
  };

  // ==========================================
  // ENTER KEY
  // ==========================================

  const handleEnter = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  // ==========================================
  // SIDEBAR QUERY
  // ==========================================

  const handleQuery = async (e) => {
    const text = e.currentTarget.value;

    setMessages((prev) => [
      ...prev,
      {
        text: text,
        isBot: false,
      },
    ]);

    try {
      const res = await sendMsgToOpenAI(text);

      setMessages((prev) => [
        ...prev,
        {
          text: res,
          isBot: true,
        },
      ]);
    } catch (error) {
      console.error('Error:', error);

      setMessages((prev) => [
        ...prev,
        {
          text:
            'Sorry, something went wrong. Please try again.',
          isBot: true,
        },
      ]);
    }
  };

  // ==========================================
  // NEW CHAT
  // ==========================================

  const handleNewChat = () => {
    setMessages([
      {
        text: "Hi, I’m Chat LLaMA Ai — your AI buddy for questions, learning, and endless curiosity.",
        isBot: true,
      },
    ]);

    setInput('');
  };

  return (
    <div className="App">

      {/* =====================================
          SIDEBAR
      ====================================== */}

      <div className="sideBar">

        <div className="upperSide">

          {/* Logo */}

          <div className="upperSideTop">

            <img
              src={gptLogo}
              style={{ height: '35px' }}
              alt="Logo"
              className="logo"
            />

            <span className="brand">
              LLaMA Ai
            </span>

          </div>

          {/* New Chat */}

          <button
            className="midBtn"
            onClick={handleNewChat}
          >

            <img
              src={addBtn}
              alt="new chat"
              className="addBtn"
            />

            New Chat

          </button>

          {/* Questions */}

          <div className="upperSideBottom">

            <button
              className="query"
              onClick={handleQuery}
              value="What is Programming?"
            >

              <img
                src={msgIcon}
                alt="Query"
              />

              What is Programming

            </button>

            <button
              className="query"
              onClick={handleQuery}
              value="What is API?"
            >

              <img
                src={msgIcon}
                alt="Query"
              />

              How to use API?

            </button>

          </div>

        </div>

        {/* Bottom Sidebar */}

        <div className="lowerSide">

          <div className="listItems">

            <img
              src={home}
              alt="Home"
              className="listItemsImg"
            />

            Home

          </div>

          <div className="listItems">

            <img
              src={saved}
              alt="Saved"
              className="listItemsImg"
            />

            Saved

          </div>

          <div className="listItems">

            <img
              src={rocket}
              alt="Upgrade"
              className="listItemsImg"
            />

            Upgrade to Pro

          </div>

        </div>

      </div>

      {/* =====================================
          MAIN CHAT
      ====================================== */}

      <div className="main">

        <div className="chats">

          {messages.map((message, i) => (

            <div
              key={i}
              className={
                message.isBot
                  ? 'chat bot'
                  : 'chat'
              }
            >

              {/* Profile */}

              <img
                src={
                  message.isBot
                    ? gptImgLogo
                    : userIcon
                }
                alt=""
                className="chatImg"
              />

              {/* Message */}

              <div className="txt">

                {message.isBot ? (
                  <div className="botResponse">
                    {formatResponse(
                      message.text
                    )}
                  </div>
                ) : (
                  <p className="userMessage">
                    {message.text}
                  </p>
                )}

              </div>

            </div>

          ))}

          <div ref={msgEnd}></div>

        </div>

        {/* =================================
            CHAT FOOTER
        ================================== */}

        <div className="chatFooter">

          <div className="inp">

            <input
              type="text"
              placeholder="Send a message"
              value={input}
              onChange={(e) =>
                setInput(e.target.value)
              }
              onKeyDown={handleEnter}
            />

            <button
              className="send"
              onClick={handleSend}
            >

              <img
                src={sendBtn}
                alt="send"
              />

            </button>

          </div>

          <p>
            LlaMA Ai may produce wrong results.
          </p>

        </div>

      </div>

    </div>
  );
};

export default App;