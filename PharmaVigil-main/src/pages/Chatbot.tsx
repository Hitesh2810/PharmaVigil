import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Send,
  Sparkles,
  Bot,
  User,
  Plus,
  MessageSquare,
  Trash2,
  Menu,
  X,
  Pill,
  Brain,
  Trees,
  ClipboardCheck,
  AlertTriangle,
  Database,
  LineChart,
  Rocket,
  type LucideIcon,
} from 'lucide-react';
import { type ChatMessage, type Conversation } from '@/lib/chat';
import { suggestedPrompts } from '@/lib/knowledge';
import { getBotResponse } from '@/lib/knowledge';
import {
  askChatbot,
  createChatConversation,
  deleteChatConversation,
  listChatConversations,
  loadChatConversation,
  sendPersistentChatMessage,
  type StoredConversation,
  type StoredMessage,
} from '@/lib/api';

const iconMap: Record<string, LucideIcon> = {
  Pill,
  Sparkles,
  Brain,
  Trees,
  ClipboardCheck,
  AlertTriangle,
  Database,
  LineChart,
  Rocket,
};

let idCounter = 0;
const uid = () => `m${Date.now()}_${idCounter++}`;

function MarkdownMessage({ content }: { content: string }) {
  const lines = content.split('\n');
  return (
    <div className="space-y-2 whitespace-pre-wrap">
      {lines.map((line, index) => {
        if (line.startsWith('### ')) return <h3 key={index} className="text-base font-semibold text-white">{line.slice(4)}</h3>;
        if (line.startsWith('## ')) return <h2 key={index} className="text-lg font-semibold text-white">{line.slice(3)}</h2>;
        if (line.startsWith('- ')) return <div key={index} className="flex gap-2"><span>•</span><span>{line.slice(2)}</span></div>;
        if (line.startsWith('> ')) return <blockquote key={index} className="border-l-2 border-secondary/60 pl-3 text-white/75">{line.slice(2)}</blockquote>;
        const bold = line.split(/(\*\*[^*]+\*\*)/g).map((part, partIndex) => part.startsWith('**') && part.endsWith('**') ? <strong key={partIndex} className="font-semibold text-white">{part.slice(2, -2)}</strong> : part);
        return <p key={index}>{bold.length ? bold : ' '}</p>;
      })}
    </div>
  );
}

function newConversation(): Conversation {
  return {
    id: `c${Date.now()}`,
    title: 'New conversation',
    messages: [],
    createdAt: Date.now(),
  };
}

const toConversation = (conversation: StoredConversation): Conversation => ({
  id: conversation.id,
  title: conversation.title || 'New conversation',
  messages: [],
  createdAt: new Date(conversation.created_at).getTime(),
});

const toMessage = (message: StoredMessage): ChatMessage => ({
  id: message.id,
  role: message.role === 'user' ? 'user' : 'bot',
  content: message.content,
  timestamp: new Date(message.created_at).getTime(),
});

const isPersistentConversation = (conversationId: string) => !conversationId.startsWith('c');

const greetingMessage: ChatMessage = {
  id: 'greeting',
  role: 'bot',
  content:
    "Hi, I'm PharmaVigil AI — your pharmacovigilance assistant. Ask me about adverse-event prediction, SHAP explainability, causality assessment, or the project itself. You can also tap a suggested prompt below.",
  timestamp: Date.now(),
};

