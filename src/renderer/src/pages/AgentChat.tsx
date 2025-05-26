import { Layout } from 'antd';
import './AgentChat.less';
import { MessageWindow } from '@renderer/components/MessageWindow';
import AgentList from '@renderer/components/AgentList';

const AgentChat = () => {
  return (
    <Layout style={{ height: '100vh', background: '#f7f8fa' }} className="agent-chat">
      <AgentList />
      <MessageWindow />
    </Layout>
  );
};

export default AgentChat;
