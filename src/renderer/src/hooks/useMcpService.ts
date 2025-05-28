import { useMount } from 'ahooks';
import { message } from 'antd';
import { useMemo, useState } from 'react';
import { IpcMessage } from 'src/main/ipc/types';
import { useAgentsStore } from '@renderer/store/useAgentsStore';
import { McpEntityWithStatus, useMcpServicesStore } from '@renderer/store/useMcpServicesStore';

export const useMcpService = () => {
  const { mcpServices, setMcpServices } = useMcpServicesStore();
  const [listLoading, setListLoading] = useState(false);
  const { selectedAgent } = useAgentsStore();

  const currentAgentBingMcpServer = useMemo(() => {
    if (!selectedAgent) return null;
    return mcpServices.find((item) => selectedAgent.mcpServerIds.includes(item.mcpServerName));
  }, [mcpServices, selectedAgent]);

  const registerMcpServer = async (
    mcpServerName: string,
    command: string,
    serverScriptPath: string
  ) => {
    const res = (await window.api.mcpService.registerMcpServer({
      mcpServerName,
      command,
      serverScriptPath
    })) as IpcMessage<{ success: boolean }>;
    console.log('res >>>', res);

    if (res.data.success) {
      message.success('MCP 服务注册成功');
      getMcpServerList();
    } else {
      message.error('MCP 服务注册失败');
    }
  };

  const getMcpServerList = async () => {
    setListLoading(true);
    const mcpServerListWithStatus = await window.api.mcpService.getMcpServerList();
    setMcpServices(mcpServerListWithStatus.data as McpEntityWithStatus[]);
    console.log('mcpServerList >>>', mcpServerListWithStatus.data);
    setListLoading(false);
  };

  useMount(async () => {
    getMcpServerList();
  });

  return {
    currentAgentBingMcpServer,
    mcpServices,
    listLoading,
    registerMcpServer
  };
};
