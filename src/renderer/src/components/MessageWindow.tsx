import { Button, Input, Layout, Divider, Modal, Card } from 'antd';
import { useChat } from '@renderer/hooks/useChat';
import { useAgentsStore } from '@renderer/store/useAgentsStore';
import { useEffect, useRef, useState } from 'react';
import { useMcpService } from '@renderer/hooks/useMcpService';
import { UsbOutlined } from '@ant-design/icons';

const { Content } = Layout;

export const MessageWindow = () => {
  const chatListRef = useRef<HTMLDivElement>(null);

  const { selectedAgent } = useAgentsStore();

  const { chatMessages, chatInput, handleSendMessage, handleMessageChange } =
    useChat(selectedAgent);

  const { mcpServices, listLoading, registerMcpServer } = useMcpService();

  // 新增：控制 Modal 显隐
  const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);

  // 新增：控制 Mcp 服务 Modal 显隐
  const [isMcpModalOpen, setIsMcpModalOpen] = useState(false);

  // 新增：添加 MCP 服务 Modal 显隐
  const [isAddMcpModalOpen, setIsAddMcpModalOpen] = useState(false);

  // 新增：表单数据
  const [addMcpForm, setAddMcpForm] = useState({
    mcpServerName: '',
    command: '',
    serverScriptPath: ''
  });

  // 新增：表单 loading
  const [addMcpLoading, setAddMcpLoading] = useState(false);

  // 点击 agent 名称时弹窗
  const handleAgentNameClick = () => {
    if (selectedAgent) setIsAgentModalOpen(true);
  };

  // 关闭弹窗
  const handleModalClose = () => {
    setIsAgentModalOpen(false);
  };

  // 新增：点击 Usb 图标时弹窗
  const handleUsbIconClick = () => {
    setIsMcpModalOpen(true);
  };

  // 新增：关闭 Mcp 服务弹窗
  const handleMcpModalClose = () => {
    setIsMcpModalOpen(false);
  };

  // 打开添加 MCP 服务弹窗
  const handleAddMcpClick = () => {
    setIsAddMcpModalOpen(true);
  };

  // 关闭添加 MCP 服务弹窗
  const handleAddMcpModalClose = () => {
    setIsAddMcpModalOpen(false);
    setAddMcpForm({ mcpServerName: '', command: '', serverScriptPath: '' });
  };

  // 表单输入变更
  const handleAddMcpFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddMcpForm({ ...addMcpForm, [e.target.name]: e.target.value });
  };

  // 提交表单
  const handleAddMcpSubmit = async () => {
    if (!addMcpForm.mcpServerName || !addMcpForm.command || !addMcpForm.serverScriptPath) return;
    setAddMcpLoading(true);
    await registerMcpServer(
      addMcpForm.mcpServerName,
      addMcpForm.command,
      addMcpForm.serverScriptPath
    );
    setAddMcpLoading(false);
    handleAddMcpModalClose();
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
            <div>
              <span style={{ cursor: 'pointer' }} onClick={handleAgentNameClick}>
                {selectedAgent.icon || '🤖'} {selectedAgent.name}
              </span>
              <UsbOutlined
                style={{ marginLeft: 8, cursor: 'pointer' }}
                onClick={handleUsbIconClick}
              />
            </div>
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

      {/* MCP 服务状态 Modal */}
      <Modal
        title="MCP 服务状态"
        open={isMcpModalOpen}
        onCancel={handleMcpModalClose}
        footer={null}
      >
        {listLoading ? (
          <div>加载中...</div>
        ) : (
          <div>
            {mcpServices && mcpServices.length > 0 ? (
              <Card title="已注册 MCP 服务列表" style={{ marginBottom: 16 }}>
                <ul style={{ paddingLeft: 0 }}>
                  {mcpServices.map((item) => (
                    <li key={item.mcpServerName} style={{ marginBottom: 8, listStyle: 'none' }}>
                      <b>{item.mcpServerName}</b>：
                      <span style={{ color: item.status === 'connected' ? 'green' : 'red' }}>
                        {item.status === 'connected' ? '已连接' : '未连接'}
                      </span>
                    </li>
                  ))}
                </ul>
              </Card>
            ) : (
              <div>
                <div>暂无 MCP 服务</div>
              </div>
            )}
          </div>
        )}
        <Button size="small" onClick={handleAddMcpClick}>
          添加 MCP 服务
        </Button>
      </Modal>

      {/* 添加 MCP 服务 Modal */}
      <Modal
        title="添加 MCP 服务"
        open={isAddMcpModalOpen}
        onCancel={handleAddMcpModalClose}
        onOk={handleAddMcpSubmit}
        confirmLoading={addMcpLoading}
        okText="提交"
        cancelText="取消"
        destroyOnClose
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <b>MCP 服务名称：</b>
            <Input
              name="mcpServerName"
              value={addMcpForm.mcpServerName}
              onChange={handleAddMcpFormChange}
              placeholder="请输入 MCP 服务名称"
            />
          </div>
          <div>
            <b>Command：</b>
            <Input
              name="command"
              value={addMcpForm.command}
              onChange={handleAddMcpFormChange}
              placeholder="请输入启动命令"
            />
          </div>
          <div>
            <b>Server Script 路径：</b>
            <Input
              name="serverScriptPath"
              value={addMcpForm.serverScriptPath}
              onChange={handleAddMcpFormChange}
              placeholder="请输入 server script 路径"
            />
          </div>
        </div>
      </Modal>
    </Content>
  );
};
