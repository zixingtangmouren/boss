import { useMount } from 'ahooks';
import { useState } from 'react';
import { ModelEntity } from 'src/main/models/entites/model.entity';
import { message } from 'antd';
import { CreateModelDto } from 'src/main/models/dto/create-model.dto';

export const useModels = () => {
  const [models, setModels] = useState<ModelEntity[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useMount(() => {
    fetchModels();
  });

  const fetchModels = () => {
    setListLoading(true);
    setError(null);
    window.api.modelsService.getModels().then((res: any) => {
      const data = res?.data || {};
      if (data.success) {
        setModels(data?.data || []);
      }
      setListLoading(false);
    });
  };

  const createModel = async (createModelDto: CreateModelDto) => {
    try {
      setCreateLoading(true);
      setError(null);
      await window.api.modelsService.createModel(createModelDto);
      fetchModels();
      message.success('创建成功');
    } catch {
      message.error('创建失败');
    } finally {
      setCreateLoading(false);
    }
  };

  return { models, listLoading, createLoading, error, createModel };
};
