import { useEffect, useState, useRef } from 'react';
import {
  Button,
  List,
  Modal,
  Form,
  Input,
  message,
  Spin,
  Typography,
  Space,
  Select,
  Layout,
  Divider
} from 'antd';
import { ModelEntity } from '../../../main/models/entites/model.entity';
import './AgentChat.less';
import { useMemoizedFn } from 'ahooks';

const { Text } = Typography;
const { Sider, Content } = Layout;

interface Agent {
  id: string;
  name: string;
  description?: string;
  icon?: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'agent';
  content: string;
}

const AgentList = () => {
  const [models, setModels] = useState<ModelEntity[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form] = Form.useForm();
  const [showModelModal, setShowModelModal] = useState(false);
  const [creatingModel, setCreatingModel] = useState(false);
  const [modelForm] = Form.useForm();
  const [showModelListModal, setShowModelListModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const chatListRef = useRef<HTMLDivElement>(null);

  const fetchAgents = () => {
    setLoading(true);
    setError(null);
    window.api.agentsService
      .getAgents()
      .then((res: any) => {
        setAgents(res?.data || []);
        // 默认选中第一个
        if (!selectedAgent && res?.data?.length) {
          setSelectedAgent(res.data[0]);
        }
      })
      .catch(() => {
        setError('获取智能体列表失败');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const fetchModels = () => {
    setLoading(true);
    setError(null);
    window.api.modelsService.getModels().then((res: any) => {
      const data = res?.data || {};
      if (data.success) {
        setModels(data?.data || []);
      }
    });
  };

  const chat = useMemoizedFn((query: string) => {
    let content = '';
    const orgMsg = chatMessages.slice();

    window.api.chatService.startSendMessage(
      { query, agentId: '76d353bc-419f-4c41-9ad6-0b7c4d65b66e', inputs: [] },
      (chunk) => {
        console.log(chunk.data);
        content += chunk.data;
        setChatMessages(() => [
          ...orgMsg,
          {
            id: Date.now() + '-agent',
            role: 'agent',
            content
          }
        ]);
      },
      (e) => {
        console.log('sotp', e);
      }
    );
  });

  useEffect(() => {
    fetchAgents();
    fetchModels();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    // 聊天滚动到底部
    if (chatListRef.current) {
      chatListRef.current.scrollTop = chatListRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      setCreating(true);
      await window.api.agentsService.createAgent({
        name: values.name,
        description: values.description,
        prompt: values.prompt,
        icon: values.icon || '🤖',
        modelId: values.modelId
      });
      setShowForm(false);
      form.resetFields();
      fetchAgents();
      message.success('创建成功');
    } catch (err: any) {
      if (err?.errorFields) return; // 表单校验错误
      message.error('创建失败');
    } finally {
      setCreating(false);
    }
  };

  const handleCreateModel = async () => {
    try {
      const values = await modelForm.validateFields();
      setCreatingModel(true);
      await window.api.modelsService.createModel(values);
      setShowModelModal(false);
      modelForm.resetFields();
      fetchModels();
      message.success('模型创建成功');
    } catch (err: any) {
      if (err?.errorFields) return;
      message.error('模型创建失败');
    } finally {
      setCreatingModel(false);
    }
  };

  const handleSendMessage = () => {
    if (!chatInput.trim() || !selectedAgent) return;
    const userMsg: ChatMessage = {
      id: Date.now() + '-user',
      role: 'user',
      content: chatInput.trim()
    };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput('');
    setTimeout(() => {
      chat(chatInput.trim());
    });

    // 这里可以模拟 agent 回复
    // setTimeout(() => {

    // }, 800);
  };

  return (
    <Layout style={{ height: '100vh', background: '#f7f8fa' }} className="agent-chat">
      <Sider
        width={320}
        style={{
          background: '#fff',
          borderRight: '1px solid #eee',
          padding: 0,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <div style={{ padding: 16, borderBottom: '1px solid #eee', background: '#fafbfc' }}>
          <Space>
            <Button size="small" onClick={() => setShowModelListModal(true)}>
              查看所有模型
            </Button>
            <Button size="small" onClick={() => setShowModelModal(true)}>
              创建模型
            </Button>
            <Button size="small" type="primary" onClick={() => setShowForm(true)}>
              创建智能体
            </Button>
          </Space>
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: 0 }}>
          {loading ? (
            <Spin tip="加载中..." style={{ margin: 32 }} />
          ) : error ? (
            <Text type="danger" style={{ margin: 16 }}>
              {error}
            </Text>
          ) : (
            <List
              itemLayout="horizontal"
              dataSource={agents}
              locale={{ emptyText: '暂无智能体' }}
              renderItem={(agent) => (
                <List.Item
                  style={{
                    cursor: 'pointer',
                    background: selectedAgent?.id === agent.id ? '#e6f4ff' : undefined,
                    borderLeft:
                      selectedAgent?.id === agent.id
                        ? '4px solid #1677ff'
                        : '4px solid transparent',
                    paddingLeft: 12
                  }}
                  onClick={() => setSelectedAgent(agent)}
                >
                  <List.Item.Meta
                    avatar={<span style={{ fontSize: 24 }}>{agent.icon || '🤖'}</span>}
                    title={<strong>{agent.name}</strong>}
                    description={agent.description}
                  />
                </List.Item>
              )}
            />
          )}
        </div>
      </Sider>
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
              <span>
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
            onChange={(e) => setChatInput(e.target.value)}
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
      </Content>
      {/* 模型列表弹窗 */}
      <Modal
        title="模型列表"
        open={showModelListModal}
        onCancel={() => setShowModelListModal(false)}
        footer={null}
        destroyOnClose
      >
        <List
          bordered
          dataSource={models}
          locale={{ emptyText: '暂无模型' }}
          renderItem={(model) => (
            <List.Item>
              <div>
                <strong>{model.modelName}</strong>
                <div style={{ fontSize: 12, color: '#888' }}>Base URL: {model.baseUrl}</div>
                <div style={{ fontSize: 12, color: '#888' }}>API Key: {model.apiKey}</div>
              </div>
            </List.Item>
          )}
        />
      </Modal>
      {/* 创建模型弹窗 */}
      <Modal
        title="创建模型"
        open={showModelModal}
        onCancel={() => {
          setShowModelModal(false);
          modelForm.resetFields();
        }}
        onOk={handleCreateModel}
        confirmLoading={creatingModel}
        okText="提交"
        cancelText="取消"
        destroyOnClose
      >
        <Form form={modelForm} layout="vertical">
          <Form.Item
            name="modelName"
            label="模型名称"
            rules={[{ required: true, message: '请输入模型名称' }]}
          >
            <Input placeholder="请输入模型名称" disabled={creatingModel} />
          </Form.Item>
          <Form.Item
            name="baseUrl"
            label="Base URL"
            rules={[{ required: true, message: '请输入 Base URL' }]}
          >
            <Input placeholder="请输入 Base URL" disabled={creatingModel} />
          </Form.Item>
          <Form.Item
            name="apiKey"
            label="API Key"
            rules={[{ required: true, message: '请输入 API Key' }]}
          >
            <Input placeholder="请输入 API Key" disabled={creatingModel} />
          </Form.Item>
        </Form>
      </Modal>
      {/* 创建智能体弹窗 */}
      <Modal
        title="创建智能体"
        open={showForm}
        onCancel={() => {
          setShowForm(false);
          form.resetFields();
        }}
        onOk={handleCreate}
        confirmLoading={creating}
        okText="提交"
        cancelText="取消"
        destroyOnClose
      >
        <Form form={form} layout="vertical" initialValues={{ icon: '🤖' }}>
          <Form.Item name="name" label="名称" rules={[{ required: true, message: '名称不能为空' }]}>
            <Input placeholder="请输入名称" disabled={creating} autoFocus />
          </Form.Item>
          <Form.Item name="description" label="描述（可选）">
            <Input placeholder="请输入描述" disabled={creating} />
          </Form.Item>
          <Form.Item
            name="prompt"
            label="Prompt"
            rules={[{ required: true, message: 'Prompt 不能为空' }]}
          >
            <Input placeholder="请输入 Prompt" disabled={creating} />
          </Form.Item>
          <Form.Item
            name="icon"
            label="图标（emoji，默认🤖）"
            rules={[{ max: 2, message: '最多2个字符' }]}
          >
            <Input
              placeholder="请输入 emoji"
              disabled={creating}
              maxLength={2}
              style={{ width: 80 }}
            />
          </Form.Item>
          <Form.Item name="modelId" label="模型">
            <Select
              options={models.map((model) => ({ label: model.modelName, value: model.id }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default AgentList;