export default function Chatbot() {
  const [conversations, setConversations] = useState<Conversation[]>(() => [
    { ...newConversation(), messages: [greetingMessage], title: 'Welcome chat' },
  ]);
  const [activeId, setActiveId] = useState(conversations[0].id);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const active = conversations.find((c) => c.id === activeId)!;

  const loadConversation = async (conversationId: string) => {
    try {
      const payload = await loadChatConversation(conversationId);
      setConversations((prev) => prev.map((conversation) => (
        conversation.id === conversationId
          ? { ...toConversation(payload.conversation), messages: payload.messages.map(toMessage) }
          : conversation
      )));
    } catch {
      // The in-memory fallback keeps the original chatbot usable if storage is unavailable.
    }
  };

  useEffect(() => {
    const restoreConversations = async () => {
      try {
        const stored = await listChatConversations();
        if (stored.length === 0) return;
        const firstConversation = await loadChatConversation(stored[0].id);
        const restored = stored.map((conversation) => (
          conversation.id === firstConversation.conversation.id
            ? {
                ...toConversation(firstConversation.conversation),
                messages: firstConversation.messages.map(toMessage),
              }
            : toConversation(conversation)
        ));
        setConversations(restored);
        setActiveId(restored[0].id);
      } catch {
        // Retain the existing local welcome conversation when Supabase is unavailable.
      }
    };
    void restoreConversations();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [active.messages, typing]);

  const updateActive = (updater: (c: Conversation) => Conversation) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === activeId ? updater(c) : c))
    );
  };

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || typing) return;

    const userMsg: ChatMessage = {
      id: uid(),
      role: 'user',
      content: trimmed,
      timestamp: Date.now(),
    };

    const conversationId = activeId;
    updateActive((c) => ({
      ...c,
      title: c.messages.filter((message) => message.role === 'user').length === 0 ? trimmed.slice(0, 50) : c.title,
      messages: [...c.messages, userMsg],
    }));
    setInput('');
    setTyping(true);

    try {
      const responsePayload = isPersistentConversation(conversationId)
        ? await sendPersistentChatMessage(conversationId, trimmed)
        : await askChatbot(trimmed, conversationId);
      const response = responsePayload?.reply || getBotResponse(trimmed);
      const delay = Math.min(2200, 700 + response.length * 4);
      setTimeout(() => {
        const botMsg: ChatMessage = {
          id: uid(),
          role: 'bot',
          content: response,
          timestamp: Date.now(),
        };
        setConversations((prev) => prev.map((conversation) => (
          conversation.id === conversationId
            ? { ...conversation, messages: [...conversation.messages, botMsg] }
            : conversation
        )));
        setTyping(false);
      }, delay);
    } catch (error) {
      const fallback = getBotResponse(trimmed);
      const botMsg: ChatMessage = {
        id: uid(),
        role: 'bot',
        content: fallback,
        timestamp: Date.now(),
      };
      setConversations((prev) => prev.map((conversation) => (
        conversation.id === conversationId
          ? { ...conversation, messages: [...conversation.messages, botMsg] }
          : conversation
      )));
      setTyping(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void sendMessage(input);
  };

  const startNewChat = async () => {
    try {
      const stored = await createChatConversation();
      const conversation = { ...toConversation(stored), messages: [greetingMessage] };
      setConversations((prev) => [conversation, ...prev]);
      setActiveId(conversation.id);
    } catch {
      const conversation = newConversation();
      conversation.messages = [greetingMessage];
      setConversations((prev) => [conversation, ...prev]);
      setActiveId(conversation.id);
    }
    setSidebarOpen(false);
    inputRef.current?.focus();
  };

  const deleteConversation = async (id: string) => {
    if (isPersistentConversation(id)) {
      try {
        await deleteChatConversation(id);
      } catch {
        return;
      }
    }
    setConversations((prev) => {
      const filtered = prev.filter((c) => c.id !== id);
      if (filtered.length === 0) {
        const fresh = { ...newConversation(), messages: [greetingMessage], title: 'Welcome chat' };
        setActiveId(fresh.id);
        return [fresh];
      }
      if (id === activeId) setActiveId(filtered[0].id);
      return filtered;
    });
  };

  const showEmptyState = active.messages.length <= 1;

  return (
    <div className="mx-auto flex h-[calc(100vh-7rem)] w-full max-w-7xl gap-4 px-4 pb-6 sm:px-8">
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col gap-3 border-r border-white/10 bg-surface/95 p-4 backdrop-blur-xl transition-transform lg:static lg:z-0 lg:translate-x-0 lg:bg-transparent lg:backdrop-blur-none ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="font-display text-sm font-semibold text-white">Conversations</span>
          <button
            className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/5 text-muted hover:text-white lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <button
          onClick={() => { void startNewChat(); }}
          className="flex items-center justify-center gap-2 rounded-xl bg-brand-gradient px-4 py-2.5 text-sm font-semibold text-white shadow-glow transition-all hover:-translate-y-0.5"
        >
          <Plus className="h-4 w-4" />
          New Chat
        </button>

        <div className="flex-1 space-y-1.5 overflow-y-auto scrollbar-thin">
          {conversations.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                setActiveId(c.id);
                setSidebarOpen(false);
                if (isPersistentConversation(c.id)) void loadConversation(c.id);
              }}
              className={`group flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                c.id === activeId
                  ? 'bg-white/[0.06] text-white ring-1 ring-white/10'
                  : 'text-muted hover:bg-white/[0.04] hover:text-white'
              }`}
            >
              <MessageSquare className="h-4 w-4 shrink-0" />
              <span className="flex-1 truncate">{c.title}</span>
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  void deleteConversation(c.id);
                }}
                className="opacity-0 transition-opacity group-hover:opacity-100"
              >
                <Trash2 className="h-3.5 w-3.5 hover:text-red-400" />
              </span>
            </button>
          ))}
        </div>

        <div className="glass rounded-xl p-3">
          <p className="text-xs font-semibold text-white">Suggested prompts</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {suggestedPrompts.slice(0, 4).map((p) => {
              const Icon = iconMap[p.icon] ?? Sparkles;
              return (
                <button
                  key={p.prompt}
                  onClick={() => { void sendMessage(p.prompt); }}
                  className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-[11px] text-muted transition-colors hover:text-white"
                >
                  <Icon className="h-3 w-3" />
                  {p.category}
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      {/* Chat window */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-surface/40 backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-white/5 text-white lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-4 w-4" />
            </button>
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-gradient shadow-glow">
              <Bot className="h-5 w-5 text-white" />
            </span>
            <div>
              <p className="text-sm font-semibold text-white">PharmaVigil AI Assistant</p>
              <p className="flex items-center gap-1.5 text-xs text-muted">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Online · Ready to help
              </p>
            </div>
          </div>
          <span className="hidden rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-muted sm:inline">
            Knowledge base
          </span>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 space-y-5 overflow-y-auto px-4 py-6 scrollbar-thin sm:px-6">
          {showEmptyState && (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="grid h-20 w-20 place-items-center rounded-3xl bg-brand-gradient shadow-glow"
              >
                <Sparkles className="h-10 w-10 text-white" />
              </motion.div>
              <h3 className="mt-6 text-xl font-semibold text-white">
                Ask PharmaVigil AI anything
              </h3>
              <p className="mt-2 max-w-md text-sm text-muted">
                Pick a suggested prompt or type your own question about drug
                safety, predictions, SHAP, or the project.
              </p>
              <div className="mt-8 grid w-full max-w-2xl grid-cols-1 gap-2.5 sm:grid-cols-2">
                {suggestedPrompts.map((p) => {
                  const Icon = iconMap[p.icon] ?? Sparkles;
                  return (
                    <button
                      key={p.prompt}
                      onClick={() => { void sendMessage(p.prompt); }}
                      className="glass card-glow-hover group flex items-start gap-3 rounded-xl p-3.5 text-left transition-all hover:-translate-y-0.5"
                    >
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/5 text-secondary">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span>
                        <span className="block text-xs font-semibold uppercase tracking-wide text-secondary">
                          {p.category}
                        </span>
                        <span className="block text-sm text-white/90 group-hover:text-white">
                          {p.prompt}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {!showEmptyState &&
            active.messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <span
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${
                    msg.role === 'user'
                      ? 'bg-white/10 text-white'
                      : 'bg-brand-gradient text-white shadow-glow'
                  }`}
                >
                  {msg.role === 'user' ? <User className="h-4.5 w-4.5" /> : <Bot className="h-4.5 w-4.5" />}
                </span>
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-primary/15 text-white ring-1 ring-primary/20'
                      : 'glass text-white/90'
                  }`}
                >
                  {msg.role === 'bot' ? <MarkdownMessage content={msg.content} /> : msg.content}
                </div>
              </motion.div>
            ))}

          {typing && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-gradient text-white shadow-glow">
                <Bot className="h-4.5 w-4.5" />
              </span>
              <div className="glass flex items-center gap-1.5 rounded-2xl px-4 py-4">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="typing-dot h-2 w-2 rounded-full bg-secondary"
                    style={{ animationDelay: `${i * 0.18}s` }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Input */}
        <form
          onSubmit={handleSubmit}
          className="border-t border-white/[0.06] p-4 sm:p-5"
        >
          <div className="flex items-end gap-2.5 rounded-2xl border border-white/10 bg-white/[0.04] p-2 focus-within:border-primary/40 focus-within:ring-1 focus-within:ring-primary/30">
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  void sendMessage(input);
                }
              }}
              placeholder="Ask about pharmacovigilance, SHAP, predictions…"
              className="max-h-32 flex-1 resize-none bg-transparent px-2 py-2 text-sm text-white placeholder:text-muted focus:outline-none"
            />
            <button
              type="submit"
              disabled={!input.trim() || typing}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-gradient text-white shadow-glow transition-all hover:-translate-y-0.5 disabled:opacity-40 disabled:hover:translate-y-0"
            >
              <Send className="h-4.5 w-4.5" />
            </button>
          </div>
          <p className="mt-2 text-center text-[11px] text-muted">
            PharmaVigil AI is a demo assistant · responses are generated from a project knowledge base
          </p>
        </form>
      </div>
    </div>
  );
}
