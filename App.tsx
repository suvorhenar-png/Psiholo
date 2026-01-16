
import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Mic, 
  MicOff, 
  Sparkles, 
  ChevronRight, 
  User, 
  Lock, 
  LogOut,
  Info,
  Wind
} from 'lucide-react';
import { Message, UserProfile } from './types';
import { generateSageResponse } from './geminiService';

const ACCESS_TOKEN = "rishi-exclusive-2024"; // Simulated access security

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [registrationError, setRegistrationError] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  // Handle simulated registration/access control
  const handleRegister = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const token = formData.get('token') as string;

    if (token !== ACCESS_TOKEN) {
      setRegistrationError("Неверный код доступа. Ссылка предназначена только для авторизованных пользователей.");
      return;
    }

    const newUser = { name, token, isRegistered: true };
    setUser(newUser);
    localStorage.setItem('rishi_user', JSON.stringify(newUser));
    
    // Initial sage greeting
    setMessages([{
      id: '1',
      role: 'assistant',
      text: `Приветствую тебя, дорогой ${name}. Я твой личный психолог и проводник. Расскажи мне, что тревожит твое сердце или к каким вершинам ты стремишься сегодня? Я здесь, чтобы выслушать и направить.`,
      timestamp: Date.now()
    }]);
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('rishi_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const sendMessage = async (text?: string) => {
    const messageToSend = text || inputText;
    if (!messageToSend.trim() || !user) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: messageToSend,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText("");
    setIsThinking(true);

    try {
      const sageData = await generateSageResponse(messageToSend, user.name);
      
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: `${sageData.text}\n\n✨ **${sageData.dopamine_boost}**`,
        plan: sageData.plan,
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, assistantMsg]);
    } catch (error) {
      console.error(error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: "Прости, мой друг, туман застелил мои мысли. Попробуй еще раз чуть позже.",
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsThinking(false);
    }
  };

  const toggleVoice = () => {
    setIsListening(!isListening);
    // In a real implementation, we'd start the Google GenAI Live API or browser Speech Recognition
    if (!isListening) {
      alert("Голосовой ввод активирован. (Демонстрация: введите текст ниже для ответа)");
    }
  };

  const logout = () => {
    localStorage.removeItem('rishi_user');
    setUser(null);
    setMessages([]);
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 sage-gradient">
        <div className="w-full max-w-md p-8 glass rounded-3xl text-center space-y-6 shadow-2xl">
          <div className="flex justify-center">
            <div className="w-24 h-24 rounded-full bg-indigo-600 flex items-center justify-center shadow-lg pulse-soft">
              <Sparkles className="w-12 h-12 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-2">Твой психолог</h1>
            <p className="text-slate-400 text-sm">Ваш путь к внутренней силе и гармонии</p>
          </div>
          
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input 
                name="name"
                type="text" 
                placeholder="Как вас зовут?" 
                required
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input 
                name="token"
                type="password" 
                placeholder="Код доступа" 
                required
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>
            {registrationError && <p className="text-red-400 text-xs text-left px-1">{registrationError}</p>}
            <button 
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl shadow-lg shadow-indigo-900/50 flex items-center justify-center gap-2 group transition-all"
            >
              Начать путь
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
          
          <p className="text-slate-500 text-xs leading-relaxed">
            Нажимая "Начать путь", вы соглашаетесь с тем, что ваши данные защищены и используются только для персонализации ответов ИИ.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen max-w-lg mx-auto bg-slate-950 relative overflow-hidden">
      {/* Header */}
      <header className="glass px-6 py-4 flex items-center justify-between sticky top-0 z-20 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img 
              src="https://picsum.photos/seed/sage/200" 
              alt="Rishi Sage" 
              className="w-10 h-10 rounded-full border-2 border-indigo-500 object-cover"
            />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-slate-950 rounded-full"></div>
          </div>
          <div>
            <h2 className="font-serif text-lg leading-tight">Твой психолог</h2>
            <div className="flex items-center gap-1">
              <div className="w-1 h-1 rounded-full bg-indigo-400 animate-pulse"></div>
              <span className="text-[10px] text-indigo-400 uppercase tracking-widest font-semibold">В потоке мудрости</span>
            </div>
          </div>
        </div>
        <button onClick={logout} className="p-2 text-slate-400 hover:text-white transition-colors">
          <LogOut className="w-5 h-5" />
        </button>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 space-y-6 pb-24 scrollbar-hide">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] rounded-2xl p-4 shadow-xl ${
              msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-tr-none' 
                : 'chat-bubble-rishi text-slate-100 rounded-tl-none'
            }`}>
              <div className="text-sm leading-relaxed whitespace-pre-wrap">
                {msg.text}
              </div>
              
              {msg.plan && (
                <div className="mt-4 p-3 bg-white/5 rounded-xl border border-white/10 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-2">
                    <Wind className="w-3 h-3" /> План действий
                  </h4>
                  <ul className="space-y-1.5">
                    {msg.plan.map((step, idx) => (
                      <li key={idx} className="text-xs flex gap-2">
                        <span className="text-indigo-400 font-bold">{idx + 1}.</span>
                        <span className="text-slate-300 italic">{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className={`text-[10px] mt-2 opacity-40 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}

        {isThinking && (
          <div className="flex justify-start">
            <div className="chat-bubble-rishi p-4 rounded-2xl rounded-tl-none flex items-center gap-2">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
              <span className="text-xs text-indigo-300 italic">Слушаю твое сердце...</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </main>

      {/* Input Area */}
      <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-slate-950 via-slate-950 to-transparent">
        <div className="glass rounded-2xl p-2 flex items-center gap-2 shadow-2xl border border-indigo-500/20">
          <button 
            onClick={toggleVoice}
            className={`p-3 rounded-xl transition-all ${
              isListening ? 'bg-red-500 text-white pulse-soft' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
          
          <input 
            type="text" 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Что на душе?..."
            className="flex-1 bg-transparent border-none py-2 px-2 focus:outline-none text-sm placeholder-slate-500"
          />
          
          <button 
            onClick={() => sendMessage()}
            disabled={!inputText.trim() || isThinking}
            className={`p-3 rounded-xl transition-all ${
              inputText.trim() ? 'bg-indigo-600 text-white scale-100 shadow-lg' : 'bg-slate-800 text-slate-500 scale-95'
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      {/* Decorative Aura */}
      <div className="absolute top-1/4 -right-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 -left-20 w-64 h-64 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none"></div>
    </div>
  );
};

export default App;
