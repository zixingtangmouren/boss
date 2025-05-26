import { Layout, Space, Button, List, Spin, Modal, Form, Input, Typography, Select } from 'antd';
import { useAgents } from '@renderer/hooks/useAgents';
import { useState } from 'react';
import { useModels } from '@renderer/hooks/useModels';

const { Sider } = Layout;

function AgentList() {
  const {
    agents,
    selectedAgent,
    createLoading: creating,
    listLoading: agentsListLoading,
    error,
    handleSelectAgent,
    createAgent
  } = useAgents();

  const { models, createModel, createLoading: creatingModel } = useModels();

  const [form] = Form.useForm();
  const [modelForm] = Form.useForm();

  const [showForm, setShowForm] = useState(false);
  const [showModelModal, setShowModelModal] = useState(false);
  const [showModelListModal, setShowModelListModal] = useState(false);

  const handleAgentCreate = async () => {
    const values = await form.validateFields();
    await createAgent({
      name: values.name,
      description: values.description,
      prompt: values.prompt,
      icon: values.icon || '🤖',
      modelId: values.modelId
    });
    setShowForm(false);
    form.resetFields();
  };

  const handleCreateModel = async () => {
    const values = await modelForm.validateFields();
    await createModel({
      modelName: values.modelName,
      baseUrl: values.baseUrl,
      apiKey: values.apiKey
    });
    setShowModelModal(false);
    modelForm.resetFields();
  };

  return (
    <>
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
          {agentsListLoading ? (
            <Spin tip="加载中..." style={{ margin: 32 }} />
          ) : error ? (
            <Typography.Text type="danger" style={{ margin: 16 }}>
              {error}
            </Typography.Text>
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
                  onClick={() => handleSelectAgent(agent)}
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
        onOk={handleAgentCreate}
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
    </>
  );
}

export default AgentList;
