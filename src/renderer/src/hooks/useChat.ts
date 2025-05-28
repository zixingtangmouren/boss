import { useMemoizedFn } from 'ahooks';
import { message } from 'antd';
import { useEffect, useState } from 'react';
import { AgentEntity } from 'src/main/agents/entites/agent.entity';
import { IpcMessage } from 'src/main/ipc/types';
import { MemoryEntity } from 'src/main/memony/entities/memony.entity';

type ChatMessage = Omit<MemoryEntity, 'createdAt' | 'updatedAt' | 'agentId'>;

export const useChat = (currentAgent: AgentEntity | null) => {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  useEffect(() => {
    getMemoryList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentAgent]);

  const getMemoryList = useMemoizedFn(async () => {
    if (!currentAgent?.id) return;
    const result = (await window.api.memonyService.getMemoryList(
      currentAgent?.id || ''
    )) as IpcMessage<MemoryEntity[]>;
    setChatMessages(result.data || []);
  });

  const chat = useMemoizedFn((query: string) => {
    setChatLoading(true);
    let content = '';

    if (!currentAgent?.id) {
      message.error('缺少agentid');
      return;
    }

    window.api.chatService.startSendMessage(
      { query, agentId: currentAgent?.id || '', inputs: [] },
      () => {
        console.log('start');
      },
      (chunk) => {
        console.log(chunk.data);
        // @ts-ignore(langchain/core/messages/ai.ts)
        content += chunk.data?.output || chunk.data;
        setChatMessages((prev) => {
          const orgMsg = prev.slice(0, -1);
          const aiMsg: ChatMessage = prev[prev.length - 1];
          aiMsg.content = content;
          return [...orgMsg, aiMsg];
        });
      },
      (e) => {
        if (!e.success) {
          setChatMessages((prev) => {
            const orgMsg = prev.slice(0, -1);
            const aiMsg: ChatMessage = prev[prev.length - 1];
            aiMsg.content = '出错了😭，请重试';
            return [...orgMsg, aiMsg];
          });
        }
        console.log('stop', e);
        setChatLoading(false);
      }
    );
  });

  const handleSendMessage = () => {
    if (!chatInput.trim() || !currentAgent) return;
    const userMsg: ChatMessage = {
      id: Date.now() + '-user',
      role: 'user',
      content: chatInput.trim()
    };
    const aiMsg: ChatMessage = {
      id: Date.now() + '-agent',
      role: 'agent',
      content: '正在思考...'
    };

    setChatMessages((prev) => [...prev, userMsg, aiMsg]);
    setChatInput('');
    setTimeout(() => {
      chat(chatInput.trim());
    });
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setChatInput(e.target.value);
  };

  return {
    chatMessages,
    chatInput,
    chatLoading,
    chatError,
    chat,
    handleSendMessage,
    handleMessageChange
  };
};
