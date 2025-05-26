import { Button, Input, Layout, Divider, Modal } from 'antd';
import { useChat } from '@renderer/hooks/useChat';
import { useAgentsStore } from '@renderer/store/useAgentsStore';
import { useEffect, useRef, useState } from 'react';

const { Content } = Layout;

export const MessageWindow = () => {
  const chatListRef = useRef<HTMLDivElement>(null);

  const { selectedAgent } = useAgentsStore();

  const { chatMessages, chatInput, handleSendMessage, handleMessageChange } =
    useChat(selectedAgent);

  // 新增：控制 Modal 显隐
  const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);

  // 点击 agent 名称时弹窗
  const handleAgentNameClick = () => {
    if (selectedAgent) setIsAgentModalOpen(true);
  };

  // 关闭弹窗
  const handleModalClose = () => {
    setIsAgentModalOpen(false);
  };

  useEffect(() => {
    // 聊天滚动到底部
    if (chatListRef.current) {
      chatListRef.current.scrollTop = chatListRef.current.scrollHeight;
    }
  }, [chatMessages]);

  return (
    <Content
      style={{ background: '#f7f8fa', display: 'flex', flexDirection: 'column', height: '100vh' }}
    >
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          padding: 24,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <div style={{ fontWeight: 500, fontSize: 18, marginBottom: 16, color: '#222' }}>
          {selectedAgent ? (
            <span style={{ cursor: 'pointer' }} onClick={handleAgentNameClick}>
              {selectedAgent.icon || '🤖'} {selectedAgent.name}
            </span>
          ) : (
            <span>请选择一个智能体开始聊天</span>
          )}
        </div>
        <Divider style={{ margin: '8px 0' }} />
        <div
          ref={chatListRef}
          style={{
            flex: 1,
            overflowY: 'auto',
            background: '#fff',
            borderRadius: 8,
            padding: 16,
            boxShadow: '0 1px 3px #0001',
            marginBottom: 16
          }}
        >
          {selectedAgent ? (
            chatMessages.length === 0 ? (
              <div style={{ color: '#aaa', textAlign: 'center', marginTop: 40 }}>
                暂无聊天记录，快来发一条吧！
              </div>
            ) : (
              chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    marginBottom: 12
                  }}
                >
                  <div
                    style={{
                      background: msg.role === 'user' ? '#1677ff' : '#f1f1f1',
                      color: msg.role === 'user' ? '#fff' : '#222',
                      borderRadius: 16,
                      padding: '8px 16px',
                      maxWidth: 360,
                      wordBreak: 'break-all',
                      boxShadow: msg.role === 'user' ? '0 2px 8px #1677ff22' : '0 1px 3px #0001'
                    }}
                  >
                    {msg.content}
                  </div>
                </div>
              ))
            )
          ) : null}
        </div>
      </div>
      <div
        style={{
          padding: 16,
          background: '#fff',
          borderTop: '1px solid #eee',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <Input.TextArea
          value={chatInput}
          onChange={handleMessageChange}
          onPressEnter={(e) => {
            if (!e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          placeholder={
            selectedAgent ? '请输入消息，Enter发送，Shift+Enter换行' : '请先选择一个智能体'
          }
          autoSize={{ minRows: 1, maxRows: 4 }}
          disabled={!selectedAgent}
          style={{ marginRight: 8, borderRadius: 8 }}
        />
        <Button
          type="primary"
          onClick={handleSendMessage}
          disabled={!chatInput.trim() || !selectedAgent}
        >
          发送
        </Button>
      </div>

      {/* Agent 信息 Modal */}
      <Modal
        title={selectedAgent ? `${selectedAgent.icon || '🤖'} ${selectedAgent.name}` : '智能体信息'}
        open={isAgentModalOpen}
        onCancel={handleModalClose}
        footer={null}
      >
        {selectedAgent ? (
          <div>
            <div>
              <b>名称：</b>
              {selectedAgent.name}
            </div>
            <div>
              <b>描述：</b>
              {selectedAgent.description || '暂无描述'}
            </div>
            {/* 可根据实际 agent 字段补充更多信息 */}
          </div>
        ) : null}
      </Modal>
    </Content>
  );
};
