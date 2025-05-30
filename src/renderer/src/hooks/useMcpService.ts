import { McpEntityWithStatus, useMcpServicesStore } from '@renderer/store/useMcpServicesStore';
import { useMount } from 'ahooks';
import { message } from 'antd';
import { useRef, useState } from 'react';
import { IpcMessage } from 'src/main/ipc/types';

export const useMcpService = () => {
  const { mcpServices, setMcpServices } = useMcpServicesStore();
  const [listLoading, setListLoading] = useState(false);
  const jsonRef = useRef<string>('');
  const [addMcpLoading, setAddMcpLoading] = useState(false);

  const registerMcpServer = async () => {
    setAddMcpLoading(true);
    const json = JSON.parse(jsonRef.current);
    try {
      const res = (await window.api.mcpService.registerMcpServer(json.mcpServers)) as IpcMessage<{
        success: boolean;
      }>;
      console.log('registerMcpServer res >>>', res);

      if (res.data.success) {
        message.success('MCP 服务注册成功');
        getMcpServerList();
      } else {
        message.error('MCP 服务注册失败');
      }
    } catch {
      message.error('MCP 服务注册失败');
    } finally {
      setAddMcpLoading(false);
    }
  };

  const getMcpServerList = async () => {
    setListLoading(true);
    const mcpServerListWithStatus = await window.api.mcpService.getMcpServerList();
    setMcpServices(mcpServerListWithStatus.data as McpEntityWithStatus[]);
    console.log('mcpServerList >>>', mcpServerListWithStatus.data);
    setListLoading(false);
  };

  const handleEditorChange = (value?: string) => {
    jsonRef.current = value || '';
  };

  useMount(async () => {
    getMcpServerList();
  });

  return {
    mcpServices,
    listLoading,
    addMcpLoading,
    registerMcpServer,
    handleEditorChange
  };
};
