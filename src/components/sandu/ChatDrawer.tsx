import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  X,
  Send,
  Mic,
  MicOff,
  Volume2,
  Trash2,
  Sparkles,
  Bot
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { SanduAvatar } from './SanduAvatar';
import { querySanduBrain } from '../../ai/sanduBrain';
import { executeSanduAction } from '../../ai/actions';
import { speakText, createSpeechRecognizer, isSpeechRecognitionSupported } from '../../utils/speech';

export const ChatDrawer: React.FC = () => {
  const { t, i18n } = useTranslation();
  const {
    isChatDrawerOpen,
    setChatDrawerOpen,
    chatMessages,
    addChatMessage,
    clearChatMessages,
    sanduExpression,
    setSanduExpression,
    voiceEnabled,
    speechRate,
    speechPitch,
    sanduOutfitColor,
    userName
  } = useAppStore();

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognizerRef = useRef<any>(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isChatDrawerOpen) {
      scrollToBottom();
    }
  }, [chatMessages, isChatDrawerOpen, isTyping]);

  // Handle Speech Recognition
  const toggleListening = () => {
    if (isListening) {
      if (recognizerRef.current) {
        recognizerRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    if (!isSpeechRecognitionSupported()) {
      alert(t('sandu.voiceUnsupported'));
      return;
    }

    const langCode = i18n.language === 'si' ? 'si-LK' : i18n.language === 'ta' ? 'ta-IN' : 'en-US';
    const recognizer = createSpeechRecognizer(
      (transcript) => {
        setInputText(transcript);
        setIsListening(false);
        handleSend(transcript);
      },
      (err) => {
        console.warn('Speech recognition error:', err);
        setIsListening(false);
      },
      langCode
    );

    if (recognizer) {
      recognizerRef.current = recognizer;
      recognizer.start();
      setIsListening(true);
    }
  };

  const handleSpeak = (text: string, msgId: string) => {
    if (speakingMessageId === msgId) {
      window.speechSynthesis?.cancel();
      setSpeakingMessageId(null);
      return;
    }

    const langCode = i18n.language === 'si' ? 'si-LK' : i18n.language === 'ta' ? 'ta-IN' : 'en-US';
    setSpeakingMessageId(msgId);
    setSanduExpression('talking');

    speakText({
      text,
      lang: langCode,
      rate: speechRate,
      pitch: speechPitch,
      onEnd: () => {
        setSpeakingMessageId(null);
        setSanduExpression('happy');
      },
      onError: () => {
        setSpeakingMessageId(null);
        setSanduExpression('idle');
      }
    });
  };

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isTyping) return;

    setInputText('');
    setSanduExpression('thinking');

    // Add user message
    addChatMessage({
      sender: 'user',
      text
    });

    setIsTyping(true);

    try {
      // Query SANDU AI Brain
      const response = await querySanduBrain(text);

      setIsTyping(false);
      setSanduExpression(response.expression || 'happy');

      const newMsgId = `msg-${Date.now()}`;
      addChatMessage({
        sender: 'sandu',
        text: response.replyText,
        expression: response.expression,
        quickReplies: response.quickReplies,
        actionPending: response.actionPayload
          ? {
              action: response.actionPayload.action,
              params: response.actionPayload.params,
              label: t('sandu.actionConfirmPrompt')
            }
          : undefined
      });

      // Auto read-aloud if voice is enabled
      if (voiceEnabled) {
        handleSpeak(response.replyText, newMsgId);
      }
    } catch (err) {
      setIsTyping(false);
      setSanduExpression('encouraging');
      addChatMessage({
        sender: 'sandu',
        text: "I had a small hiccup thinking about that, but let's try again! 💖",
        expression: 'encouraging'
      });
    }
  };

  const handleExecutePendingAction = async (action: any, params: any) => {
    const result = await executeSanduAction({ action, params });
    addChatMessage({
      sender: 'sandu',
      text: result.message,
      expression: result.success ? 'celebrating' : 'encouraging'
    });
  };

  return (
    <AnimatePresence>
      {isChatDrawerOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setChatDrawerOpen(false)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40"
          />

          {/* Drawer panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed top-0 right-0 bottom-0 w-full sm:w-[440px] bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/70 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <SanduAvatar
                  size="sm"
                  expression={sanduExpression}
                  outfitColor={sanduOutfitColor}
                  isSpeaking={speakingMessageId !== null}
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">
                      {t('sandu.name')}
                    </h3>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {t('sandu.title')} • {userName}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={clearChatMessages}
                  title="Clear chat"
                  className="p-2 text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setChatDrawerOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.map((msg) => {
                const isSandu = msg.sender === 'sandu';

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isSandu ? 'items-start' : 'items-end'}`}
                  >
                    <div
                      className={`flex items-end gap-2 max-w-[88%] ${isSandu ? 'flex-row' : 'flex-row-reverse'}`}
                    >
                      {isSandu && (
                        <div className="mb-1 shrink-0">
                          <SanduAvatar
                            size="sm"
                            expression={msg.expression || 'idle'}
                            outfitColor={sanduOutfitColor}
                          />
                        </div>
                      )}

                      <div
                        className={`p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                          isSandu
                            ? 'bg-slate-100 dark:bg-slate-800/90 text-slate-800 dark:text-slate-100 rounded-bl-sm border border-slate-200/60 dark:border-slate-700/60'
                            : 'bg-accent-600 text-white rounded-br-sm'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.text}</p>

                        {/* Read-aloud button for SANDU's message */}
                        {isSandu && (
                          <div className="mt-2 pt-2 border-t border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between">
                            <button
                              onClick={() => handleSpeak(msg.text, msg.id)}
                              className="text-xs text-slate-400 hover:text-accent-500 flex items-center gap-1 transition"
                            >
                              <Volume2
                                className={`w-3.5 h-3.5 ${speakingMessageId === msg.id ? 'text-accent-500 animate-pulse' : ''}`}
                              />
                              <span>{speakingMessageId === msg.id ? 'Stop' : 'Listen'}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Pending Action Confirmation Chip */}
                    {msg.actionPending && (
                      <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-2 ml-10 p-2.5 bg-accent-50 dark:bg-accent-950/40 border border-accent-200 dark:border-accent-800 rounded-xl flex items-center gap-2"
                      >
                        <Sparkles className="w-4 h-4 text-accent-500" />
                        <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                          {msg.actionPending.label}
                        </span>
                        <button
                          onClick={() =>
                            handleExecutePendingAction(
                              msg.actionPending?.action,
                              msg.actionPending?.params
                            )
                          }
                          className="px-2.5 py-1 text-xs font-semibold bg-accent-600 hover:bg-accent-700 text-white rounded-lg transition"
                        >
                          Confirm
                        </button>
                      </motion.div>
                    )}

                    {/* Quick Reply Chips */}
                    {msg.quickReplies && msg.quickReplies.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2 ml-10 max-w-[90%]">
                        {msg.quickReplies.map((chip, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSend(chip)}
                            className="text-xs px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-accent-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-accent-600 border border-slate-200 dark:border-slate-700 rounded-full transition shadow-2xs"
                          >
                            {chip}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex items-center gap-2 text-xs text-slate-400 ml-2">
                  <SanduAvatar size="sm" expression="thinking" outfitColor={sanduOutfitColor} />
                  <div className="flex gap-1 items-center bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-2xl">
                    <span className="w-1.5 h-1.5 bg-accent-500 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-accent-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 bg-accent-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2"
              >
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={t('sandu.chatPlaceholder')}
                    className="w-full pl-3.5 pr-10 py-2.5 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500 text-slate-900 dark:text-white placeholder-slate-400"
                  />
                  <button
                    type="button"
                    onClick={toggleListening}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition ${
                      isListening
                        ? 'bg-rose-500 text-white animate-pulse'
                        : 'text-slate-400 hover:text-accent-500'
                    }`}
                    title="Voice input"
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="p-2.5 bg-accent-600 hover:bg-accent-700 disabled:opacity-40 disabled:hover:bg-accent-600 text-white rounded-xl transition shrink-0 shadow-md"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
              <p className="text-[10px] text-center text-slate-400 mt-1.5">
                {t('sandu.disclaimer')}
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
