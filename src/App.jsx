import React, { useEffect, useState } from 'react';
import './App.css';
import { useRef } from 'react';
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
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      text: "Hi, I’m Chat LLaMA Ai — your AI buddy for questions, learning, and endless curiosity.",
      isBot: true,

    }
  ]);
  useEffect(() => {
    msgEnd.current.scrollIntoView();
  }, [messages]);


  const handleSend = async () => {
    const text = input;
    setInput('');
    setMessages([
      ...messages, { text, isBot: false }
    ])
    const res = await sendMsgToOpenAI(input);
    setMessages([...messages,
    { text, isBot: false },
    { text: res, isBot: true }
    ]);
  }

  const handleEnter = async (e) => {
    if (e.key === 'Enter') await handleSend();
  }
  const handleQuery = async (e) => {
    const text = e.target.value;
    setMessages([
      ...messages, { text, isBot: false }
    ])
    const res = await sendMsgToOpenAI(text);
    setMessages([...messages,
    { text, isBot: false },
    { text: res, isBot: true }
    ]);
  }
  return (
    <>
      <div className="App">
        <div className="sideBar">
          <div className="upperSide">
            <div className="upperSideTop">
              <img src={gptLogo} style={{ height: "35px", }} alt="Logo" className="logo" />
              <span className="brand">LLaMA Ai</span>
            </div>
            <button
              className="midBtn"
              onClick={() =>
                setMessages([
                  {
                    text: "Hi, I’m Chat LLaMA Ai — your AI buddy for questions, learning, and endless curiosity.",
                    isBot: true,
                  }
                ])
              }
            >
              <img src={addBtn} alt="new chat" className="addBtn" />
              New Chat
            </button>

            <div className="upperSideBottom">
              <button className="query" onClick={handleQuery} value={"What is Programming ? "}>
                <img src={msgIcon} alt="Query" />What is Programming
              </button>
              <button className="query" onClick={handleQuery} value={"What is API ?"}>
                <img src={msgIcon} alt="Query" />How to use API ?
              </button>
            </div>
          </div>
          <div className="lowerSide">
            <div className="listItems">
              <img src={home} alt="Home" className="listItemsImg" />Home
            </div>
            <div className="listItems">
              <img src={saved} alt="Saved" className="listItemsImg" />Saved
            </div>
            <div className="listItems">
              <img src={rocket} alt="Rocket" className="listItemsImg" />Upgrade to Pro
            </div>
          </div>
        </div>

        <div className="main">
          <div className="chats">

            {messages.map((message, i) =>
              <div key={i} className={message.isBot ? "chat bot" : "chat"}>
                <img src={message.isBot ? gptImgLogo : userIcon} alt="" className="chatImg" />
                <p className="txt">
                  {message.text}
                </p>
              </div>
            )}
            <div ref={msgEnd} />
          </div>

          <div className="chatFooter">
            <div className="inp">
              <input
                type="text"
                placeholder="Send a message"
                value={input}
                onKeyDown={handleEnter}
                onChange={(e) => setInput(e.target.value)}
              />
              <button className="send" onClick={handleSend}>
                <img src={sendBtn} alt="send" />
              </button>
            </div>
            <p>LlaMA Ai may produce wrong results.</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default App;
