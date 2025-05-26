import { useMount } from 'ahooks';
import { message } from 'antd';
import { useState } from 'react';
import { AgentEntity } from 'src/main/agents/entites/agent.entity';
import { CreateAgentDto } from 'src/main/agents/dto/create-agent.dto';
import { useAgentsStore } from '@renderer/store/useAgentsStore';

export const useAgents = () => {
  const { agents, setAgents, selectedAgent, setSelectedAgent } = useAgentsStore();
  const [listLoading, setListLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useMount(() => {
    fetchAgents();
  });

  const fetchAgents = () => {
    setListLoading(true);
    setError(null);
    window.api.agentsService.getAgents().then((res: any) => {
      setAgents(res?.data || []);

      if (!selectedAgent && res?.data?.length) {
        setSelectedAgent(res.data[0]);
      }

      setListLoading(false);
    });
  };

  const handleSelectAgent = (agent: AgentEntity) => {
    setSelectedAgent(agent);
  };

  const createAgent = async (createAgentDto: CreateAgentDto) => {
    try {
      setCreateLoading(true);
      setError(null);
      await window.api.agentsService.createAgent(createAgentDto);
      fetchAgents();
      message.success('创建成功');
    } catch {
      message.error('创建失败');
    } finally {
      setCreateLoading(false);
    }
  };

  return {
    agents,
    selectedAgent,
    listLoading,
    createLoading,
    error,
    handleSelectAgent,
    createAgent
  };
};
